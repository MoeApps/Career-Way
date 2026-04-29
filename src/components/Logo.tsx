import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 bg-hero-gradient rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="relative h-9 w-9 rounded-xl bg-hero-gradient grid place-items-center shadow-glow">
        <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-display font-bold text-lg tracking-tight">Copilot</span>
      <span className="font-mono text-[10px] text-muted-foreground">ai.career</span>
    </div>
  </Link>
);
