import { Logo } from "./Logo";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-muted/30 mt-24">
    <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
      <div className="space-y-3">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-xs">
          The AI career copilot for the next generation of builders.
        </p>
        <div className="flex gap-2">
          {[Github, Twitter, Linkedin].map((Icon, i) => (
            <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-full bg-background border border-border hover:border-primary transition-smooth">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      {[
        { title: "Product", links: [["Dashboard", "/dashboard"], ["Upload CV", "/upload"], ["Pricing", "/pricing"]] },
        { title: "Company", links: [["About", "/about"], ["Careers", "#"], ["Contact", "#"]] },
        { title: "Resources", links: [["Docs", "#"], ["Blog", "#"], ["Privacy", "#"]] },
      ].map(col => (
        <div key={col.title}>
          <h4 className="font-display font-semibold mb-3">{col.title}</h4>
          <ul className="space-y-2">
            {col.links.map(([label, to]) => (
              <li key={label}><Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-smooth">{label}</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground font-mono">
      © 2026 Copilot.ai · Built for builders.
    </div>
  </footer>
);
