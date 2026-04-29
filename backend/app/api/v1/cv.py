# backend/app/api/v1/cv.py
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.utils.security import get_current_user
from app.utils.s3 import upload_to_s3
from app.tasks.cv_tasks import parse_cv_task
from app.models.user import User
from app.models.cv import CVDocument
from app.schemas.cv import CVUploadResponse, CVStatusResponse

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "application/msword",
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_SIZE_MB = 10


@router.post("/upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PDF and Word documents are accepted")

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File must be under {MAX_SIZE_MB}MB")

    # Upload to S3
    s3_key = f"cvs/{current_user.id}/{uuid.uuid4()}/{file.filename}"
    await upload_to_s3(contents, s3_key, file.content_type)

    # Save record
    cv_doc = CVDocument(
        user_id=current_user.id,
        s3_key=s3_key,
        filename=file.filename,
        file_size_bytes=len(contents),
        parse_status="pending",
        is_active=True,
    )
    db.add(cv_doc)
    await db.commit()
    await db.refresh(cv_doc)

    # Deactivate previous CVs
    await db.execute(
        "UPDATE cv_documents SET is_active=false WHERE user_id=:uid AND id!=:cid",
        {"uid": current_user.id, "cid": cv_doc.id}
    )
    await db.commit()

    # Queue Celery task
    task = parse_cv_task.delay(str(cv_doc.id), s3_key, str(current_user.id))

    return CVUploadResponse(
        cv_id=str(cv_doc.id),
        task_id=task.id,
        filename=file.filename,
        status="pending",
        message="CV uploaded. Parsing in progress.",
    )


@router.get("/status/{cv_id}", response_model=CVStatusResponse)
async def get_cv_status(
    cv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cv_doc = await db.get(CVDocument, cv_id)
    if not cv_doc or cv_doc.user_id != current_user.id:
        raise HTTPException(404, "CV not found")
    return CVStatusResponse(
        cv_id=cv_id,
        status=cv_doc.parse_status,
        parsed_data=cv_doc.parsed_data if cv_doc.parse_status == "done" else None,
        error=cv_doc.parse_error,
    )


@router.websocket("/ws/status/{cv_id}")
async def cv_parse_progress(
    websocket: WebSocket,
    cv_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Real-time parse progress via WebSocket."""
    await websocket.accept()
    import asyncio
    from app.models.cv import CVDocument

    for _ in range(60):  # poll up to 60s
        cv_doc = await db.get(CVDocument, cv_id)
        if not cv_doc:
            await websocket.send_json({"status": "error", "message": "CV not found"})
            break
        await websocket.send_json({"status": cv_doc.parse_status})
        if cv_doc.parse_status in ("done", "failed"):
            break
        await asyncio.sleep(1)

    await websocket.close()