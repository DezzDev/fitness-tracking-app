// src/components/layouts/DashboardLayout.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
	Home,
	Dumbbell,
	TrendingUp,
	User,
	LogOut,
	Menu,
	LucideSidebarClose,
	
} from "lucide-react";
import { useState } from 'react';
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


function DashboardLayout() {
	const navigate = useNavigate();
	const { user, logout } = useAuthStore();
	const [ sidebarOpen, setSidebarOpen ] = useState(false);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const menuItems = [
		{ icon: Home, label: 'Dashboard', path: '/dashboard' },
		{ icon: Dumbbell, label: 'Entrenamientos', path: '/workouts' },
		{ icon: TrendingUp, label: 'Ejercicios', path: '/exercises' },
		{ icon: User, label: 'Perfil', path: '/profile' },
	];

	return (
		<div className="bg-background text-foreground">
			{/* Header */}
			<header className="bg-white border-b border-gray-200 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex items-center gap-3">
							<button
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
							>
								{sidebarOpen ? <LucideSidebarClose size={24} /> : <Menu size={24} />}
							</button>

							<Link
								to={"/dashboard"}
								className="flex items-center gap-2"
							>
								<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
									💪
								</div>
								<span className="text-xl font-bold text-gray-900">
									Fitness Tracker
								</span>
							</Link>
						</div>

						{/*  User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
									<div className="text-right hidden sm:block">
										<p className="text-sm font-medium text-gray-900">
											{user?.name}
										</p>
										<p className="text-xs text-gray-500">
											{user?.email}
										</p>
									</div>
									<Avatar>
										<AvatarImage src={user?.profileImage} />
										<AvatarFallback className="bg-blue-600 text-white">
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
								<DropdownMenuItem onClick={handleLogout} className="text-red-600">
									<LogOut className="mr-2 h-4 w-4" />
									Cerrar sesión
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					{/* Sidebar - Desktop */}
					<aside className="hidden lg:block w-64 shrink-0">
						<nav className="space-y-1 bg-white rounded-lg p-4 shadow-sm">
							{menuItems.map(item => {
								const Icon = item.icon;
								const isActive = location.pathname === item.path;

								return(
									<Link
										key={item.path}
										to={item.path}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
											isActive 
											? 'bg-blue-50 text-blue-600 font-medium'
											: 'text-gray-700 hover:bg-gray-50'
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
						<div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={()=> setSidebarOpen(false)}>
							<aside className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6" onClick={e => e.stopPropagation()}>
								<nav className="space-y-1">
									{menuItems.map((item) => {
										const Icon = item.icon;
										const isActive = location.pathname === item.path;

										return(
											<Link
												key={item.path}
												to={item.path}
												onClick={()=> setSidebarOpen(false)}
												className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
														isActive
														? 'bg-blue-50 text-blue-600 font-medium'
														: 'text-gray-700 hover:bg-gray-50'
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
					<main className="flex-1 min-w-0">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	)
}

export default DashboardLayout