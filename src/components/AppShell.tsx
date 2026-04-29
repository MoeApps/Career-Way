import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { LayoutDashboard, FileUp, BarChart3, Github, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload CV", icon: FileUp },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/github", label: "GitHub", icon: Github },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border/60 glass-strong z-40">
        <div className="p-6"><Logo /></div>
        <nav className="flex-1 px-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-smooth ${
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border/60">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/50">
            <div className="h-9 w-9 rounded-full bg-hero-gradient grid place-items-center text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.email ?? "Guest"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">Free plan</p>
            </div>
            <Button size="icon" variant="ghost" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="lg:pl-64">
        <div className="container max-w-7xl mx-auto px-4 py-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
};
