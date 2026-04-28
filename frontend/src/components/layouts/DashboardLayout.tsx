// src/components/layouts/DashboardLayout.tsx
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
	Home,
	Dumbbell,
	TrendingUp,
	User,
	LogOut,
	Menu,
	LucideSidebarClose,
	BarChart3,
	Clock3
} from "lucide-react";
import { useEffect, useState } from 'react';
import { useAuthStore } from "@/store/authStore";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useWorkoutPersistence } from '@/hooks/useWorkoutPersistence';
import type { PersistedWorkoutState } from '@/types/storage';
import PendingWorkoutDecisionModal from '@/features/workouts/components/PendingWorkoutDecisionModal';


function DashboardLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuthStore();
	const [ sidebarOpen, setSidebarOpen ] = useState(false);
	const [pendingSession, setPendingSession] = useState<PersistedWorkoutState | null>(null);
	const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
	const { loadPersistedState, clearState } = useWorkoutPersistence();
	const shouldShowPendingIndicator = location.pathname !== '/workouts/sessions/start' && Boolean(pendingSession);

	useEffect(() => {
		const checkPendingSession = () => {
			const isStartSessionPage = location.pathname === '/workouts/sessions/start';
			if (isStartSessionPage) {
				setPendingSession(null);
				setIsPendingModalOpen(false);
				return;
			}

			const persisted = loadPersistedState();
			setPendingSession(persisted);
		};

		checkPendingSession();

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				checkPendingSession();
			}
		};

		const handleFocus = () => {
			checkPendingSession();
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', handleFocus);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', handleFocus);
		};
	}, [location.pathname, loadPersistedState]);

	const handleContinuePendingSession = () => {
		if (!pendingSession) {
			return;
		}

		setIsPendingModalOpen(false);
		navigate(`/workouts/sessions/start?templateId=${pendingSession.templateId}`);
	};

	const handleCancelPendingSession = () => {
		clearState();
		setPendingSession(null);
		setIsPendingModalOpen(false);
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const menuItems = [
		{ icon: Home, label: 'Dashboard', path: '/dashboard' },
		{ icon: Dumbbell, label: 'Entrenamientos', path: '/workouts' },
		{ icon: TrendingUp, label: 'Ejercicios', path: '/exercises' },
    {icon: BarChart3, label: 'Estadísticas', path: '/stats' },
		{ icon: User, label: 'Perfil', path: '/profile' },
	];

	return (
		<div className="flex flex-col flex-1 bg-background text-foreground min-h-screen">
			{pendingSession && (
				<PendingWorkoutDecisionModal
					open={isPendingModalOpen}
					modalTitle="SESIÓN PENDIENTE"
					title={pendingSession.localSession.title}
					description={`Tienes un entrenamiento en progreso de ${pendingSession.localSession.title}. ¿Quieres continuarlo o cancelarlo?`}
					cancelLabel="CANCELAR"
					onOpenChange={setIsPendingModalOpen}
					onContinue={handleContinuePendingSession}
					onCancel={handleCancelPendingSession}
				/>
			)}

			{/* Header */}
			<header className="bg-(--surface) border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex items-center gap-3">
							<button
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="lg:hidden p-2 rounded-lg hover:bg-popover text-muted-foreground hover:text-foreground transition-colors"
							>
								{sidebarOpen ? <LucideSidebarClose size={24} /> : <Menu size={24} />}
							</button>

							<Link
								to={"/dashboard"}
								className="flex items-center gap-2 group"
							>
								<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-orange-sm transition-shadow group-hover:glow-orange">
									<span className="text-background font-bold font-bebas text-base">FT</span>
								</div>
								<span className="font-bebas text-xl tracking-wide text-foreground">
									Fitness Tracker
								</span>
							</Link>
						</div>

						<div className="flex items-center gap-2">
							{shouldShowPendingIndicator && (
								<Button
									variant="outline"
									onClick={() => setIsPendingModalOpen(true)}
									className="relative h-9 rounded-none px-2 sm:px-3"
								>
									<Clock3 className="h-4 w-4" />
									<span className="hidden sm:inline font-barlow text-xs tracking-[2px] uppercase">
										Sesión pendiente
									</span>
									<span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
								</Button>
							)}

							<ThemeToggle />

							{/*  User Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex items-center gap-3 hover:bg-popover rounded-lg p-2 transition-colors">
										<div className="text-right hidden sm:block">
											<p className="text-sm font-medium text-foreground">
												{user?.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{user?.email}
											</p>
										</div>
										<Avatar>
											<AvatarImage src={user?.profileImage} />
											<AvatarFallback className="bg-primary text-background font-bebas text-lg">
												{user?.name?.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel> Mi cuenta </DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => navigate('/profile')}>
										<User className="mr-2 h-4 w-4" />
										Perfil
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
										<LogOut className="mr-2 h-4 w-4" />
										Cerrar sesión
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</header>

			<div className="flex flex-1 gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
					{/* Sidebar - Desktop */}
					<aside className="hidden lg:block w-64 shrink-0">
						<nav className="space-y-1 bg-(--surface) p-3 border border-border">
							{menuItems.map(item => {
								const Icon = item.icon;
								const isActive = location.pathname === item.path;

								return(
									<Link
										key={item.path}
										to={item.path}
										className={`flex items-center gap-3 px-4 py-3 transition-all ${
											isActive 
											? 'bg-(--orange-subtle) text-primary font-semibold border-l-2 border-primary'
											: 'text-muted-foreground hover:bg-popover hover:text-foreground'
											}`}
									>
										<Icon size={20}/>
											<span>{item.label}</span>
									</Link>
								)
							})}
						</nav>
					</aside>

					{/* Sidebar -Mobile */}
					{sidebarOpen && (
						<div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={()=> setSidebarOpen(false)}>
							<aside className="absolute left-0 top-0 bottom-0 w-64 bg-(--surface) border-r border-border p-6" onClick={e => e.stopPropagation()}>
								<nav className="space-y-1">
									{menuItems.map((item) => {
										const Icon = item.icon;
										const isActive = location.pathname === item.path;

										return(
											<Link
												key={item.path}
												to={item.path}
												onClick={()=> setSidebarOpen(false)}
												className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all ${
														isActive
														? 'bg-(--orange-subtle) text-primary font-semibold'
														: 'text-muted-foreground hover:bg-popover hover:text-foreground'
													}`}
											>
												<Icon size={20} />
												<span>{item.label}</span>
											</Link>
										)
									})}
								</nav>
							</aside>
						</div>
					)}

					{/* Main Content */}
					<main className="flex flex-1 max-w-4xl mx-auto">
						<Outlet />
					</main>
				
			</div>

			
		</div>
	)
}

export default DashboardLayout
