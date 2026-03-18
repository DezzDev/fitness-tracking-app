// src/features/workouts/pages/StartSessionPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useCreateSession } from '../hooks/useWorkoutSessions';
import { useWorkoutTemplate } from '../hooks/useWorkoutTemplates';
import ActiveSession from '@/features/dashboard/components/ActiveSession';
import CompletionScreen from '@/features/dashboard/components/CompletionScreen';
import { templateToSession } from '@/features/dashboard/utils/templateToSession';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkoutPersistence } from '@/hooks/useWorkoutPersistence';
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
	const [startTime, setStartTime] = useState<Date>(new Date());
	const [conflictData, setConflictData] = useState<ConflictData | null>(null);

	const createSessionMutation = useCreateSession();
	const persistence = useWorkoutPersistence();

	// Fetch the template — no session is created in DB until completion
	const { data: template, isLoading, isError } = useWorkoutTemplate(templateId ?? '');

	// Once the template is loaded, check for persisted state
	useEffect(() => {
		if (template && screen === 'loading' && !isLoading) {
			const persisted = persistence.loadPersistedState();
			
			if (persisted) {
				if (persisted.templateId === template.id) {
					// Same template: restore state
					setLocalSession(persisted.localSession);
					setStartTime(new Date(persisted.startTime));
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
			setScreen('active');
		}
	}, [template, screen, isLoading, persistence]);

	if (!templateId && screen !== 'error') {
		setScreen('error');
	}

	// Callback to persist state changes
	const handleStateChange = (sets: EditableSet[][], idx: number) => {
		if (localSession && template) {
			persistence.saveState({
				version: 1,
				templateId: template.id,
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
		// Clear persisted state and navigate back
		persistence.clearState();
		navigate('/workouts');
	};

	const handleComplete = (sets: EditableSet[][]) => {
		// Clear persisted state immediately
		persistence.clearState();
		
		setCompletedSets(sets);
		setScreen('complete');

		// NOW create the session in the database with actual values
		if (localSession && template && !createSessionMutation.isPending) {
			const durationMinutes = Math.round(
				(Date.now() - startTime.getTime()) / 60000
			);

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
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
				<div className="mx-8 w-full max-w-md border border-border bg-background p-8 space-y-6">
					<div>
						<div className="font-bebas text-2xl tracking-[2px] text-foreground mb-2">
							ENTRENAMIENTO EN PROGRESO
						</div>
						<p className="font-barlow text-sm text-muted-foreground">
							Tienes un entrenamiento en progreso de{' '}
							<strong className="text-foreground">
								{conflictData.persisted.localSession.title}
							</strong>
							. ¿Qué deseas hacer?
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<button
							onClick={() => {
								setLocalSession(conflictData.persisted.localSession);
								setStartTime(new Date(conflictData.persisted.startTime));
								setConflictData(null);
								setScreen('restoring');
								navigate(`/workouts/sessions/start?templateId=${conflictData.persisted.templateId}`, { replace: true });
								setTimeout(() => setScreen('active'), 1000);
							}}
							className="w-full bg-primary border-none text-black font-bebas text-[18px] tracking-[3px] py-4 cursor-pointer hover:bg-primary/90 transition-colors"
						>
							CONTINUAR ENTRENAMIENTO
						</button>
						<button
							onClick={() => {
								persistence.clearState();
								const session = templateToSession(template!);
								setLocalSession(session);
								setStartTime(new Date());
								setConflictData(null);
								setScreen('active');
							}}
							className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-[13px] tracking-[3px] py-4 cursor-pointer hover:bg-muted/20 transition-colors"
						>
							DESCARTAR E INICIAR NUEVO
						</button>
					</div>
				</div>
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
		const persisted = persistence.loadPersistedState();
		return (
			<ActiveSession
				session={localSession}
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
				startTime={startTime}
				onReturn={handleReturn}
				createdSessionId={createSessionMutation.data?.id}
				isSaving={createSessionMutation.isPending}
			/>
		);
	}

	return null;
}
