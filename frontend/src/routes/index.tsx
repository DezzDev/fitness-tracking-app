// src/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Navigate } from "react-router-dom";

// Layouts
import RootLayout from "@/components/layouts/RootLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Pages (Se crearan después)
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import WorkoutsPage from '@/features/workouts/pages/WorkoutsPage';
import CreateWorkoutPage from "@/features/workouts/pages/CreateWorkoutPage";
import EditWorkoutPage from "@/features/workouts/pages/EditWorkoutPage";
import WorkoutDetailPage from '@/features/workouts/pages/WorkoutDetailPage';
import ExercisesPage from '@/features/exercises/pages/ExercisesPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';


export const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <Navigate to="/dashboard" replace />
			},

			// Rutas públicas
			{
				element: <PublicRoute />,
				children: [
					{
						path: 'login',
						element: <LoginPage />
					},
					{
						path: 'register',
						element: <RegisterPage />
					},
				]
			},

			// Rutas protegidas
			{
				element: <ProtectedRoute />,
				children: [
					{
						element: <DashboardLayout />,
						children: [
							{
								path: 'dashboard',
								element: <DashboardPage />
							},
							{
								path: 'workouts',
								element: <WorkoutsPage />
							},
							{
								path: 'workouts/new',
								element: <CreateWorkoutPage />
							},
							{
								path: 'workouts/:id',
								element: <WorkoutDetailPage />
							},
							{
								path: 'workouts/:id/edit',
								element: <EditWorkoutPage />
							},
							{
								path: 'exercises',
								element: <ExercisesPage />
							},
							{
								path: 'profile',
								element: <ProfilePage />
							}
						]
					}
				]
			},

			// Página 404
			{
				path: '*',
				element: <NotFoundPage />
			} 
		]
	}
])