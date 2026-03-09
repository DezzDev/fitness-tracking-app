// src/features/workouts/pages/StartSessionPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useCreateSessionFromTemplate } from '../hooks/useWorkoutSessions';
import ActiveSession from '@/features/dashboard/components/ActiveSession';
import CompletionScreen from '@/features/dashboard/components/CompletionScreen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkoutSessionWithExercises } from '@/types';

type Screen = 'creating' | 'active' | 'complete' | 'error';

export default function StartSessionPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const templateId = searchParams.get('templateId');

	const [screen, setScreen] = useState<Screen>('creating');
	const [activeSession, setActiveSession] = useState<WorkoutSessionWithExercises | null>(null);
	const [completedSets, setCompletedSets] = useState<boolean[][] | null>(null);
	const [startTime] = useState<Date>(new Date());
	const [errorMessage, setErrorMessage] = useState<string>('');

	const createSessionMutation = useCreateSessionFromTemplate();

	// Crear sesión inmediatamente al montar
	useEffect(() => {
		if (!templateId) {
			setErrorMessage('No se especificó una plantilla');
			setScreen('error');
			return;
		}

		createSessionMutation.mutate(
			{
				templateId,
				sessionDate: new Date(),
				notes: undefined,
				durationMinutes: undefined,
			},
			{
				onSuccess: (session) => {
					setActiveSession(session);
					setScreen('active');
				},
				onError: (error) => {
					setErrorMessage(
						error instanceof Error ? error.message : 'No se pudo crear la sesión'
					);
					setScreen('error');
				},
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateId]);

	const handleComplete = (sets: boolean[][]) => {
		setCompletedSets(sets);
		setScreen('complete');
	};

	const handleReturn = () => {
		if (activeSession) {
			navigate(`/workouts/sessions/${activeSession.id}`);
		} else {
			navigate('/workouts');
		}
	};

	// Creating session - loading state
	if (screen === 'creating') {
		return (
			<div className="flex flex-col items-center justify-center h-full w-full gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="font-barlow text-sm tracking-[2px] text-muted-foreground uppercase">
					Iniciando sesión...
				</p>
			</div>
		);
	}

	// Error state
	if (screen === 'error') {
		return (
			<Card className="p-12 text-center max-w-md mx-auto w-full">
				<p className="text-destructive font-bebas text-xl tracking-wide mb-2">
					Error al iniciar sesión
				</p>
				<p className="text-muted-foreground mb-6 font-barlow text-sm">
					{errorMessage}
				</p>
				<Button onClick={() => navigate('/workouts')}>
					Volver a Workouts
				</Button>
			</Card>
		);
	}

	// Active session
	if (screen === 'active' && activeSession) {
		return <ActiveSession session={activeSession} onComplete={handleComplete} />;
	}

	// Completion screen
	if (screen === 'complete' && activeSession && completedSets) {
		return (
			<CompletionScreen
				session={activeSession}
				completedSets={completedSets}
				startTime={startTime}
				onReturn={handleReturn}
			/>
		);
	}

	return null;
}
