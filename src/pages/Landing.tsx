import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, FileUp, Github, BarChart3, Target, BookOpen, Briefcase, Zap, Shield, Rocket } from "lucide-react";
import heroOrb from "@/assets/hero-orb.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="container relative mx-auto px-4 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-border/50 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span>v1.0 · Powered by Lovable AI</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Your AI <span className="text-gradient-hero animate-gradient">career copilot</span> for the next role.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Upload your CV, connect GitHub, and instantly get an employability score, missing skills, project ideas, a learning roadmap and matched jobs — ranked by fit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/auth?mode=signup">Start free analysis <ArrowRight /></Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/about">How it works</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-xs font-mono text-muted-foreground">
              <span>⚡ 30-second setup</span>
              <span>🎓 12,400+ students</span>
              <span>★ 4.9 rating</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute -inset-10 bg-hero-gradient blur-3xl opacity-30 animate-glow-pulse rounded-full" />
            <img src={heroOrb} alt="AI career analysis visualization" className="relative w-full max-w-lg mx-auto rounded-3xl shadow-elevated animate-float" />
            <div className="absolute -bottom-6 -left-6 glass-strong rounded-2xl p-4 shadow-soft border border-border/50 max-w-[200px] animate-fade-up" style={{ animationDelay: "0.6s" }}>
              <div className="text-[10px] font-mono text-muted-foreground">EMPLOYABILITY</div>
              <div className="text-3xl font-display font-bold text-gradient">87/100</div>
              <div className="text-[10px] text-success font-mono">▲ +12 this week</div>
            </div>
            <div className="absolute -top-4 -right-2 glass-strong rounded-2xl p-4 shadow-soft border border-border/50 max-w-[180px] animate-fade-up" style={{ animationDelay: "0.8s" }}>
              <div className="text-[10px] font-mono text-muted-foreground">TOP MATCH</div>
              <div className="text-sm font-display font-bold">ML Engineer @ Anthropic</div>
              <div className="text-[10px] font-mono text-secondary">94% fit</div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNNEL */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">The career readiness funnel</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">From profile to <span className="text-gradient">offer letter</span>.</h2>
          <p className="mt-4 text-muted-foreground">Four signals. One pipeline. Continuously refined as you grow.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Target, title: "Skills audit", desc: "We map every keyword on your CV against in-demand roles.", grad: "bg-gradient-primary" },
            { icon: Rocket, title: "Project ideas", desc: "Get 5 portfolio projects scoped to fix your biggest gaps.", grad: "bg-gradient-secondary" },
            { icon: BookOpen, title: "Learning roadmap", desc: "Week-by-week plan with curated courses & milestones.", grad: "bg-hero-gradient" },
            { icon: Briefcase, title: "Job matches", desc: "Ranked openings from real boards, scored by fit %.", grad: "bg-gradient-primary" },
          ].map((f, i) => (
            <div key={i} className="group relative p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/40 transition-smooth hover:-translate-y-1 hover:shadow-elevated">
              <div className={`h-12 w-12 rounded-2xl ${f.grad} grid place-items-center mb-5 shadow-glow`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="font-mono text-xs text-muted-foreground mb-1">0{i + 1}</div>
              <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Three steps. <span className="text-gradient">Zero friction.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileUp, title: "Upload your CV", desc: "PDF or DOCX. We parse skills, projects and experience in seconds." },
              { icon: Github, title: "Connect GitHub", desc: "We score your repos, languages and contribution depth." },
              { icon: BarChart3, title: "Get your roadmap", desc: "An interactive dashboard you can act on today." },
            ].map((s, i) => (
              <div key={i} className="relative p-8 rounded-3xl glass-strong border border-border/50 shadow-soft">
                <div className="absolute -top-5 left-8 h-10 w-10 rounded-2xl bg-hero-gradient grid place-items-center shadow-glow font-display font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <s.icon className="h-8 w-8 text-primary mb-4 mt-2" />
                <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, label: "10x faster", desc: "than manual career coaching" },
            { icon: Shield, label: "Privacy first", desc: "your CV never trains a model" },
            { icon: Sparkles, label: "ML-powered", desc: "fit scores from real hiring data" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60">
              <div className="h-12 w-12 rounded-xl bg-muted grid place-items-center">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-display font-bold">{t.label}</div>
                <div className="text-sm text-muted-foreground">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-hero-gradient animate-gradient p-12 md:p-20 text-center shadow-elevated">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative space-y-6 max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground">Land your next role faster.</h2>
            <p className="text-lg text-primary-foreground/90">Free forever for students. No credit card.</p>
            <Button asChild variant="glass" size="xl">
              <Link to="/auth?mode=signup">Start your analysis <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
