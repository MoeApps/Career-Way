import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, CheckCircle2, GitBranch, Star, Code2, Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";

const GitHubConnect = () => {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connect = () => {
    if (!username.trim() || username.length > 39) { toast.error("Enter a valid GitHub username"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConnected(true);
      toast.success("GitHub connected!");
    }, 1500);
  };

  const stats = [
    { icon: GitBranch, label: "Public repos", value: "27" },
    { icon: Star, label: "Stars earned", value: "418" },
    { icon: Code2, label: "Languages", value: "8" },
    { icon: Activity, label: "Last 12 mo", value: "1,247 commits" },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Step 2 of 3</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-1">Connect <span className="text-gradient">GitHub</span>.</h1>
          <p className="text-muted-foreground mt-2">We'll analyze your repos for language depth, project quality and consistency.</p>
        </div>

        {!connected ? (
          <div className="p-8 rounded-3xl bg-card border border-border/60 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-foreground grid place-items-center">
                <Github className="h-8 w-8 text-background" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Link your GitHub</h3>
                <p className="text-sm text-muted-foreground">Public data only. We never push or modify.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gh">GitHub username</Label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-4 rounded-xl bg-muted text-muted-foreground font-mono text-sm">github.com/</span>
                <Input id="gh" placeholder="octocat" value={username} onChange={e => setUsername(e.target.value)} maxLength={39} className="h-12 rounded-xl flex-1" />
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={connect} disabled={loading}>
              {loading ? "Connecting..." : <><Github /> Connect GitHub</>}
            </Button>

            <p className="text-xs text-muted-foreground text-center">By connecting, you agree to our Terms. We only read public data.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-success/10 border border-success/30 flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div className="flex-1">
                <div className="font-display font-bold">Connected as @{username}</div>
                <div className="text-sm text-muted-foreground">Analysis ready in your dashboard.</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>Disconnect</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(s => (
                <div key={s.label} className="p-5 rounded-2xl bg-card border border-border/60">
                  <s.icon className="h-5 w-5 text-primary mb-3" />
                  <div className="font-display text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/60">
              <h3 className="font-display text-lg font-bold mb-4">Top languages</h3>
              <div className="space-y-3">
                {[["Python", 62, "bg-primary"], ["TypeScript", 24, "bg-secondary"], ["Rust", 8, "bg-accent"], ["Go", 6, "bg-success"]].map(([lang, pct, color]) => (
                  <div key={lang as string}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{lang as string}</span>
                      <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${color as string}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full">View full analysis <Sparkles /></Button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default GitHubConnect;
