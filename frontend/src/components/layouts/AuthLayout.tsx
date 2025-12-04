import type { ReactNode } from "react";
import {Link} from "react-router-dom";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle: string;
}

export default function AuthLayout ({children, title, subtitle}:AuthLayoutProps){
	return(
		<div className="min-h-screen flex flex-col lg:flex-row">
			{/* Panel izquierdo branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-purple-700 p-12 text-white flex-col justify-between">
				<div>
					<Link to={"/"} className="flex items-center gap-2 text-2xl font-bold">
					<div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
						💪
					</div>
					<span>Fitness Tracker</span>
					</Link>
				</div>

				<div className="space-y-6">
					<h1 className="text-5xl font-bold leading-tight">
						Transforma tus <br />
						entrenamientos 
					</h1>
					<p className="text-xl text-blue-100">
						Registra, analiza y mejora cada repetición.
					</p>
				</div>

				<div className="flex gap-8 text-sm">
					<div>
						<div className="text-3xl font-bold">15k+</div>
						<div className="text-blue-200">Usuarios activos</div>
					</div>
					<div>
						<div className="text-3xl font-bold">500k+</div>
						<div className="text-blue-200">Repeticiones registradas</div>
					</div>
					<div>
						<div className="text-3xl font-bold">100%</div>
						<div className="text-blue-200">Más músculos</div>
					</div>
				</div>
			</div>

			{/* Panel derecho formulario */}
			<div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
				<div className="w-full max-w-md space-y-6">
					{/* Logo móvil*/}
					<div className="lg:hidden text-center mb-8">
						<Link to={"/"} className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
							<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
								💪
							</div>
							<span>Fitness Tracker</span>
						</Link>
					</div>


					<div className="text-center">
						<h2 className="text-3xl font-bold text-gray-900">{title}</h2>
						<p className="mt-2 text-gray-600">{subtitle}</p>
					</div>

					{children}
				</div>
			</div>

		</div>
	)
}