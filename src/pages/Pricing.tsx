import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Student",
    price: "Free",
    blurb: "Everything to get hired.",
    features: ["1 CV analysis / week", "GitHub connection", "Basic roadmap", "10 job matches"],
    variant: "glass" as const,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    blurb: "For serious job hunters.",
    features: ["Unlimited analyses", "Advanced fit scoring", "Custom roadmap", "Unlimited job matches", "Cover letter generator", "Priority support"],
    featured: true,
    variant: "hero" as const,
  },
  {
    name: "Career+",
    price: "$29",
    period: "/mo",
    blurb: "For career switchers.",
    features: ["Everything in Pro", "1:1 mentor matching", "Mock interviews (AI)", "Salary negotiation kit", "Recruiter intros"],
    variant: "gradient" as const,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-mesh" />
      <div className="container relative mx-auto px-4 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-border/50 text-xs font-mono mb-6">
          <Sparkles className="h-3 w-3" /> Pricing
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold">Simple pricing. <span className="text-gradient-hero">Real outcomes.</span></h1>
        <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you're ready to accelerate.</p>
      </div>
    </section>

    <section className="container mx-auto px-4 pb-24 grid md:grid-cols-3 gap-6">
      {tiers.map(t => (
        <div
          key={t.name}
          className={`relative p-8 rounded-3xl border transition-smooth hover:-translate-y-1 ${
            t.featured
              ? "border-primary/40 bg-card shadow-elevated lg:scale-105"
              : "border-border/60 bg-card hover:shadow-soft"
          }`}
        >
          {t.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-hero-gradient text-primary-foreground text-[10px] font-mono uppercase tracking-widest shadow-glow">
              Most popular
            </div>
          )}
          <h3 className="font-display text-2xl font-bold">{t.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t.blurb}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-5xl font-bold">{t.price}</span>
            {t.period && <span className="text-muted-foreground text-sm">{t.period}</span>}
          </div>
          <Button asChild variant={t.variant} className="w-full mt-6">
            <Link to="/auth?mode=signup">Get started</Link>
          </Button>
          <ul className="mt-8 space-y-3">
            {t.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-success/15 grid place-items-center mt-0.5 shrink-0">
                  <Check className="h-3 w-3 text-success" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>

    {/* FAQ */}
    <section className="container mx-auto px-4 pb-24 max-w-3xl">
      <h2 className="font-display text-3xl font-bold text-center mb-10">Frequent questions</h2>
      <div className="space-y-3">
        {[
          ["Is it really free?", "Yes — the Student plan is free forever. No card required."],
          ["What models do you use?", "We blend Lovable AI (Gemini & GPT-5) with our own fit-scoring ML pipeline."],
          ["Will my CV be used to train models?", "Never. Your data is yours. Always."],
          ["Can I cancel anytime?", "Yes — one click in settings."],
        ].map(([q, a]) => (
          <details key={q} className="group p-5 rounded-2xl bg-card border border-border/60">
            <summary className="cursor-pointer font-display font-semibold flex justify-between items-center">
              {q}<span className="text-primary group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>

    <Footer />
  </div>
);

export default Pricing;
