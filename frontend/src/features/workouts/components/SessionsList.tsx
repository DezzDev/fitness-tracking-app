// src/features/workouts/components/SessionsList.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dumbbell } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkoutSessions } from '../hooks/useWorkoutSessions';
import type { WorkoutSessionWithMetrics } from '@/types';
import { Separator } from '@/components/ui/separator';

export default function SessionsList() {
	const { data, isLoading } = useWorkoutSessions({ limit: 100 });


	const sessions = data?.data.items || [];

	// Agrupar sesiones por mes
	const sessionsByMonth = useMemo(() => {
		const grouped = new Map<string, WorkoutSessionWithMetrics[]>();

		sessions.forEach((session) => {
			const sessionDate = new Date(session.sessionDate);
			const monthKey = format(sessionDate, 'MMMM yyyy', { locale: es }).toUpperCase();

			if (!grouped.has(monthKey)) {
				grouped.set(monthKey, []);
			}
			grouped.get(monthKey)!.push(session);
		});

		return grouped;
	}, [sessions]);

	// Format volume for display
	const formatVolume = (volumeKg: number): string => {
		if (volumeKg >= 1000) {
			return `${(volumeKg / 1000).toFixed(1)}K KG`;
		}
		return `${Math.round(volumeKg)} KG`;
	};

	// Format date badge
	const formatDateBadge = (dateString: string): string => {
		const sessionDate = new Date(dateString);
		
		if (isToday(sessionDate)) {
			return 'HOY';
		}
		
		return format(sessionDate, 'd MMM', { locale: es }).toUpperCase();
	};

	return (
		<div className="space-y-6">
			{/* Loading */}
			{isLoading ? (
				<div className="space-y-6">
					{[ ...Array(3) ].map((_, i) => (
						<div key={i} className="space-y-3">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-24 w-full" />
						</div>
					))}
				</div>
			) : sessions.length === 0 ? (
				/* Empty state */
				<Card className="border-2 border-dashed border-border bg-muted/5">
					<div className="p-12 text-center max-w-sm mx-auto space-y-4">
						<div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
							<Dumbbell className="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<h3 className="text-lg font-bebas tracking-wide uppercase text-foreground">
								No hay sesiones
							</h3>
							<p className="text-muted-foreground mt-1 text-sm font-barlow">
								Inicia tu primer entrenamiento
							</p>
						</div>
					</div>
				</Card>
			) : (
				/* Lista agrupada por mes */
				<div className="space-y-8">
					{Array.from(sessionsByMonth.entries()).map(([ monthKey, monthSessions ]) => (
						<div key={monthKey} className="space-y-3">
							{/* Divisor de mes */}
							
								<h3 className="text-sm font-bebas tracking-[3px] text-muted-foreground uppercase mb-2">
									{monthKey}
								</h3>
							<Separator className="mb-4" />

							{/* Sesiones del mes */}
							<div className="grid gap-4 sm:grid-cols-2">
								{monthSessions.map((session) => {
									const sessionDate = new Date(session.sessionDate);
									const isTodaySession = isToday(sessionDate);

									return (
										<Link 
											key={session.id} 
											to={`/workouts/sessions/${session.id}`}
											className="block"
										>
											<Card className={`
												hover:shadow-md transition-all duration-200 
												hover:border-primary/50 cursor-pointer rounded-none
												${isTodaySession ? 'border-primary/40 bg-primary/5' : 'border-border'}
											`}>
												<div className="px-4">
													<div className="flex items-start justify-between gap-4">
														{/* Left side - Session info */}
														<div className="flex-1 min-w-0 space-y-3">
															{/* Date tag and title */}
															<div className="space-y-2">
																<span 
																	
																	className={`
																		font-barlow font-bold uppercase text-xs text-primary tracking-wider
																		${isTodaySession ? 'border-primary text-primary' : 'border-border text-muted-foreground'}
																	`}
																>
																	{formatDateBadge(session.sessionDate)}
																</span>

																<h4 className="font-bebas tracking-wide text-xl text-foreground uppercase leading-none">
																	{session.title}
																</h4>
															</div>

															{/* Metrics row */}
															<div className="flex items-center gap-4 text-xs font-barlow font-semibold uppercase tracking-wider text-muted-foreground">
																<span>{session.totalExercises} EJ</span>
																<span>{session.totalSets} SERIES</span>
																<span>{formatVolume(session.totalVolumeKg)}</span>
															</div>
														</div>

														{/* Right side - Duration */}
														<div className="flex flex-col items-end gap-2 shrink-0">
															
															{session.durationMinutes && (
																<div className="font-bebas text-base text-muted-foreground leading-none">
																	{session.durationMinutes} MIN
																</div>
															)}
														</div>
													</div>
												</div>
											</Card>
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}