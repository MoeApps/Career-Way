import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, ExternalLink, MapPin, Rocket, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";

const skills = {
  have: ["Python", "PyTorch", "SQL", "Pandas", "Git", "FastAPI", "Docker", "REST APIs", "scikit-learn", "Jupyter"],
  missing: [
    { name: "System Design", priority: "Critical", weeks: 6 },
    { name: "MLOps (MLflow, Kubeflow)", priority: "Critical", weeks: 4 },
    { name: "Distributed Training", priority: "High", weeks: 3 },
    { name: "LLM Fine-tuning (LoRA)", priority: "High", weeks: 2 },
    { name: "Kubernetes", priority: "Medium", weeks: 3 },
  ],
};

const projects = [
  { title: "End-to-end RAG search engine", impact: "+18 score", tags: ["LLM", "Vector DB", "FastAPI"], time: "2 weeks" },
  { title: "MLOps pipeline with MLflow + Airflow", impact: "+15 score", tags: ["MLOps", "Airflow"], time: "3 weeks" },
  { title: "Fine-tune Llama-3 with LoRA on domain data", impact: "+12 score", tags: ["LLM", "PEFT"], time: "1 week" },
  { title: "Distributed PyTorch image classifier", impact: "+10 score", tags: ["PyTorch", "DDP"], time: "2 weeks" },
  { title: "Real-time anomaly detection on Kafka", impact: "+8 score", tags: ["Streaming", "ML"], time: "2 weeks" },
];

const roadmap = [
  { week: "Week 1–2", focus: "System Design fundamentals", what: "Designing Data-Intensive Applications · Ch 1–4. Build a URL shortener." },
  { week: "Week 3–4", focus: "MLOps with MLflow + DVC", what: "Track experiments, version data. Deploy your RAG project." },
  { week: "Week 5–6", focus: "Distributed training", what: "PyTorch DDP on a cloud GPU. Train CIFAR-100 across 2 GPUs." },
  { week: "Week 7–8", focus: "LLM fine-tuning", what: "LoRA on Llama-3 with HuggingFace PEFT. Open source the adapter." },
  { week: "Week 9–10", focus: "Kubernetes for ML", what: "Deploy your model with Kubeflow on a free cluster." },
  { week: "Week 11–12", focus: "Interview prep + apply", what: "5 mock interviews, polish portfolio, apply to top 24 matches." },
];

const jobs = [
  { role: "ML Engineer (Intern)", co: "Anthropic", loc: "Remote", fit: 94, salary: "$85k", tags: ["LLM", "Python"] },
  { role: "AI Research Engineer", co: "OpenAI", loc: "San Francisco", fit: 89, salary: "$160k", tags: ["PyTorch", "Research"] },
  { role: "Data Scientist", co: "Stripe", loc: "Remote · EU", fit: 82, salary: "$120k", tags: ["SQL", "ML"] },
  { role: "Applied Scientist", co: "DeepMind", loc: "London", fit: 79, salary: "£95k", tags: ["RL", "Python"] },
  { role: "ML Platform Engineer", co: "Hugging Face", loc: "Remote", fit: 76, salary: "$135k", tags: ["MLOps", "K8s"] },
];

const Results = () => (
  <AppShell>
    <div className="space-y-8">
      {/* header + score */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-hero-gradient animate-gradient shadow-elevated text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-widest opacity-80">Analysis complete · 30 seconds ago</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Your readiness for ML Engineer</h1>
            <div className="mt-6 flex items-end gap-3">
              <div className="font-display text-7xl font-bold">87</div>
              <div className="text-xl opacity-80 mb-2">/ 100</div>
            </div>
            <Button asChild variant="glass" className="mt-6"><Link to="/upload">Re-analyze <Sparkles /></Link></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["Skill match", "72%"], ["Project depth", "91%"], ["Repo activity", "84%"], ["Market fit", "88%"]].map(([l, v]) => (
            <div key={l} className="p-5 rounded-2xl bg-card border border-border/60">
              <div className="text-xs font-mono text-muted-foreground">{l}</div>
              <div className="font-display text-3xl font-bold mt-1">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-full h-auto">
          {[
            ["skills", "Skills", Target],
            ["projects", "Projects", Rocket],
            ["roadmap", "Roadmap", Calendar],
            ["jobs", "Jobs", Briefcase],
          ].map(([v, l, Icon]) => (
            <TabsTrigger key={v as string} value={v as string} className="rounded-full gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft px-5 py-2">
              {/* @ts-expect-error icon as comp */}
              <Icon className="h-4 w-4" /> {l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* SKILLS */}
        <TabsContent value="skills" className="mt-6 grid md:grid-cols-2 gap-5">
          <div className="p-6 rounded-3xl bg-card border border-border/60">
            <h3 className="font-display text-xl font-bold mb-1">You already have</h3>
            <p className="text-sm text-muted-foreground mb-4">Detected from CV + GitHub</p>
            <div className="flex flex-wrap gap-2">
              {skills.have.map(s => <Badge key={s} variant="secondary" className="rounded-full px-3 py-1">{s}</Badge>)}
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-card border border-border/60">
            <h3 className="font-display text-xl font-bold mb-4">Missing for your target role</h3>
            <div className="space-y-3">
              {skills.missing.map(m => (
                <div key={m.name} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40">
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">~{m.weeks} weeks to learn</div>
                  </div>
                  <Badge variant={m.priority === "Critical" ? "destructive" : "outline"} className="rounded-full">{m.priority}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* PROJECTS */}
        <TabsContent value="projects" className="mt-6 grid md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <div key={p.title} className="p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/40 transition-smooth">
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-xs text-muted-foreground">PROJECT {i + 1}</span>
                <Badge className="bg-success/15 text-success border-0 rounded-full">{p.impact}</Badge>
              </div>
              <h3 className="font-display text-lg font-bold">{p.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.tags.map(t => <Badge key={t} variant="secondary" className="rounded-full text-[10px]">{t}</Badge>)}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">⏱ {p.time}</span>
                <Button size="sm" variant="ghost">Start <ExternalLink /></Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ROADMAP */}
        <TabsContent value="roadmap" className="mt-6">
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />
            {roadmap.map((r, i) => (
              <div key={r.week} className="relative mb-6">
                <div className="absolute -left-[1.6rem] h-4 w-4 rounded-full bg-hero-gradient shadow-glow ring-4 ring-background" />
                <div className="p-5 rounded-2xl bg-card border border-border/60">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-primary">{r.week}</span>
                    <span className="font-display font-bold">{r.focus}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.what}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* JOBS */}
        <TabsContent value="jobs" className="mt-6 space-y-3">
          {jobs.map(j => (
            <div key={j.role + j.co} className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-smooth flex flex-wrap items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-display font-bold">
                {j.co[0]}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-display font-bold">{j.role}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-3">
                  <span>{j.co}</span>
                  <span className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" />{j.loc}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {j.tags.map(t => <Badge key={t} variant="secondary" className="rounded-full text-[10px]">{t}</Badge>)}
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold text-gradient">{j.fit}%</div>
                <div className="text-xs font-mono text-muted-foreground">{j.salary}</div>
              </div>
              <Button variant="gradient" size="sm">Apply</Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  </AppShell>
);

export default Results;
