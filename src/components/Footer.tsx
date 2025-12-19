import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, FileText, Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold mb-4">Stammerly</h3>
            <p className="text-background/70 mb-6 max-w-md">
              Empowering every voice through synchronised care. A collaborative platform 
              connecting children, parents, teachers, and therapists.
            </p>
            <div className="flex gap-4">
              <Button variant="glass" size="sm" className="bg-background/10 hover:bg-background/20 text-background border-background/20">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">For Kids</a></li>
              <li><a href="#" className="hover:text-background transition-colors">For Parents</a></li>
              <li><a href="#" className="hover:text-background transition-colors">For Teachers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">For Therapists</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Research</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Press</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-background/60">
              <span>© 2024 Stammerly. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-background/60 hover:text-background transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Privacy Policy
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Terms of Service
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Accessibility (WCAG 2.1 AA)
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
