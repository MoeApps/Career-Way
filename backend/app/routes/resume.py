from fastapi import APIRouter, UploadFile, File
from app.services.resume_parser import parse_resume

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    result = await parse_resume(file)
    return result