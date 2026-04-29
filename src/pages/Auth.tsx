import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { ArrowRight, Mail, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const Auth = () => {
  const [params] = useSearchParams();
  const initial = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created — check your inbox to confirm.");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="hidden lg:flex relative overflow-hidden bg-hero-gradient animate-gradient">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative m-auto p-12 text-primary-foreground max-w-md">
          <Logo className="brightness-0 invert mb-8" />
          <h2 className="font-display text-5xl font-bold leading-tight">
            One profile. Every opportunity.
          </h2>
          <p className="mt-6 text-primary-foreground/90 text-lg">
            Your AI copilot is waiting. Sign in to see your readiness funnel.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-3">
            {["Score", "Skills", "Roadmap", "Projects", "Jobs", "Coach"].map(w => (
              <div key={w} className="rounded-2xl glass p-4 text-center text-xs font-mono backdrop-blur-md">{w}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative grid place-items-center p-6 lg:p-12 bg-background">
        <div className="absolute inset-0 bg-mesh opacity-60 lg:hidden" />
        <div className="relative w-full max-w-md space-y-8 animate-fade-up">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "signin" ? "Sign in to continue your career journey." : "Free forever. No card required."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required maxLength={255}
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="pl-10 h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required minLength={6} maxLength={72}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl" />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight />
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-semibold hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
