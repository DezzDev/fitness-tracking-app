import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import EntryScreen from "../components/EntryScreen";
import ActiveSession from "../components/ActiveSession";
import CompletionScreen from "../components/CompletionScreen";
import { useScheduledTemplate } from "@/features/workouts/hooks/useWorkoutTemplates";
import { useCreateSessionFromTemplate } from "@/features/workouts/hooks/useWorkoutSessions";
import type { WorkoutSessionWithExercises, WorkoutTemplate } from "@/types";

type ScreenType = "loading" | "entry" | "active" | "complete" | "entry-done";

function DashboardPage() {
	const [screen, setScreen] = useState<ScreenType>("loading");
	const [activeSession, setActiveSession] = useState<WorkoutSessionWithExercises | null>(null);
	const [completedSets, setCompletedSets] = useState<boolean[][] | null>(null);
	const [startTime, setStartTime] = useState<Date | null>(null);

	// Fetch today's scheduled template
	const { data: templates, isLoading, error } = useScheduledTemplate();
	const createSessionMutation = useCreateSessionFromTemplate();

	// Get first template (should only be one scheduled per day)
	const scheduledTemplate: WorkoutTemplate | undefined = templates?.[0];

	useEffect(() => {
		if (!isLoading) {
			setScreen("entry");
		}
	}, [isLoading]);

	const handleStart = () => {
		if (!scheduledTemplate) return;

		setStartTime(new Date());
		
		// Create session from template
		createSessionMutation.mutate(
			{
				templateId: scheduledTemplate.id,
				sessionDate: new Date(),
				notes: undefined,
				durationMinutes: undefined,
			},
			{
				onSuccess: (session) => {
					setActiveSession(session);
					setScreen("active");
				},
			}
		);
	};

	const handleComplete = (sets: boolean[][]) => {
		setCompletedSets(sets);
		setScreen("complete");
	};

	const handleReturn = () => {
		setScreen("entry-done");
	};

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
				<div className="flex flex-col items-center justify-center h-screen gap-4">
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
			return (
				<div className="flex flex-col items-center justify-center h-screen gap-4">
					<p className="text-muted-foreground font-bebas text-xl tracking-wide">
						NO HAY PLANTILLA PROGRAMADA PARA HOY
					</p>
					<p className="text-muted-foreground text-sm">
						Configura una plantilla en la sección de Plantillas
					</p>
				</div>
			);
		}

		switch (screen) {
			case "entry":
				return (
					<EntryScreen
						template={scheduledTemplate}
						onStart={handleStart}
						completed={false}
						isCreatingSession={createSessionMutation.isPending}
					/>
				);
			case "active":
				if (!activeSession) return null;
				return (
					<ActiveSession session={activeSession} onComplete={handleComplete} />
				);
			case "complete":
				if (!activeSession || !completedSets || !startTime) return null;
				return (
					<CompletionScreen
						session={activeSession}
						completedSets={completedSets}
						startTime={startTime}
						onReturn={handleReturn}
					/>
				);
			case "entry-done":
				return (
					<EntryScreen
						template={scheduledTemplate}
						onStart={handleStart}
						completed={true}
						isCreatingSession={createSessionMutation.isPending}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="overflow-hidden font-barlow flex flex-1">
			<div className="flex-1 overflow-hidden relative bg-background">
				{renderDashboard()}
			</div>
		</div>
	);
}

export default DashboardPage;