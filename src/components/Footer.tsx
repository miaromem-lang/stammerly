import { Link } from "react-router-dom";
import { Mail, FileText } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-4">Stammerly</h3>
            <p className="text-background/70 mb-6">
              Empowering every voice through synchronised care.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-background/70">
              <li><Link to="/about" className="hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/our-story" className="hover:text-background transition-colors">Our Story</Link></li>
              <li><Link to="/mission" className="hover:text-background transition-colors">Mission</Link></li>
              <li><Link to="/team" className="hover:text-background transition-colors">Meet the Team</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-background/70">
              <li><Link to="/research" className="hover:text-background transition-colors">Research</Link></li>
              <li><Link to="/reviews" className="hover:text-background transition-colors">Reviews</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal & Compliance</h4>
            <ul className="space-y-3 text-background/70">
              <li><Link to="/privacy-policy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/childrens-privacy" className="hover:text-background transition-colors">Children's Privacy Notice</Link></li>
              <li><Link to="/nhs-compliance" className="hover:text-background transition-colors">NHS Compliance</Link></li>
              <li><Link to="/accessibility" className="hover:text-background transition-colors">Accessibility Statement</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-3 text-background/70">
              <li><a href="mailto:mia@stammerly.com" className="hover:text-background transition-colors flex items-center gap-2"><Mail className="w-4 h-4" />mia@stammerly.com</a></li>
              <li><a href="mailto:jose@stammerly.com" className="hover:text-background transition-colors flex items-center gap-2"><Mail className="w-4 h-4" />jose@stammerly.com</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-background/60">© 2025 Stammerly. All rights reserved.</span>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy-policy" className="text-background/60 hover:text-background transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" />Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
