import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import EntryScreen from "../components/EntryScreen";
import ActiveSession from "../components/ActiveSession";
import CompletionScreen from "../components/CompletionScreen";
import { useScheduledTemplate } from "@/features/workouts/hooks/useWorkoutTemplates";
import { useCreateSession } from "@/features/workouts/hooks/useWorkoutSessions";
import { templateToSession } from "../utils/templateToSession";
import type { WorkoutSessionWithExercises, WorkoutTemplate, EditableSet } from "@/types";

type ScreenType = "loading" | "entry" | "active" | "complete" | "entry-done";

function DashboardPage() {
	const [screen, setScreen] = useState<ScreenType>("loading");
	const [localSession, setLocalSession] = useState<WorkoutSessionWithExercises | null>(null);
	const [completedSets, setCompletedSets] = useState<EditableSet[][] | null>(null);
	const [startTime, setStartTime] = useState<Date | null>(null);

	// Fetch today's scheduled template
	const { data: templates, isLoading, error } = useScheduledTemplate();
	const createSessionMutation = useCreateSession();

	// Get first template (should only be one scheduled per day)
	const scheduledTemplate: WorkoutTemplate | undefined = templates?.[0];

	useEffect(() => {
		if (!isLoading) {
			setScreen("entry");
		}
	}, [isLoading]);

	const handleStart = () => {
		if (!scheduledTemplate) return;

		// Build a local session shape from the template — nothing is created in DB
		const session = templateToSession(scheduledTemplate);
		setLocalSession(session);
		setStartTime(new Date());
		setScreen("active");
	};

	const handleComplete = (sets: EditableSet[][]) => {
		setCompletedSets(sets);
		setScreen("complete");

		// NOW create the session in the database with the actual values
		if (localSession && scheduledTemplate && !createSessionMutation.isPending) {
			const durationMinutes = startTime
				? Math.round((Date.now() - startTime.getTime()) / 60000)
				: undefined;

			createSessionMutation.mutate({
				templateId: scheduledTemplate.id,
				title: localSession.title,
				sessionDate: new Date().toISOString(),
				...(durationMinutes !== undefined && { durationMinutes }),
				exercises: localSession.exercises.map((ex, ei) => ({
					exerciseId: ex.exerciseId,
					orderIndex: ex.orderIndex,
					sets: sets[ei].map((s) => ({
						setNumber: s.setNumber,
						reps: s.reps,
						weight: s.weight,
						durationSeconds: s.durationSeconds,
						restSeconds: s.restSeconds,
						notes: s.notes,
					})),
				})),
			});
		}
	};

	const handleCancel = () => {
		// Nothing to delete — session was never created in the database
		setLocalSession(null);
		setCompletedSets(null);
		setStartTime(null);
		setScreen("entry");
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
					/>
				);
			case "active":
				if (!localSession) return null;
				return (
					<ActiveSession
						session={localSession}
						onComplete={handleComplete}
						onCancel={handleCancel}
					/>
				);
			case "complete":
				if (!localSession || !completedSets || !startTime) return null;
				return (
					<CompletionScreen
						session={localSession}
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
