// src/features/workouts/components/SessionsList.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dumbbell, Clock, ArrowRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkoutSessions } from '../hooks/useWorkoutSessions';
import type { WorkoutSession } from '@/types';

export default function SessionsList() {
	const { data, isLoading } = useWorkoutSessions({ limit: 100 });


	const sessions = data?.data.items || [];

	// Agrupar sesiones por mes
	const sessionsByMonth = useMemo(() => {
		const grouped = new Map<string, WorkoutSession[]>();

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
							<div className="flex items-center gap-3">
								<h3 className="text-sm font-bebas tracking-widest text-muted-foreground uppercase">
									{monthKey}
								</h3>
								<div className="flex-1 h-px bg-border" />
							</div>

							{/* Sesiones del mes */}
							<div className="space-y-3">
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
												hover:border-primary/50 cursor-pointer
												${isTodaySession ? 'border-primary/40 bg-primary/5' : 'border-border'}
											`}>
												<div className="p-4">
													{/* Header con fecha y nombre */}
													<div className="flex items-start justify-between gap-4 mb-3">
														<div className="flex items-center gap-3 flex-1 min-w-0">
															{/* Tag de fecha */}
															<Badge 
																variant="outline" 
																className={`
																	shrink-0 font-barlow font-bold uppercase text-xs
																	${isTodaySession ? 'border-primary text-primary' : 'border-border text-muted-foreground'}
																`}
															>
																{format(sessionDate, 'd MMM', { locale: es })}
															</Badge>

															{/* Nombre de sesión */}
															<h4 className="font-bebas tracking-wide text-lg text-foreground truncate">
																{session.title}
															</h4>
														</div>

														<ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
													</div>

													{/* Métricas */}
													<div className="flex items-center gap-4 text-sm text-muted-foreground font-barlow">
														{/* Duración */}
														{session.durationMinutes && (
															<div className="flex items-center gap-1.5">
																<Clock className="h-4 w-4" />
																<span>{session.durationMinutes} min</span>
															</div>
														)}

														{/* Placeholder para ejercicios/series/volumen - necesitaremos datos adicionales */}
														<div className="flex items-center gap-1.5">
															<Dumbbell className="h-4 w-4" />
															<span>Ver detalle</span>
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