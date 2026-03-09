import type { WorkoutSessionWithExercises } from "@/types";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ActiveSessionProps {
	session: WorkoutSessionWithExercises;
	onComplete: (completedSets: boolean[][]) => void;
	onCancel?: () => void;
	isCancelling?: boolean;
}

export default function ActiveSession({ session, onComplete, onCancel, isCancelling = false }: ActiveSessionProps) {
	{
		const [ currentIdx, setCurrentIdx ] = useState(0);
		const [ completedSets, setCompletedSets ] = useState(
			session.exercises.map((e) => Array(e.sets.length).fill(false))
		);
		const [ animating, setAnimating ] = useState(false);
		const [ slideDir, setSlideDir ] = useState(0);
		const [ pulse, setPulse ] = useState(false);
		const [ visible, setVisible ] = useState(false);
		const [ showCancelConfirm, setShowCancelConfirm ] = useState(false);

		useEffect(() => {
			setTimeout(() => setVisible(true), 50);
		}, []);

	const exercise = session.exercises[ currentIdx ];
	const exCompleted = completedSets[ currentIdx ].every(Boolean);
	const nextSetIdx = completedSets[ currentIdx ].findIndex((s) => !s);
	const displaySetIdx = nextSetIdx === -1 ? exercise.sets.length - 1 : nextSetIdx;
	const totalCompleted = completedSets.filter((sets) =>
		sets.every(Boolean)
	).length;

		const completeSet = () => {
			if (nextSetIdx === -1) return;

			setPulse(true);
			setTimeout(() => setPulse(false), 300);

			const newCompleted = completedSets.map((sets, i) =>
				i === currentIdx
					? sets.map((s, j) => (j === nextSetIdx ? true : s))
					: sets
			);
			setCompletedSets(newCompleted);

			const allSetsNowDone = newCompleted[ currentIdx ].every(Boolean);
			if (allSetsNowDone) {
				if (currentIdx === session.exercises.length - 1) {
					setTimeout(() => onComplete(newCompleted), 600);
				} else {
					setTimeout(() => goTo(currentIdx + 1, 1), 700);
				}
			}
		};

		const goTo = (idx: number, dir: number) => {
			if (idx < 0 || idx >= session.exercises.length || animating) return;
			setAnimating(true);
			setSlideDir(dir);
			setTimeout(() => {
				setCurrentIdx(idx);
				setSlideDir(0);
				setAnimating(false);
			}, 300);
		};

		const progress = (totalCompleted / session.exercises.length) * 100;

		return (
			<div
				className={cn(
					"flex flex-col h-full w-full transition-opacity duration-400 ease-in-out",
					visible ? "opacity-100" : "opacity-0"
				)}
			>
				{/* Header */}
				<div className="px-8 pt-5 pb-4 flex justify-between items-center border-b border-border">
					<div>
						<div className="font-barlow text-[11px] tracking-[3px] text-muted-foreground">
							{new Date(session.sessionDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
						</div>
						<div className="font-barlow text-[15px] tracking-[2px] text-secondary-foreground font-semibold">
							{session.title}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="font-bebas text-[28px] text-primary">
							{String(currentIdx + 1).padStart(2, "0")}
							<span className="text-[16px] text-muted-foreground mx-0.5">
								/
							</span>
							<span className="text-[16px] text-muted-foreground">
								{session.exercises.length}
							</span>
						</div>
						{onCancel && (
							<button
								onClick={() => setShowCancelConfirm(true)}
								className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
								aria-label="Cancelar sesión"
							>
								<X className="h-5 w-5" />
							</button>
						)}
					</div>
				</div>

				{/* Cancel confirmation overlay */}
				{showCancelConfirm && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
						<div className="mx-8 w-full max-w-sm border border-border bg-background p-8 space-y-6">
							<div>
								<div className="font-bebas text-2xl tracking-[2px] text-foreground mb-2">
									CANCELAR SESIÓN
								</div>
								<p className="font-barlow text-sm text-muted-foreground">
									Se perderá todo el progreso de esta sesión. Esta acción no se puede deshacer.
								</p>
							</div>
							<div className="flex flex-col gap-3">
								<button
									onClick={() => {
										setShowCancelConfirm(false);
										onCancel?.();
									}}
									disabled={isCancelling}
									className="w-full bg-destructive border-none text-destructive-foreground font-bebas text-[18px] tracking-[3px] py-4 cursor-pointer transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isCancelling ? 'CANCELANDO...' : 'CANCELAR SESIÓN'}
								</button>
								<button
									onClick={() => setShowCancelConfirm(false)}
									disabled={isCancelling}
									className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-[13px] tracking-[3px] py-4 cursor-pointer hover:bg-muted/20 transition-colors disabled:opacity-50"
								>
									CONTINUAR ENTRENANDO
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Exercise area */}
				<div
					className={cn(
						"flex-1 flex flex-col justify-center p-8 overflow-hidden transition-all duration-300 ease-in-out",
						animating ? "opacity-0" : "opacity-100"
					)}
					style={{
						transform: animating
							? `translateX(${slideDir * -60}px)`
							: "translateX(0)",
					}}
				>
					{/* Muscle group tag */}
					<div className="font-barlow text-[10px] tracking-[4px] text-primary font-semibold mb-3">
						{exercise.muscleGroup}
					</div>

					{/* Exercise name */}
					<div
						className={cn(
							"font-bebas text-[clamp(52px,13vw,80px)] leading-[0.9] tracking-[2px] mb-9 transition-colors duration-300 ease-in-out",
							exCompleted ? "text-muted-foreground" : "text-foreground"
						)}
					>
						{exercise.exerciseName}
					</div>

					{/* Metrics */}
					<div className="flex gap-10 mb-10 items-end">
						{exercise.sets[ displaySetIdx ].weight && exercise.sets[ displaySetIdx ].weight > 0 && (
							<div>
								<div className="font-bebas text-[52px] leading-none text-foreground">
									{exercise.sets[ displaySetIdx ].weight || 0}
									<span className="text-[22px] text-muted-foreground ml-1">
										KG
									</span>
								</div>
								<div className="font-barlow text-[10px] tracking-[3px] text-secondary mt-1">
									PESO
								</div>
							</div>
						)}
						<div>
							<div
								className={cn(
									"font-bebas leading-none text-secondary-foreground",
									exercise.sets[ displaySetIdx ].reps && exercise.sets[ displaySetIdx ].reps > 0
										? "text-[36px]"
										: "text-[52px]"
								)}
							>
								{exercise.sets[ displaySetIdx ].reps}
							</div>
							<div className="font-barlow text-[10px] tracking-[3px] text-secondary mt-1">
								REPS
							</div>
						</div>
					</div>

					{/* Sets */}
					<div className="flex flex-col gap-2.5">
						{exercise.sets &&
							Array.from({ length: exercise.sets.length }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between py-2.5 border-b border-border"
								>
									<div
										className={cn(
											"font-barlow text-[12px] tracking-[3px] font-semibold",
											completedSets[ currentIdx ][ i ]
												? "text-muted-foreground"
												: "text-secondary-foreground"
										)}
									>
										SET {i + 1}
									</div>
									<div
										className={cn(
											"w-2.5 h-2.5 rounded-full transition-all duration-200 ease-in-out",
											completedSets[ currentIdx ][ i ]
												? "bg-primary shadow-[0_0_8px_var(--orange-glow)]"
												: "bg-transparent border-[1.5px] border-border"
										)}
									/>
								</div>
							))}
					</div>
				</div>

				{/* Navigation dots */}
				<div className="flex justify-center gap-1.5 px-8 pb-3">
					{session.exercises.map((_, i) => (
						<div
							key={i}
							onClick={() => goTo(i, i > currentIdx ? 1 : -1)}
							className={cn(
								"h-1 rounded-sm cursor-pointer transition-all duration-200 ease-in-out",
								i === currentIdx
									? "w-5 bg-primary"
									: completedSets[ i ].every(Boolean)
										? "w-1.5 bg-muted-foreground"
										: "w-1.5 bg-border"
							)}
						/>
					))}
				</div>

				{/* CTA Button */}
				<div className="px-8 pb-5">
					<button
						onClick={completeSet}
						disabled={exCompleted}
						className={cn(
							"w-full font-bebas text-[20px] tracking-[4px] py-[18px] transition-all duration-300 ease-in-out",
							exCompleted
								? "bg-transparent border border-border text-muted-foreground cursor-default"
								: "bg-primary border-none text-black cursor-pointer",
							pulse ? "scale-[0.97]" : "scale-100"
						)}
					>
						{exCompleted ? "EJERCICIO COMPLETADO" : "+ COMPLETAR SET"}
					</button>
				</div>

				{/* Progress bar */}
				<div className="px-8 pb-7">
					<div className="flex justify-between mb-2">
						<div className="font-barlow text-[10px] tracking-[3px] text-secondary">
							{totalCompleted} / {session.exercises.length} EJERCICIOS
						</div>
					</div>
					<div className="h-0.5 bg-border rounded-sm overflow-hidden">
						<div
							className="h-full bg-primary rounded-sm transition-[width] duration-400 ease-in-out shadow-[0_0_6px_var(--orange-glow)]"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Swipe hint */}
				<div className="flex justify-between px-8 pb-4">
					<button
						onClick={() => goTo(currentIdx - 1, -1)}
						disabled={currentIdx === 0}
						className={cn(
							"bg-transparent border-none font-barlow text-[11px] tracking-[2px] p-0",
							currentIdx === 0
								? "text-border cursor-default"
								: "text-muted-foreground cursor-pointer"
						)}
					>
						← ANTERIOR
					</button>
					<button
						onClick={() => goTo(currentIdx + 1, 1)}
						disabled={currentIdx === session.exercises.length - 1}
						className={cn(
							"bg-transparent border-none font-barlow text-[11px] tracking-[2px] p-0",
							currentIdx === session.exercises.length - 1
								? "text-border cursor-default"
								: "text-muted-foreground cursor-pointer"
						)}
					>
						SIGUIENTE →
					</button>
				</div>
			</div>
		);
	};
}
