import type { WorkoutTemplate, WorkoutTemplateExercise } from "@/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface EntryScreenProps {
	template: WorkoutTemplate;
	onStart: () => void;
	completed: boolean;
	isCreatingSession?: boolean;
}

export default function EntryScreen({
	template,
	onStart,
	completed,
	isCreatingSession = false,
}: EntryScreenProps) {
	const [visible, setVisible] = useState(false);
	
	useEffect(() => {
		const timer = setTimeout(() => setVisible(true), 50);
		return () => clearTimeout(timer);
	}, []);

	const totalSeries = template.exercises.reduce(
		(a: number, e: WorkoutTemplateExercise) => a + (e.suggestedSets || 3),
		0
	);
	const today = new Date();

	return (
		<div
			className="flex flex-col h-full justify-between transition-all duration-500 ease-out"
			style={{
				opacity: visible ? 1 : 0,
				transform: visible ? "none" : "translateY(20px)",
			}}
		>
			{/* Top section */}
			<div className="flex-1 flex flex-col justify-center px-8 pt-10">
				<div className="font-barlow text-[11px] tracking-[4px] text-primary mb-4 font-semibold">
					{completed ? "SESIÓN DEL DÍA" : "SESIÓN PROGRAMADA"}
				</div>

				<div className="font-bebas text-[clamp(56px,12vw,88px)] leading-[0.9] text-foreground tracking-wide mb-2">
					{template.name}
				</div>

				<div className="font-barlow text-lg text-muted-foreground tracking-[3px] font-medium mb-12">
					{today.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
				</div>

				{!completed && (
					<div className="border-t border-b border-border py-6 grid grid-cols-2 gap-6">
						<div>
							<div className="font-bebas text-[42px] text-foreground leading-none">
								{template.exercises.length}
							</div>
							<div className="font-barlow text-[11px] tracking-[3px] text-muted-foreground mt-1">
								EJERCICIOS
							</div>
						</div>
						<div>
							<div className="font-bebas text-[42px] text-foreground leading-none">
								{totalSeries}
							</div>
							<div className="font-barlow text-[11px] tracking-[3px] text-muted-foreground mt-1">
								SERIES
							</div>
						</div>
					</div>
				)}

				{completed && (
					<div className="flex items-center gap-2.5 text-primary">
						<div className="w-2 h-2 rounded-full bg-primary" />
						<div className="font-barlow text-[13px] tracking-[3px] font-semibold">
							COMPLETADO
						</div>
					</div>
				)}
			</div>

			{/* Bottom CTA */}
			<div className="p-8">
				{!completed ? (
					<button
						onClick={onStart}
						disabled={isCreatingSession}
						className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] border-none text-black font-bebas text-[22px] tracking-[4px] py-5 cursor-pointer transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isCreatingSession ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin" />
								INICIANDO...
							</span>
						) : (
							"INICIAR SESIÓN"
						)}
					</button>
				) : (
					<button className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-sm tracking-[3px] py-[18px] cursor-pointer hover:bg-muted/20 transition-colors">
						VER DETALLE
					</button>
				)}
			</div>
		</div>
	);
}
