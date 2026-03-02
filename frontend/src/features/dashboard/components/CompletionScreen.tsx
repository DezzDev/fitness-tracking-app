import type { WorkoutSessionWithExercises } from "@/types";
import { useEffect, useState } from "react";

interface CompletionScreenProps {
	session: WorkoutSessionWithExercises;
	completedSets: boolean[][] | null;
	startTime: Date;
	onReturn: () => void;
}

export default function CompletionScreen({
	session,
	completedSets,
	startTime,
	onReturn,
}: CompletionScreenProps) {
	const [step, setStep] = useState(0);

	useEffect(() => {
		const timers = [
			setTimeout(() => setStep(1), 100),
			setTimeout(() => setStep(2), 400),
			setTimeout(() => setStep(3), 700),
			setTimeout(() => setStep(4), 1000),
		];
		return () => timers.forEach(clearTimeout);
	}, []);

	// Calculate real duration
	const endTime = new Date();
	const durationMs = endTime.getTime() - startTime.getTime();
	const durationMinutes = Math.round(durationMs / (1000 * 60));

	// Calculate total completed sets
	const totalSeries = completedSets
		? completedSets.reduce((a, sets) => a + sets.filter(Boolean).length, 0)
		: 0;

	// Calculate total volume (weight × reps)
	const volume = session.exercises.reduce((a, e, i) => {
		const done = completedSets ? completedSets[i].filter(Boolean).length : 0;
		const weightReps = e.sets.reduce(
			(wr, s) => wr + (s.weight ?? 0) * (s.reps ?? 0),
			0
		);

		return a + (done * weightReps) / e.sets.length;
	}, 0);

	const metrics = [
		{ value: session.exercises.length, label: "EJERCICIOS" },
		{ value: totalSeries, label: "SERIES" },
		{
			value: volume >= 1000 ? `${(volume / 1000).toFixed(1)}K` : Math.round(volume),
			label: "KG VOLUMEN",
		},
		{ value: `${durationMinutes} MIN`, label: "DURACIÓN" },
	];

	const today = new Date();

	return (
		<div className="flex flex-col h-full justify-between px-8 py-10 bg-black">
			{/* Title */}
			<div
				className="transition-all duration-500 ease-out"
				style={{
					opacity: step >= 1 ? 1 : 0,
					transform: step >= 1 ? "none" : "translateY(20px)",
				}}
			>
				<div className="font-barlow text-[11px] tracking-[4px] text-primary mb-3 font-semibold">
					{today.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} ·{" "}
					{session.title}
				</div>
				<div className="font-bebas text-[clamp(52px,13vw,76px)] leading-[0.9] text-foreground tracking-wide">
					SESIÓN
					<br />
					COMPLETADA
				</div>
			</div>

			{/* Metrics */}
			<div
				className="border-t border-b border-border py-7 grid grid-cols-2 gap-6 transition-all duration-500 ease-out"
				style={{
					opacity: step >= 2 ? 1 : 0,
					transform: step >= 2 ? "none" : "translateY(16px)",
				}}
			>
				{metrics.map((m, i) => (
					<div key={i}>
						<div className="font-bebas text-[38px] text-foreground leading-none">
							{m.value}
						</div>
						<div className="font-barlow text-[10px] tracking-[3px] text-muted-foreground mt-1">
							{m.label}
						</div>
					</div>
				))}
			</div>

			{/* PR highlights - removed fake data */}
			<div
				className="transition-all duration-500 ease-out flex flex-col gap-2.5"
				style={{
					opacity: step >= 3 ? 1 : 0,
					transform: step >= 3 ? "none" : "translateY(12px)",
				}}
			>
				{/* TODO: Replace with real PR data from API */}
				<div className="flex items-center gap-2.5">
					<div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
					<div className="font-barlow text-xs tracking-[2px] text-muted-foreground font-semibold">
						¡GRAN TRABAJO!
					</div>
				</div>
			</div>

			{/* Actions */}
			<div
				className="flex flex-col gap-3 transition-all duration-400 ease-out"
				style={{
					opacity: step >= 4 ? 1 : 0,
					transform: step >= 4 ? "none" : "translateY(10px)",
				}}
			>
				<button className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-[13px] tracking-[3px] py-4 cursor-pointer hover:bg-muted/20 transition-colors">
					VER DETALLE COMPLETO
				</button>
				<button
					onClick={onReturn}
					className="w-full bg-primary hover:bg-primary/90 border-none text-black font-bebas text-xl tracking-[4px] py-[18px] cursor-pointer transition-colors"
				>
					VOLVER AL DASHBOARD
				</button>
			</div>
		</div>
	);
}