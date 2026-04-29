import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileText, X, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UploadCV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [target, setTarget] = useState("");
  const [skills, setSkills] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    if (!/pdf|word|docx?$/i.test(f.type + f.name)) { toast.error("PDF or DOCX only"); return; }
    setFile(f);
  };

  const analyze = () => {
    if (!file) { toast.error("Upload your CV first"); return; }
    if (!target.trim()) { toast.error("Add a target role"); return; }
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      toast.success("Analysis complete!");
      navigate("/results");
    }, 2000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Step 1 of 3</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-1">Upload your <span className="text-gradient">CV</span>.</h1>
          <p className="text-muted-foreground mt-2">We'll parse your skills, experience and projects in seconds.</p>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0] ?? null); }}
          className={`relative p-12 rounded-3xl border-2 border-dashed transition-smooth text-center
            ${drag ? "border-primary bg-primary/5" : "border-border bg-card"}
            ${file ? "border-success/40 bg-success/5" : ""}`}
        >
          {!file ? (
            <>
              <div className="mx-auto h-20 w-20 rounded-3xl bg-hero-gradient grid place-items-center shadow-glow mb-5 animate-float">
                <UploadCloud className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">Drop your CV here</h3>
              <p className="text-muted-foreground text-sm mt-1">PDF or DOCX, up to 10MB</p>
              <label className="inline-block mt-5">
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={e => onFile(e.target.files?.[0] ?? null)} />
                <span className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-foreground text-background font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                  Choose file
                </span>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-success/15 grid place-items-center">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold flex items-center gap-2"><FileText className="h-4 w-4" />{file.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{(file.size / 1024).toFixed(0)} KB · ready</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X /></Button>
            </div>
          )}
        </div>

        {/* Target role + skills */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
            <Label htmlFor="target" className="font-display text-base">Target role</Label>
            <Input id="target" placeholder="e.g. Machine Learning Engineer" value={target} onChange={e => setTarget(e.target.value)} maxLength={100} className="h-12 rounded-xl" />
            <p className="text-xs text-muted-foreground">We'll benchmark your CV against this role.</p>
          </div>
          <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
            <Label htmlFor="skills" className="font-display text-base">Skills & interests <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea id="skills" placeholder="PyTorch, RAG, computer vision..." value={skills} onChange={e => setSkills(e.target.value)} maxLength={500} className="min-h-[3rem] rounded-xl" />
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-mesh border border-border/60">
          <div>
            <div className="font-display font-bold">Ready to analyze?</div>
            <div className="text-sm text-muted-foreground">Takes about 30 seconds.</div>
          </div>
          <Button variant="hero" size="lg" onClick={analyze} disabled={analyzing}>
            {analyzing ? <>Analyzing...</> : <>Analyze CV <Sparkles /></>}
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default UploadCV;
