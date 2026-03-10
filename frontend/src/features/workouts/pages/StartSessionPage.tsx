// src/features/workouts/pages/StartSessionPage.tsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useCreateSession } from '../hooks/useWorkoutSessions';
import { useWorkoutTemplate } from '../hooks/useWorkoutTemplates';
import ActiveSession from '@/features/dashboard/components/ActiveSession';
import CompletionScreen from '@/features/dashboard/components/CompletionScreen';
import { templateToSession } from '@/features/dashboard/utils/templateToSession';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkoutSessionWithExercises, EditableSet } from '@/types';

type Screen = 'loading' | 'active' | 'complete' | 'error';

export default function StartSessionPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const templateId = searchParams.get('templateId');

	const [screen, setScreen] = useState<Screen>('loading');
	const [localSession, setLocalSession] = useState<WorkoutSessionWithExercises | null>(null);
	const [completedSets, setCompletedSets] = useState<EditableSet[][] | null>(null);
	const [startTime] = useState<Date>(new Date());

	const createSessionMutation = useCreateSession();

	// Fetch the template — no session is created in DB until completion
	const { data: template, isLoading, isError } = useWorkoutTemplate(templateId ?? '');

	// Once the template is loaded, build the local session and switch to active
	if (template && screen === 'loading' && !isLoading) {
		const session = templateToSession(template);
		setLocalSession(session);
		setScreen('active');
	}

	if (!templateId && screen !== 'error') {
		setScreen('error');
	}

	const handleCancel = () => {
		// Nothing to delete — session was never created in the database
		navigate('/workouts');
	};

	const handleComplete = (sets: EditableSet[][]) => {
		setCompletedSets(sets);
		setScreen('complete');

		// NOW create the session in the database with actual values
		if (localSession && template && !createSessionMutation.isPending) {
			const durationMinutes = Math.round(
				(Date.now() - startTime.getTime()) / 60000
			);

			createSessionMutation.mutate({
				templateId: template.id,
				title: localSession.title,
				sessionDate: new Date().toISOString(),
				durationMinutes,
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

	const handleReturn = () => {
		navigate('/workouts');
	};

	// Loading template
	if (screen === 'loading' || isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-full w-full gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="font-barlow text-sm tracking-[2px] text-muted-foreground uppercase">
					Cargando plantilla...
				</p>
			</div>
		);
	}

	// Error state
	if (screen === 'error' || isError || !templateId) {
		return (
			<Card className="p-12 text-center max-w-md mx-auto w-full">
				<p className="text-destructive font-bebas text-xl tracking-wide mb-2">
					Error al cargar la plantilla
				</p>
				<p className="text-muted-foreground mb-6 font-barlow text-sm">
					{!templateId
						? 'No se especifico una plantilla'
						: 'No se pudo cargar la plantilla'}
				</p>
				<Button onClick={() => navigate('/workouts')}>
					Volver a Workouts
				</Button>
			</Card>
		);
	}

	// Active session
	if (screen === 'active' && localSession) {
		return (
			<ActiveSession
				session={localSession}
				onComplete={handleComplete}
				onCancel={handleCancel}
			/>
		);
	}

	// Completion screen
	if (screen === 'complete' && localSession && completedSets) {
		return (
			<CompletionScreen
				session={localSession}
				completedSets={completedSets}
				startTime={startTime}
				onReturn={handleReturn}
			/>
		);
	}

	return null;
}
