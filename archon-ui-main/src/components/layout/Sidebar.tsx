import { BarChart3, BookOpen, ChevronLeft, ChevronRight, FolderKanban, LayoutGrid, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { Button } from "../../features/ui/primitives";
import { cn } from "../../lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutGrid;
  enabled?: boolean;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { projectsEnabled } = useSettings();

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      enabled: true,
    },
    {
      name: "Knowledge",
      href: "/knowledge",
      icon: BookOpen,
      enabled: true,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderKanban,
      enabled: projectsEnabled,
    },
    {
      name: "MCP",
      href: "/mcp",
      icon: () => (
        <svg
          fill="currentColor"
          fillRule="evenodd"
          height="20"
          width="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
          <path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
        </svg>
      ),
      enabled: true,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      enabled: true,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border px-4">
          <img
            src="/re-light-master.png"
            alt="Archon"
            className={cn("transition-all duration-300", collapsed ? "h-8 w-8" : "h-10 w-auto")}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const isEnabled = item.enabled !== false;

            if (!isEnabled && collapsed) return null;

            return (
              <Link
                key={item.name}
                to={isEnabled ? item.href : "#"}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isEnabled
                      ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                      : "text-muted-foreground/40 cursor-not-allowed",
                )}
                title={collapsed ? item.name : undefined}
                onClick={(e) => {
                  if (!isEnabled) e.preventDefault();
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
