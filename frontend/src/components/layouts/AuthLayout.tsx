import type { ReactNode } from "react";
import {Link} from "react-router-dom";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle: string;
}

export default function AuthLayout ({children, title, subtitle}:AuthLayoutProps){
	return(
		<div className="min-h-screen flex flex-col lg:flex-row bg-background">
			{/* Panel izquierdo branding */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
				{/* Background gradient + noise */}
				<div className="absolute inset-0 bg-linear-to-br from-[#111114] via-[#08080a] to-[#1a0d05]" />
				<div className="absolute inset-0 opacity-[0.03]" style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
				}} />

				{/* Decorative glow orb */}
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary rounded-full opacity-[0.07] blur-[120px]" />
				<div className="absolute top-1/4 right-0 w-64 h-64 bg-accent rounded-full opacity-[0.04] blur-[100px]" />

				{/* Content */}
				<div className="relative z-10">
					<Link to={"/"} className="flex items-center gap-3 group">
						<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-lg glow-orange-sm transition-shadow group-hover:glow-orange">
							<span className="text-background font-bold font-bebas text-xl">FT</span>
						</div>
						<span className="text-foreground font-bebas text-2xl tracking-wide">Fitness Tracker</span>
					</Link>
				</div>

				<div className="relative z-10 space-y-6">
					<h1 className="font-bebas text-6xl xl:text-7xl leading-[0.95] tracking-wide text-foreground">
						Transforma tus <br />
						<span className="text-gradient-orange">entrenamientos</span>
					</h1>
					<p className="text-lg text-muted-foreground font-barlow font-light max-w-md">
						Registra, analiza y mejora cada repetici&oacute;n. Tu progreso merece ser medido.
					</p>
				</div>

				<div className="relative z-10 flex gap-10">
					<div>
						<div className="font-bebas text-4xl text-primary">15k+</div>
						<div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-barlow font-medium">Usuarios activos</div>
					</div>
					<div>
						<div className="font-bebas text-4xl text-primary">500k+</div>
						<div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-barlow font-medium">Reps registradas</div>
					</div>
					<div>
						<div className="font-bebas text-4xl text-primary">100%</div>
						<div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-barlow font-medium">M&aacute;s fuerza</div>
					</div>
				</div>
			</div>

			{/* Panel derecho formulario */}
			<div className="flex-1 flex items-center justify-center p-8 bg-(--surface)">
				<div className="w-full max-w-md space-y-6">
					{/* Logo m&oacute;vil */}
					<div className="lg:hidden text-center mb-8">
						<Link to={"/"} className="inline-flex items-center gap-3 group">
							<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-orange-sm">
								<span className="text-background font-bold font-bebas text-xl">FT</span>
							</div>
							<span className="font-bebas text-2xl tracking-wide text-foreground">Fitness Tracker</span>
						</Link>
					</div>

					<div className="text-center">
						<h2 className="font-bebas text-4xl tracking-wide text-foreground">{title}</h2>
						<p className="mt-2 text-muted-foreground">{subtitle}</p>
					</div>

					{children}
				</div>
			</div>

		</div>
	)
}
