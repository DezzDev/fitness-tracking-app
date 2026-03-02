import type { WorkoutSessionWithExercises } from "@/types";
import { useEffect, useState } from "react";

interface CompletionScreenProps {
	session: WorkoutSessionWithExercises,
	completedSets: boolean[][] | null,
	onReturn: () => void,
}

export default function CompletionScreen ({ session, completedSets, onReturn }: CompletionScreenProps) {
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

	const totalSeries = completedSets ? completedSets.reduce(
		(a, sets) => a + sets.filter(Boolean).length,
		0
	) : 0;
	const volume = session.exercises.reduce((a, e, i) => {
		const done = completedSets ? completedSets[i].filter(Boolean).length : 0;
		const weightReps = e.sets.reduce((wr, s) => wr + ((s.weight ?? 0) * (s.reps ?? 0)), 0);
		
		return a + done * weightReps / e.sets.length;
	}, 0);

	const metrics = [
		{ value: session.exercises.length, label: "EJERCICIOS" },
		{ value: totalSeries, label: "SERIES" },
		{
			value: `${(volume / 1000).toFixed(1)}K`,
			label: "KG VOLUMEN",
		},
		{ value: "47 MIN", label: "DURACIÓN" },
	];

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				justifyContent: "space-between",
				padding: "40px 32px 32px",
				background: "#000",
			}}
		>
			{/* Title */}
			<div
				style={{
					opacity: step >= 1 ? 1 : 0,
					transform: step >= 1 ? "none" : "translateY(20px)",
					transition: "all 0.5s ease",
				}}
			>
				<div
					style={{
						fontFamily: "'Barlow Condensed', sans-serif",
						fontSize: "11px",
						letterSpacing: "4px",
						color: "var(--orange)",
						marginBottom: "12px",
						fontWeight: 600,
					}}
				>
					{session.sessionDate.toLocaleDateString("es-ES",{day: "numeric", month: "short"})} · {session.title}
				</div>
				<div
					style={{
						fontFamily: "'Bebas Neue', cursive",
						fontSize: "clamp(52px, 13vw, 76px)",
						lineHeight: 0.9,
						color: "var(--white)",
						letterSpacing: "2px",
					}}
				>
					SESIÓN
					<br />
					COMPLETADA
				</div>
			</div>

			{/* Metrics */}
			<div
				style={{
					borderTop: "1px solid var(--border)",
					borderBottom: "1px solid var(--border)",
					padding: "28px 0",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "24px",
					opacity: step >= 2 ? 1 : 0,
					transform: step >= 2 ? "none" : "translateY(16px)",
					transition: "all 0.5s ease",
				}}
			>
				{metrics.map((m, i) => (
					<div key={i}>
						<div
							style={{
								fontFamily: "'Bebas Neue', cursive",
								fontSize: "38px",
								color: "var(--white)",
								lineHeight: 1,
							}}
						>
							{m.value}
						</div>
						<div
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: "10px",
								letterSpacing: "3px",
								color: "var(--gray-mid)",
								marginTop: "4px",
							}}
						>
							{m.label}
						</div>
					</div>
				))}
			</div>

			{/* PR highlights */}
			<div
				style={{
					opacity: step >= 3 ? 1 : 0,
					transform: step >= 3 ? "none" : "translateY(12px)",
					transition: "all 0.5s ease",
					display: "flex",
					flexDirection: "column",
					gap: "10px",
				}}
			>
				{[
					"NUEVO RÉCORD EN PRESS BANCA",
					"+12% VOLUMEN VS ÚLTIMA SESIÓN",
				].map((text, i) => (
					<div
						key={i}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
						}}
					>
						<div
							style={{
								width: "4px",
								height: "4px",
								borderRadius: "50%",
								background: "var(--orange)",
								flexShrink: 0,
							}}
						/>
						<div
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: "12px",
								letterSpacing: "2px",
								color: "var(--gray-light)",
								fontWeight: 600,
							}}
						>
							{text}
						</div>
					</div>
				))}
			</div>

			{/* Actions */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "12px",
					opacity: step >= 4 ? 1 : 0,
					transform: step >= 4 ? "none" : "translateY(10px)",
					transition: "all 0.4s ease",
				}}
			>
				<button
					style={{
						width: "100%",
						background: "transparent",
						border: "1px solid var(--border)",
						color: "var(--gray-light)",
						fontFamily: "'Barlow Condensed', sans-serif",
						fontSize: "13px",
						letterSpacing: "3px",
						padding: "16px",
						cursor: "pointer",
					}}
				>
					VER DETALLE COMPLETO
				</button>
				<button
					onClick={onReturn}
					style={{
						width: "100%",
						background: "var(--orange)",
						border: "none",
						color: "#000",
						fontFamily: "'Bebas Neue', cursive",
						fontSize: "20px",
						letterSpacing: "4px",
						padding: "18px",
						cursor: "pointer",
					}}
				>
					VOLVER AL DASHBOARD
				</button>
			</div>
		</div>
	);
};