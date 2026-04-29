import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, LogOut } from "lucide-react";

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 glass border-b border-border/40" />
      <nav className="container relative mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-smooth ${
                pathname === l.to ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard /> Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/auth?mode=signup")}>Get started</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
