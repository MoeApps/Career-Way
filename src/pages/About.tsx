import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Brain, Code2, Database, Sparkles, Heart } from "lucide-react";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-mesh" />
      <div className="container relative mx-auto px-4 text-center max-w-3xl">
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
          Built so every student can <span className="text-gradient-hero">see their potential</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Career coaching used to be a luxury. We're rebuilding it as software — open, instant, and personalised to your repo, not a generic template.
        </p>
      </div>
    </section>

    <section className="container mx-auto px-4 pb-24 grid md:grid-cols-3 gap-6">
      {[
        { icon: Brain, title: "Trained on real hiring", desc: "Our fit model is calibrated against thousands of real offers and rejections." },
        { icon: Code2, title: "Reads your code", desc: "We score commit depth, language breadth, and project quality — not stars." },
        { icon: Database, title: "Live job market", desc: "Openings refresh every hour from boards across the world." },
        { icon: Sparkles, title: "Lovable AI inside", desc: "Powered by Gemini & GPT-5 for instant, nuanced insights." },
        { icon: Heart, title: "Privacy first", desc: "Your CV is encrypted and never used to train models." },
        { icon: Brain, title: "Always learning", desc: "Every interaction makes the next student's roadmap smarter." },
      ].map(c => (
        <div key={c.title} className="p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/40 transition-smooth">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center mb-4 shadow-glow">
            <c.icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-display font-bold text-lg">{c.title}</h3>
          <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
        </div>
      ))}
    </section>

    <section className="container mx-auto px-4 pb-24">
      <div className="rounded-[2rem] bg-card border border-border/60 p-12 grid md:grid-cols-3 gap-8 text-center">
        {[
          ["12.4k+", "students onboarded"],
          ["68%", "land an interview within 30 days"],
          ["4.9★", "average rating"],
        ].map(([n, l]) => (
          <div key={l}>
            <div className="font-display text-5xl font-bold text-gradient">{n}</div>
            <div className="text-sm text-muted-foreground mt-1">{l}</div>
          </div>
        ))}
      </div>
    </section>

    <Footer />
  </div>
);

export default About;
