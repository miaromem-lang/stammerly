import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainLinks = [
  { to: "/about", label: "About" },
  { to: "/our-story", label: "Our Story" },
  { to: "/mission", label: "Mission" },
  { to: "/research", label: "Research" },
  { to: "/team", label: "Team" },
  { to: "/reviews", label: "Reviews" },
];

const resourceLinks = [
  { to: "/blog", label: "Articles & Resources" },
  { to: "/roadmap", label: "Product Roadmap" },
  { to: "/algorithm-changelog", label: "Algorithm Changelog" },
  { to: "/nhs-wait-times", label: "NHS Wait Times" },
  { to: "/find-a-therapist", label: "Find a Therapist" },
  { to: "/funding-support", label: "Funding Support" },
  { to: "/sensory-fit-guide", label: "Sensory Fit Guide" },
  { to: "/hardware-safety", label: "Hardware Safety" },
  { to: "/system-status", label: "System Status" },
];

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/childrens-privacy", label: "Children's Privacy" },
  { to: "/nhs-compliance", label: "NHS Compliance" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/regulatory", label: "Regulatory Status" },
];

const allLinks = [...mainLinks, ...resourceLinks, ...legalLinks, { to: "/contact", label: "Contact" }];

export const SiteNavigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Stammerly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.slice(0, 4).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? "text-primary font-medium bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 flex items-center gap-1">
                  Resources <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                {resourceLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to} className="w-full cursor-pointer">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Legal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 flex items-center gap-1">
                  Legal <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                {legalLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to} className="w-full cursor-pointer">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/contact"
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                location.pathname === "/contact"
                  ? "text-primary font-medium bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background overflow-y-auto">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-lg text-foreground">Stammerly</span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Company</p>
                  <nav className="flex flex-col">
                    {mainLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`py-2.5 text-sm border-b border-border/50 transition-colors ${
                          location.pathname === link.to
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resources</p>
                  <nav className="flex flex-col">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`py-2.5 text-sm border-b border-border/50 transition-colors ${
                          location.pathname === link.to
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Legal & Compliance</p>
                  <nav className="flex flex-col">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`py-2.5 text-sm border-b border-border/50 transition-colors ${
                          location.pathname === link.to
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <Link
                  to="/contact"
                  className={`py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === "/contact"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
