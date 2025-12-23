import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const HubNavigation = () => {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link 
            to="/"
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Stammerly</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/our-story" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Our Story</Link>
            <Link to="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Research</Link>
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </div>
  );
};