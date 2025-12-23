import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const HubNavigation = () => {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Stammerly</span>
          </button>
          <nav className="flex items-center gap-4">
            <button onClick={() => handleNavClick("/about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</button>
            <button onClick={() => handleNavClick("/our-story")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Our Story</button>
            <button onClick={() => handleNavClick("/research")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Research</button>
            <button onClick={() => handleNavClick("/privacy-policy")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => handleNavClick("/reviews")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</button>
            <button onClick={() => handleNavClick("/contact")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</button>
          </nav>
        </div>
      </div>
    </div>
  );
};
