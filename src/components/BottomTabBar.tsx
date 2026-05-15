import { NavLink } from "react-router-dom";
import { Home, Mic, History, Settings as SettingsIcon } from "lucide-react";

const tabs = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/session",  label: "Session",  icon: Mic },
  { to: "/history",  label: "History",  icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export const BottomTabBar = () => {
  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomTabBar;
