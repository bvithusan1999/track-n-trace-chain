import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Truck,
  AlertTriangle,
  QrCode,
  Settings,
  Map,
  BarChart3,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Users,
  Warehouse,
  UserPlus,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  setCollapsed?: (value: boolean) => void;
}

export function Sidebar({
  className,
  collapsed = false,
  setCollapsed,
}: SidebarProps) {
  const { user, role, logout } = useAppStore();
  const userRole = role;
  const location = useLocation();
  const navigate = useNavigate();

  // 🧭 Role-based navigation items
  const getNavigationItems = () => {
    switch (userRole) {
      case "ADMIN":
        return [
          { path: "/", label: "Dashboard", icon: LayoutDashboard },
          { path: "/users", label: "Manage Users", icon: Users },
          { path: "/products", label: "All Products", icon: Package },
          { path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/settings", label: "Settings", icon: Settings },
          { path: "/register", label: "Register", icon: UserPlus },
        ];

      case "MANUFACTURER":
        return [
          { path: "/", label: "Dashboard", icon: LayoutDashboard },
          { path: "/products", label: "Products", icon: Package },
          { path: "/products/create", label: "Create Product", icon: PlusCircle },
          { path: "/handover", label: "Distribute", icon: Truck },
          { path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/settings", label: "Settings", icon: Settings },
          { path: "/register", label: "Register", icon: UserPlus },
        ];

      case "SUPPLIER":
        return [
          { path: "/", label: "Dashboard", icon: LayoutDashboard },
          { path: "/handover", label: "Supply", icon: Truck },
          { path: "/products", label: "Products", icon: Package },
          { path: "/settings", label: "Settings", icon: Settings },
          { path: "/register", label: "Register", icon: UserPlus },
        ];

      case "WAREHOUSE":
        return [
          { path: "/", label: "Dashboard", icon: LayoutDashboard },
          { path: "/inventory", label: "Inventory", icon: Warehouse },
          { path: "/handover", label: "Receive / Dispatch", icon: Truck },
          { path: "/settings", label: "Settings", icon: Settings },
          { path: "/register", label: "Register", icon: UserPlus },
        ];

      case "USER":
        // 🔹 User only gets QR Scanner
        return [{ path: "/qr-scan", label: "QR Scanner", icon: QrCode },
        { path: "/register", label: "Register", icon: UserPlus },];

      default:
        // Unknown or not logged-in role
        return [{ path: "/qr-scan", label: "QR Scanner", icon: QrCode },
        { path: "/register", label: "Register", icon: UserPlus },

        ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-15 h-screen bg-card border-r shadow-md flex flex-col z-50 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h2 className="font-semibold text-lg">Navigation</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed && setCollapsed(!collapsed)}
          className="hover:bg-muted"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11 transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 glow-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          );
        })}
      </div>

      {/* Logout Section */}
      <div className="border-t p-3">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}
