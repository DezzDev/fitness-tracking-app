import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, Home, LogOut, LucideSidebarClose, Menu, TrendingUp, User, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Dumbbell, label: "Entrenamientos", path: "/workouts" },
  { icon: TrendingUp, label: "Ejercicios", path: "/exercises" },
  { icon: User, label: "Perfil", path: "/profile" },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-gradient-bg min-h-screen">
      <header className="relative z-10 sticky top-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-200 transition hover:bg-white/10 lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <LucideSidebarClose size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="brand-badge">💪</div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90">Fitness Hub</p>
                <p className="text-base font-semibold text-white">Progress Center</p>
              </div>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="glass-panel flex items-center gap-3 rounded-xl p-2 pr-3 transition hover:bg-white/10">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-300">{user?.email}</p>
                </div>
                <Avatar>
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <nav className="glass-panel space-y-2 rounded-2xl p-4">
              {menuItems.map((item) => (
                <MenuLink
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  active={location.pathname === item.path}
                />
              ))}
            </nav>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <aside
                className="app-gradient-bg absolute bottom-0 left-0 top-0 w-72 border-r border-white/10 p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <MenuLink
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      active={location.pathname === item.path}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </nav>
              </aside>
            </div>
          )}

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function MenuLink({
  icon: Icon,
  label,
  path,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  path: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        active ? "bg-cyan-500/20 text-cyan-200" : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default DashboardLayout;
