import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Briefcase, BookOpen, Rocket, Target, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const FunnelStage = ({ n, label, value, icon: Icon, accent, to }: { n: string; label: string; value: string; icon: React.ElementType; accent: string; to: string }) => (
  <Link to={to} className="group relative block">
    <div className={`relative p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-smooth hover:shadow-elevated overflow-hidden`}>
      <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full ${accent} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div className={`h-11 w-11 rounded-2xl ${accent} grid place-items-center shadow-glow`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{n}</span>
      </div>
      <div className="relative mt-5">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-3xl font-bold mt-1">{value}</div>
      </div>
      <ArrowUpRight className="absolute bottom-5 right-5 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const name = user?.email?.split("@")[0] ?? "builder";

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Dashboard</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-1">
              Hey <span className="text-gradient capitalize">{name}</span> 👋
            </h1>
            <p className="text-muted-foreground mt-2">Here's your career readiness funnel today.</p>
          </div>
          <Button asChild variant="hero" size="lg">
            <Link to="/upload">Run new analysis <Sparkles /></Link>
          </Button>
        </div>

        {/* Hero score banner */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 bg-hero-gradient animate-gradient shadow-elevated">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative grid md:grid-cols-3 gap-6 items-center text-primary-foreground">
            <div className="md:col-span-2">
              <div className="text-xs font-mono uppercase tracking-widest opacity-80">Employability score</div>
              <div className="flex items-baseline gap-3 mt-2">
                <div className="font-display text-7xl md:text-8xl font-bold">87</div>
                <div className="text-xl opacity-80">/ 100</div>
                <div className="ml-3 inline-flex items-center gap-1 px-3 py-1 rounded-full glass text-xs font-mono">
                  <TrendingUp className="h-3 w-3" /> +12 this week
                </div>
              </div>
              <p className="mt-3 max-w-md opacity-90">You're ahead of 84% of CS undergrads in our index. Strong project depth — push system design next.</p>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="relative h-44 w-44">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(0 0% 100% / 0.2)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.87)}`} />
                </svg>
                <div className="absolute inset-0 grid place-items-center font-display text-2xl font-bold">87%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">Your career funnel</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FunnelStage n="01" label="Skills mapped" value="42 / 60" icon={Target} accent="bg-gradient-primary" to="/results" />
            <FunnelStage n="02" label="Projects to build" value="5 ideas" icon={Rocket} accent="bg-gradient-secondary" to="/results" />
            <FunnelStage n="03" label="Roadmap weeks" value="12 wks" icon={BookOpen} accent="bg-hero-gradient" to="/results" />
            <FunnelStage n="04" label="Top job matches" value="24" icon={Briefcase} accent="bg-gradient-primary" to="/results" />
          </div>
        </div>

        {/* Two column */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Missing skills */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border/60">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-xl font-bold">Top missing skills</h3>
                <p className="text-sm text-muted-foreground">For your target role: <span className="font-mono text-primary">ML Engineer</span></p>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to="/results">See all <ArrowRight /></Link></Button>
            </div>
            <div className="space-y-4">
              {[
                ["System Design", 35, "bg-secondary"],
                ["MLOps (Kubeflow, MLflow)", 48, "bg-primary"],
                ["Distributed training (PyTorch DDP)", 62, "bg-accent"],
                ["LLM fine-tuning", 70, "bg-success"],
              ].map(([skill, pct, color]) => (
                <div key={skill as string}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{skill as string}</span>
                    <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color as string}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top jobs */}
          <div className="p-6 rounded-3xl bg-card border border-border/60">
            <h3 className="font-display text-xl font-bold mb-5">Top matches</h3>
            <div className="space-y-3">
              {[
                ["ML Engineer", "Anthropic", "94%"],
                ["AI Research Intern", "OpenAI", "89%"],
                ["Data Scientist", "Stripe", "82%"],
              ].map(([role, co, fit]) => (
                <div key={role} className="p-4 rounded-2xl bg-muted/40 hover:bg-muted transition-smooth cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-display font-semibold text-sm">{role}</div>
                      <div className="text-xs text-muted-foreground font-mono">{co}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gradient">{fit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
