// src/features/workouts/pages/StartSessionPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useCreateSession, usePreviousSessionForTemplate } from '../hooks/useWorkoutSessions';
import { useWorkoutTemplate } from '../hooks/useWorkoutTemplates';
import ActiveSession from '@/features/dashboard/components/ActiveSession';
import CompletionScreen from '@/features/dashboard/components/CompletionScreen';
import { templateToSession } from '@/features/dashboard/utils/templateToSession';
import PendingWorkoutDecisionModal from '@/features/workouts/components/PendingWorkoutDecisionModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkoutPersistence } from '@/hooks/useWorkoutPersistence';
import { MAX_VALID_WORKOUT_DURATION_MINUTES } from '@/lib/workoutStorage';
import type { WorkoutSessionWithExercises, EditableSet } from '@/types';
import type { PersistedWorkoutState } from '@/types/storage';

type Screen = 'loading' | 'restoring' | 'conflict' | 'active' | 'complete' | 'error';

interface ConflictData {
	persisted: PersistedWorkoutState;
}

export default function StartSessionPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const templateId = searchParams.get('templateId');

	const [screen, setScreen] = useState<Screen>('loading');
	const [localSession, setLocalSession] = useState<WorkoutSessionWithExercises | null>(null);
	const [completedSets, setCompletedSets] = useState<EditableSet[][] | null>(null);
	const [completedDurationMinutes, setCompletedDurationMinutes] = useState<number | null>(null);
	const [startTime, setStartTime] = useState<Date>(new Date());
	const [conflictData, setConflictData] = useState<ConflictData | null>(null);
	const latestEditableSetsRef = useRef<EditableSet[][] | null>(null);
	const latestExerciseIndexRef = useRef(0);
	const isFinishingRef = useRef(false);

	const createSessionMutation = useCreateSession();
	const persistence = useWorkoutPersistence();

	// Fetch the template — no session is created in DB until completion
	const { data: template, isLoading, isError } = useWorkoutTemplate(templateId ?? '');
	const { data: previousSession } = usePreviousSessionForTemplate(templateId ?? undefined);

	// Once the template is loaded, check for persisted state
	useEffect(() => {
		if (template && screen === 'loading' && !isLoading) {
			const persisted = persistence.loadPersistedState();
			
			if (persisted) {
				if (persisted.templateId === template.id) {
					// Same template: restore state
					setLocalSession(persisted.localSession);
					setStartTime(new Date(persisted.startTime));
					latestEditableSetsRef.current = persisted.editableSets;
					latestExerciseIndexRef.current = persisted.currentExerciseIndex;
					setScreen('restoring');
					setTimeout(() => setScreen('active'), 1000);
					return;
				} else {
					// Conflict: different template in progress
					setConflictData({ persisted });
					setScreen('conflict');
					return;
				}
			}
			
			// No persisted state: create new session
			const session = templateToSession(template);
			setLocalSession(session);
			latestEditableSetsRef.current = null;
			latestExerciseIndexRef.current = 0;
			setStartTime(new Date());
			setScreen('active');
		}
	}, [template, screen, isLoading, persistence]);

	if (!templateId && screen !== 'error') {
		setScreen('error');
	}

	useEffect(() => {
		if (screen !== 'active' || !localSession || !template) {
			return;
		}

		const persistNow = () => {
			if (isFinishingRef.current) {
				return;
			}

			const now = Date.now();

			persistence.saveStateNow({
				version: 1,
				templateId: localSession.templateId ?? template.id,
				localSession,
				editableSets: latestEditableSetsRef.current ?? [],
				currentExerciseIndex: latestExerciseIndexRef.current,
				startTime: startTime.toISOString(),
				lastUpdated: new Date(now).toISOString(),
				source: 'start',
			});
		};

		const handlePageHide = () => {
			persistNow();
		};

		window.addEventListener('pagehide', handlePageHide);
		window.addEventListener('beforeunload', handlePageHide);

		return () => {
			window.removeEventListener('pagehide', handlePageHide);
			window.removeEventListener('beforeunload', handlePageHide);
			persistNow();
		};
	}, [
		screen,
		localSession,
		template,
		startTime,
		persistence,
	]);

	// Callback to persist state changes
	const handleStateChange = (sets: EditableSet[][], idx: number) => {
		latestEditableSetsRef.current = sets;
		latestExerciseIndexRef.current = idx;

		if (localSession && template) {
			persistence.saveState({
				version: 1,
				templateId: localSession.templateId ?? template.id,
				localSession,
				editableSets: sets,
				currentExerciseIndex: idx,
				startTime: startTime.toISOString(),
				lastUpdated: new Date().toISOString(),
				source: 'start',
			});
		}
	};

	const handleCancel = () => {
		isFinishingRef.current = true;
		// Clear persisted state and navigate back
		persistence.clearState();
		navigate('/workouts');
	};

	const handleComplete = (sets: EditableSet[][]) => {
		isFinishingRef.current = true;
		latestEditableSetsRef.current = sets;

		const now = Date.now();
		const totalElapsedMs = Math.max(0, now - startTime.getTime());
		const rawDurationMinutes = Math.round(totalElapsedMs / 60000);
		const durationMinutes =
			rawDurationMinutes > MAX_VALID_WORKOUT_DURATION_MINUTES ? undefined : rawDurationMinutes;
		setCompletedDurationMinutes(durationMinutes ?? null);

		// Clear persisted state immediately
		persistence.clearState();
		
		setCompletedSets(sets);
		setScreen('complete');

		// NOW create the session in the database with actual values
		if (localSession && template && !createSessionMutation.isPending) {
			createSessionMutation.mutate({
				templateId: localSession.templateId ?? template.id,
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
		navigate(-1);
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

	// Restoring persisted state
	if (screen === 'restoring') {
		return (
			<div className="flex flex-col items-center justify-center h-full w-full gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="font-barlow text-sm tracking-[2px] text-muted-foreground uppercase">
					Restaurando progreso...
				</p>
			</div>
		);
	}

	// Conflict modal
	if (screen === 'conflict' && conflictData) {
		return (
			<PendingWorkoutDecisionModal
				open
				title={conflictData.persisted.localSession.title}
				onOpenChange={(open) => {
					if (!open) {
						setConflictData(null);
						navigate('/workouts');
					}
				}}
				onContinue={() => {
					setLocalSession(conflictData.persisted.localSession);
					setStartTime(new Date(conflictData.persisted.startTime));
					latestEditableSetsRef.current = conflictData.persisted.editableSets;
					latestExerciseIndexRef.current = conflictData.persisted.currentExerciseIndex;
					setConflictData(null);
					setScreen('restoring');
					navigate(`/workouts/sessions/start?templateId=${conflictData.persisted.templateId}`, {
						replace: true,
					});
					setTimeout(() => setScreen('active'), 1000);
				}}
				onCancel={() => {
					persistence.clearState();
					const session = templateToSession(template!);
					setLocalSession(session);
					latestEditableSetsRef.current = null;
					latestExerciseIndexRef.current = 0;
					setStartTime(new Date());
					setConflictData(null);
					setScreen('active');
				}}
			/>
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
		const persisted = persistence.loadPersistedState();
		return (
			<ActiveSession
				session={localSession}
				previousSession={previousSession ?? null}
				onComplete={handleComplete}
				onCancel={handleCancel}
				initialEditableSets={persisted?.editableSets}
				initialExerciseIndex={persisted?.currentExerciseIndex}
				onStateChange={handleStateChange}
			/>
		);
	}

	// Completion screen
	if (screen === 'complete' && localSession && completedSets) {
		return (
			<CompletionScreen
				session={localSession}
				completedSets={completedSets}
				durationMinutes={completedDurationMinutes}
				onReturn={handleReturn}
				createdSessionId={createSessionMutation.data?.id}
				isSaving={createSessionMutation.isPending}
			/>
		);
	}

	return null;
}
