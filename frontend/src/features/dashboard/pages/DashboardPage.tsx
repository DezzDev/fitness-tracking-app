import { useState, useEffect } from "react";
import { Loader2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EntryScreen from "../components/EntryScreen";
import { useScheduledTemplate } from "@/features/workouts/hooks/useWorkoutTemplates";
import { useWorkoutSessions } from "@/features/workouts/hooks/useWorkoutSessions";
import type { WorkoutTemplate, WorkoutSessionWithMetrics } from "@/types";

type ScreenType = "loading" | "entry";

function DashboardPage() {
	const navigate = useNavigate();
	const [screen, setScreen] = useState<ScreenType>("loading");

	// Fetch today's scheduled template
	const { data: templates, isLoading, error } = useScheduledTemplate();

	// Get first template (should only be one scheduled per day)
	const scheduledTemplate: WorkoutTemplate | undefined = templates?.[0];

	// Check if today's scheduled workout was already completed
	const today = new Date();
	const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
	const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

	const { data: todaySessions } = useWorkoutSessions({
		startDate: startOfDay,
		endDate: endOfDay,
	});

	const completedTodaySessions = scheduledTemplate && todaySessions?.data?.items
		? todaySessions.data.items.filter(
			(s: WorkoutSessionWithMetrics) => s.templateId === scheduledTemplate.id
		)
		: [];

	const isCompletedToday = completedTodaySessions.length > 0;

	const latestCompletedSession = completedTodaySessions.reduce<WorkoutSessionWithMetrics | null>(
		(latest, current) => {
			if (!latest) {
				return current;
			}

			const latestTimestamp = new Date(latest.createdAt ?? latest.sessionDate).getTime();
			const currentTimestamp = new Date(current.createdAt ?? current.sessionDate).getTime();

			return currentTimestamp > latestTimestamp ? current : latest;
		},
		null
	);

	const completedSessionId = latestCompletedSession?.id;

	useEffect(() => {
		if (!isLoading) {
			setScreen("entry");
		}
	}, [isLoading]);

	const renderDashboard = () => {
		// Loading state
		if (screen === "loading" || isLoading) {
			return (
				<div className="flex items-center justify-center h-screen">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			);
		}

		// Error state
		if (error) {
			return (
				<div className="flex flex-col items-center justify-center gap-4">
					<p className="text-destructive font-bebas text-xl tracking-wide">
						ERROR AL CARGAR PLANTILLA
					</p>
					<p className="text-muted-foreground text-sm">
						{error instanceof Error ? error.message : "Error desconocido"}
					</p>
				</div>
			);
		}

		// No scheduled template
		if (!scheduledTemplate) {
			const today = new Date();
			return (
				<div
					className="flex flex-col h-full w-full justify-between transition-all duration-500 ease-out"
				>
					{/* Top section */}
					<div className="flex-1 flex flex-col px-8 pt-10">
						<div className="font-barlow text-[11px] tracking-[4px] text-muted-foreground mb-4 font-semibold">
							HOY
						</div>

						<div className="font-bebas text-[clamp(56px,12vw,88px)] leading-[0.9] text-foreground tracking-wide mb-2">
							SIN ENTRENAMIENTO
						</div>

						<div className="font-barlow text-lg text-muted-foreground tracking-[3px] font-medium mb-12">
							{today.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
						</div>

						<div className="flex flex-col gap-4 items-start">
							<div className="flex items-center gap-3 text-muted-foreground">
								<Calendar className="h-5 w-5" />
								<span className="font-barlow text-sm">
									No hay entrenamiento programado para hoy
								</span>
							</div>
						</div>
					</div>

					{/* Bottom CTA */}
					<div className="p-8">
						<button
							onClick={() => navigate('/workouts')}
							className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] border-none text-black font-bebas text-[22px] tracking-[4px] py-5 cursor-pointer transition-all duration-100"
						>
							ELEGIR ENTRENAMIENTO
						</button>
					</div>
				</div>
			);
		}

		switch (screen) {
			case "entry":
				return (
					<EntryScreen
						template={scheduledTemplate}
						completed={isCompletedToday}
						completedSessionId={completedSessionId}
					/>
				);
			default:
				return null;
		}
	};

	return (
		
			<div className="flex-1 font-barlow">
				{renderDashboard()}
			</div>
		
	);
}

export default DashboardPage;
