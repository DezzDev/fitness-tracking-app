// src/features/auth/pages/RegisterPage.tsx
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

import AuthLayout from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/authStore";
import { registerSchema, type RegisterFormData } from "../schemas/authSchemas";

function RegisterPage() {
	const navigate = useNavigate();
	const { register: registerUser, error, clearError } = useAuthStore();
	const [ showPassword, setShowPassword ] = useState(false);
	const [ showConfirmPassword, setShowConfirmPassword ] = useState(false);
	const [ isLoading, setIsLoading ] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			age: undefined,
			password: '',
			confirmPassword: '',
			acceptTerms: false,
			role: 'user',
		}
	})

	const password = watch('password');

	// Validaciones de contraseña en tiempo real
	const passwordValidations = {
		length: password?.length >= 8 && password?.length <= 64,
		uppercase: /[A-Z]/.test(password || ''),
		lowercase: /[a-z]/.test(password || ''),
		number: /[0-9]/.test(password || '')
	};

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true);
		clearError();
		console.log("before register")

		try {
			console.log("try enter")
			await registerUser({
				email: data.email,
				password: data.password,
				name: data.name,
				age: data.age,
				acceptTerms: data.acceptTerms,
				role: data.role,
				profile_image: data.profile_image
			});

			console.log("after register")
			navigate('/dashboard');

		} catch (error) {
			console.log(error)
			// Error handled by store
		} finally {
			setIsLoading(false);
		}

	}


	return (
		<AuthLayout
			title="Crea tu cuenta"
			subtitle="Comienza tu transformación hoy"
		>
			<form onSubmit={handleSubmit(onSubmit, (errors) => { console.log('validation errors', errors); })} className="space-y-4" autoComplete="off">
				{/* Error alert */}
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Name */}
				<div className="space-y-2">
					<Label htmlFor="name">Nombre completo</Label>
					<Input
						id="name"
						type="text"
						placeholder="Nombre"
						autoComplete="name"
						disabled={isLoading}
						{...register('name')}
					/>
					{errors.name && (
						<p className="text-sm text-destructive">{errors.name.message}</p>
					)}
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="tu@email.com"
						autoComplete="email"
						disabled={isLoading}
						{...register('email')}
					/>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email.message}</p>
					)}

				</div>

				{/* Age */}
				<div className="space-y-2">
					<Label htmlFor="age">Edad</Label>
					<Input
						id="age"
						type="number"
						placeholder="25"
						min={"15"}
						max={"120"}
						disabled={isLoading}
						{...register('age', { valueAsNumber: true })}
					/>
					{errors.age && (
						<p className="text-sm text-destructive">{errors.age.message}</p>
					)}
				</div>

				{/* Password */}
				<div>
					<Label htmlFor="password">Contraseña</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="***********"
							autoComplete="new-password"
							disabled={isLoading}
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

					{/* Password Strength Indicators */}
					{password && (
						<div className="space-y-1 text-xs">
							<PasswordRequirement
								met={passwordValidations.length}
								text="Al menos 8 caracteres"
							/>
							<PasswordRequirement
								met={passwordValidations.uppercase}
								text="Una letra mayúscula"
							/>
							<PasswordRequirement
								met={passwordValidations.lowercase}
								text="Una letra minúscula"
							/>
							<PasswordRequirement
								met={passwordValidations.number}
								text="Un número"
							/>
						</div>
					)}
					{errors.password && (
						<p className="text-sm text-destructive">{errors.password.message}</p>
					)}
				</div>

				{/* Confirm Password */}
				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirmar contraseña</Label>
					<div className="relative">
						<Input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="***********"
							autoComplete="new-password"
							disabled={isLoading}
							{...register('confirmPassword')}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							disabled={isLoading}
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{errors.confirmPassword && (
					<p className="text-sm text-destructive">
						{errors.confirmPassword.message}
					</p>
					)}
				</div>

				{/* Terms */}
				<div className="flex">
					<div className="flex  gap-2 items-center">
						<input
							type="checkbox"
							id="terms"
							className="w-4 h-4 rounded border-border accent-primary bg-[var(--surface)]"
							{...register('acceptTerms')}
						/>
					<label htmlFor="terms" className="text-sm text-muted-foreground">
						Acepto los{" "}
						<Link to={"/terms"} className="text-primary hover:text-accent transition-colors">
							Términos y condiciones
						</Link>{" "}
						y la {" "}
						<Link to="/privacy" className="text-primary hover:text-accent transition-colors">
							Política de Privacidad
						</Link>
					</label>

					</div>
					{/* {errors.acceptTerms && (
						<p className="text-sm text-red-600 mt-1">{errors.acceptTerms.message}</p>
					)} */}
				</div>

				{/* Submit Button */}
				<Button
					type="submit"
					className="w-full glow-orange-sm hover:glow-orange transition-shadow"
					size={"lg"}
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creando cuenta...
						</>
					) : (
						"Crear cuenta"
					)}
				</Button>

				{/* Login Link */}
			<p className="text-center text-sm text-muted-foreground">
				¿Ya tienes una cuenta?{" "}
				<Link
					to={"/login"}
					className="font-medium text-primary hover:text-accent transition-colors"
				>
					Inicia sesión
				</Link>
			</p>
			</form>
		</AuthLayout>
	)
}

// Componente auxiliar para mostrar requisitos de contraseña
function PasswordRequirement({ met, text }: { met: boolean, text: string }) {
	return (
		<div className={`flex items-center gap-2 ${met ? 'text-[var(--success)]' : 'text-muted-foreground'}`}>
			{met ? (
				<CheckCircle2 size={14} />
			) : (
				<XCircle size={14} />
			)}
			<span>{text}</span>
		</div>
	)
}

export default RegisterPage