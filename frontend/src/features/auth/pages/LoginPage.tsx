// src/features/auth/pages/LoginPage.tsx

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import  AuthLayout  from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";



function LoginPage() {
	const navigate = useNavigate();
	const { login, loginDemo, error, clearError } = useAuthStore();
	const [ showPassword, setShowPassword ] = useState(false);
	const [ isLoading, setIsLoading ] = useState(false);
	const [ isDemoLoading, setIsDemoLoading ] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});


	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		clearError();

		try {
			await login(data.email, data.password);
			navigate('/dashboard');
		} catch (error) {
			// El error se maneja en el store
		} finally {
			setIsLoading(false);
		}
	}

	const onDemoSubmit = async () => {
		setIsDemoLoading(true);
		clearError();

		try {
			await loginDemo();
			navigate('/dashboard');
		} finally {
			setIsDemoLoading(false);
		}
	};

	return (

		<AuthLayout
			title='Bienvenido de vuelta'
			subtitle='Ingresa a tu cuenta para continuar'
		>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				{/* Error alert */}
				{error && (
					<Alert variant={"destructive"}>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="tu@email.com"
						autoComplete="email"
						disabled={isLoading}
            className="rounded-none"
						{...register("email")}
					/>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email.message}</p>
					)}
				</div>

				{/* Password */}
				<div className="space-y-2">
					<Label htmlFor="password">Contrase&ntilde;a</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? 'text' : "password"}
							placeholder="**********"
							autoComplete="current-password"
							disabled={isLoading}
              className="rounded-none"
							{...register('password')}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							disabled={isLoading}
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}

						</button>
					</div>
					{errors.password && (
						<p className="text-sm text-destructive">{errors.password.message}</p>
					)}
				</div>

				{/* forgot password */}
				<div className="flex items-center justify-between text-sm">				
					<Link
						to="/forgot-password"
						className="text-primary hover:text-accent font-medium transition-colors"
					>
						&iquest;Olvidaste tu contrase&ntilde;a?
					</Link>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					className="w-full glow-orange-sm hover:glow-orange transition-shadow rounded-none"
					size={"lg"}
					disabled={isLoading || isDemoLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Iniciando sesi&oacute;n...
						</>
					) : (
						'Iniciar sesi\u00F3n'
					)}
				</Button>

				<Button
					type="button"
					variant="outline"
					className="w-full rounded-none"
					onClick={onDemoSubmit}
					disabled={isLoading || isDemoLoading}
				>
					{isDemoLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Iniciando demo...
						</>
					) : (
						'Probar demo'
					)}
				</Button>

		
				{/* Register Link */}
				<p className="text-center text-sm text-muted-foreground">
					&iquest;No tienes una cuenta?{' '}
					<Link
						to="/register"
						className="font-medium text-primary hover:text-accent transition-colors"
					>
						Reg&iacute;strate gratis
					</Link>
				</p>
			</form>

		</AuthLayout>

	)
}

export default LoginPage
