import type { WorkoutSessionWithExercises } from "@/types";
import { useState, useEffect } from "react";

interface ActiveSessionProps {
	session: WorkoutSessionWithExercises;
	onComplete: (completedSets: boolean[][]) => void;
}

export default function ActiveSession({ session, onComplete }: ActiveSessionProps) {
	{
		const [ currentIdx, setCurrentIdx ] = useState(0);
		const [ completedSets, setCompletedSets ] = useState(
			session.exercises.map((e) => Array(e.sets.length).fill(false))
		);
		const [ animating, setAnimating ] = useState(false);
		const [ slideDir, setSlideDir ] = useState(0);
		const [ pulse, setPulse ] = useState(false);
		const [ visible, setVisible ] = useState(false);

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
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
					opacity: visible ? 1 : 0,
					transition: "opacity 0.4s ease",
				}}
			>
				{/* Header */}
				<div
					style={{
						padding: "20px 32px 16px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottom: "1px solid var(--border)",
					}}
				>
					<div>
						<div
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: "11px",
								letterSpacing: "3px",
								color: "var(--gray-mid)",
							}}
						>
							{session.sessionDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
						</div>
						<div
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: "15px",
								letterSpacing: "2px",
								color: "var(--gray-light)",
								fontWeight: 600,
							}}
						>
							{session.title}
						</div>
					</div>
					<div
						style={{
							fontFamily: "'Bebas Neue', cursive",
							fontSize: "28px",
							color: "var(--orange)",
						}}
					>
						{String(currentIdx + 1).padStart(2, "0")}
						<span
							style={{ fontSize: "16px", color: "var(--gray-mid)", margin: "0 2px" }}
						>
							/
						</span>
						<span style={{ fontSize: "16px", color: "var(--gray-mid)" }}>
							{session.exercises.length}
						</span>
					</div>
				</div>

				{/* Exercise area */}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						padding: "32px",
						overflow: "hidden",
						transform: animating
							? `translateX(${slideDir * -60}px)`
							: "translateX(0)",
						opacity: animating ? 0 : 1,
						transition: "transform 0.3s ease, opacity 0.3s ease",
					}}
				>
					{/* Muscle group tag */}
					<div
						style={{
							fontFamily: "'Barlow Condensed', sans-serif",
							fontSize: "10px",
							letterSpacing: "4px",
							color: "var(--orange)",
							fontWeight: 600,
							marginBottom: "12px",
						}}
					>
						{exercise.muscleGroup}
					</div>

					{/* Exercise name */}
					<div
						style={{
							fontFamily: "'Bebas Neue', cursive",
							fontSize: "clamp(52px, 13vw, 80px)",
							lineHeight: 0.9,
							color: exCompleted ? "var(--gray-mid)" : "var(--white)",
							letterSpacing: "2px",
							marginBottom: "36px",
							transition: "color 0.3s ease",
						}}
					>
						{exercise.exerciseName}
					</div>

					{/* Metrics */}
					<div
						style={{
							display: "flex",
							gap: "40px",
							marginBottom: "40px",
							alignItems: "flex-end",
						}}
					>
						{exercise.sets[ displaySetIdx ].weight && exercise.sets[ displaySetIdx ].weight > 0 && (
							<div>
								<div
									style={{
										fontFamily: "'Bebas Neue', cursive",
										fontSize: "52px",
										lineHeight: 1,
										color: "var(--white)",
									}}
								>
									{exercise.sets[ displaySetIdx ].weight || 0}
									<span
										style={{
											fontSize: "22px",
											color: "var(--gray-mid)",
											marginLeft: "4px",
										}}
									>
										KG
									</span>
								</div>
								<div
									style={{
										fontFamily: "'Barlow Condensed', sans-serif",
										fontSize: "10px",
										letterSpacing: "3px",
										color: "var(--gray-dark)",
										marginTop: "4px",
									}}
								>
									PESO
								</div>
							</div>
						)}
						<div>
							<div
								style={{
									fontFamily: "'Bebas Neue', cursive",
									fontSize: exercise.sets[ displaySetIdx ].reps ? exercise.sets[ displaySetIdx ].reps > 0 ? "36px" : "52px" : "52px",
									lineHeight: 1,
									color: "var(--gray-light)",
								}}
							>
								{exercise.sets[ displaySetIdx ].reps}
							</div>
							<div
								style={{
									fontFamily: "'Barlow Condensed', sans-serif",
									fontSize: "10px",
									letterSpacing: "3px",
									color: "var(--gray-dark)",
									marginTop: "4px",
								}}
							>
								REPS
							</div>
						</div>
					</div>

					{/* Sets */}
					<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						{exercise.sets &&
							Array.from({ length: exercise.sets.length }).map((_, i) => (
								<div
									key={i}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "10px 0",
										borderBottom: "1px solid var(--border)",
									}}
								>
									<div
										style={{
											fontFamily: "'Barlow Condensed', sans-serif",
											fontSize: "12px",
											letterSpacing: "3px",
											color: completedSets[ currentIdx ][ i ]
												? "var(--gray-mid)"
												: "var(--gray-light)",
											fontWeight: 600,
										}}
									>
										SET {i + 1}
									</div>
									<div
										style={{
											width: "10px",
											height: "10px",
											borderRadius: "50%",
											background: completedSets[ currentIdx ][ i ]
												? "var(--orange)"
												: "transparent",
											border: completedSets[ currentIdx ][ i ]
												? "none"
												: "1.5px solid var(--border)",
											transition: "background 0.2s ease, border 0.2s ease",
											boxShadow: completedSets[ currentIdx ][ i ]
												? "0 0 8px var(--orange-glow)"
												: "none",
										}}
									/>
								</div>
							))}
					</div>
				</div>

				{/* Navigation dots */}
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						gap: "6px",
						padding: "0 32px 12px",
					}}
				>
					{session.exercises.map((_, i) => (
						<div
							key={i}
							onClick={() => goTo(i, i > currentIdx ? 1 : -1)}
							style={{
								width: i === currentIdx ? "20px" : "6px",
								height: "4px",
								borderRadius: "2px",
								background:
									i === currentIdx
										? "var(--orange)"
										: completedSets[ i ].every(Boolean)
											? "var(--gray-mid)"
											: "var(--border)",
								cursor: "pointer",
								transition: "all 0.2s ease",
							}}
						/>
					))}
				</div>

				{/* CTA Button */}
				<div style={{ padding: "0 32px 20px" }}>
					<button
						onClick={completeSet}
						disabled={exCompleted}
						style={{
							width: "100%",
							background: exCompleted ? "transparent" : "var(--orange)",
							border: exCompleted ? "1px solid var(--border)" : "none",
							color: exCompleted ? "var(--gray-mid)" : "#000",
							fontFamily: "'Bebas Neue', cursive",
							fontSize: "20px",
							letterSpacing: "4px",
							padding: "18px",
							cursor: exCompleted ? "default" : "pointer",
							transform: pulse ? "scale(0.97)" : "scale(1)",
							transition:
								"transform 0.1s ease, background 0.3s ease, color 0.3s ease",
						}}
					>
						{exCompleted ? "EJERCICIO COMPLETADO" : "+ COMPLETAR SET"}
					</button>
				</div>

				{/* Progress bar */}
				<div style={{ padding: "0 32px 28px" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "8px",
						}}
					>
						<div
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: "10px",
								letterSpacing: "3px",
								color: "var(--gray-dark)",
							}}
						>
							{totalCompleted} / {session.exercises.length} EJERCICIOS
						</div>
					</div>
					<div
						style={{
							height: "2px",
							background: "var(--border)",
							borderRadius: "1px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${progress}%`,
								background: "var(--orange)",
								borderRadius: "1px",
								transition: "width 0.4s ease",
								boxShadow: "0 0 6px var(--orange-glow)",
							}}
						/>
					</div>
				</div>

				{/* Swipe hint */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						padding: "0 32px 16px",
					}}
				>
					<button
						onClick={() => goTo(currentIdx - 1, -1)}
						disabled={currentIdx === 0}
						style={{
							background: "none",
							border: "none",
							color:
								currentIdx === 0 ? "var(--border)" : "var(--gray-mid)",
							fontFamily: "'Barlow Condensed', sans-serif",
							fontSize: "11px",
							letterSpacing: "2px",
							cursor: currentIdx === 0 ? "default" : "pointer",
							padding: 0,
						}}
					>
						← ANTERIOR
					</button>
					<button
						onClick={() => goTo(currentIdx + 1, 1)}
						disabled={currentIdx === session.exercises.length - 1}
						style={{
							background: "none",
							border: "none",
							color:
								currentIdx === session.exercises.length - 1
									? "var(--border)"
									: "var(--gray-mid)",
							fontFamily: "'Barlow Condensed', sans-serif",
							fontSize: "11px",
							letterSpacing: "2px",
							cursor:
								currentIdx === session.exercises.length - 1
									? "default"
									: "pointer",
							padding: 0,
						}}
					>
						SIGUIENTE →
					</button>
				</div>
			</div>
		);
	};
}