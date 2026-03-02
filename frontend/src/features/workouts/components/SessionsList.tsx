// src/features/workouts/components/SessionsList.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Calendar, Dumbbell, Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkoutSessions, useDeleteSession } from '../hooks/useWorkoutSessions';

export default function SessionsList() {
	const [ searchTerm, setSearchTerm ] = useState('');
	const { data, isLoading } = useWorkoutSessions({ searchTerm, limit: 50 });
	const { mutate: deleteSession } = useDeleteSession();

	const sessions = data?.data.items || [];

	return (
		<div className="space-y-6">
			{/* Búsqueda */}
			<Card className="p-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar entrenamientos..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</Card>

			{/* Lista */}
			{isLoading ? (
				<div className="space-y-3">
					{[ ...Array(5) ].map((_, i) => (
						<Card key={i} className="p-4">
							<Skeleton className="h-20 w-full" />
						</Card>
					))}
				</div>
			) : sessions.length === 0 ? (
				<Card className="p-12 text-center">
					<div className="max-w-sm mx-auto space-y-4">
					<div className="w-16 h-16 bg-[var(--surface-elevated)] rounded-full flex items-center justify-center mx-auto">
						<Dumbbell className="h-8 w-8 text-muted-foreground" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">
							No hay entrenamientos registrados
						</h3>
						<p className="text-muted-foreground mt-1">
								Inicia tu primer entrenamiento
							</p>
						</div>
						<Link to="/workouts/sessions/start">
							<Button>
								<Dumbbell className="mr-2 h-4 w-4" />
								Iniciar Entrenamiento
							</Button>
						</Link>
					</div>
				</Card>
			) : (
				<div className="space-y-3">
					{sessions.map((session) => {
						const sessionDate = new Date(session.sessionDate);

						return (
							<Card key={session.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<div className="flex items-center justify-between gap-4">
										{/* Info principal */}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-foreground truncate">
												{session.title}
											</h3>

											<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													<span>
														{format(sessionDate, "d 'de' MMM, yyyy", { locale: es })}
													</span>
												</div>

												{session.durationMinutes && (
													<Badge variant="outline" className="text-xs">
														{session.durationMinutes} min
													</Badge>
												)}
											</div>

											{session.notes && (
												<p className="text-sm text-muted-foreground mt-2 line-clamp-1">
													{session.notes}
												</p>
											)}
										</div>

										{/* Acciones */}
										<div className="flex items-center gap-2">
											<Link to={`/workouts/sessions/${session.id}`}>
												<Button variant="ghost" size="sm">
													<Eye className="h-4 w-4" />
												</Button>
											</Link>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => deleteSession(session.id)}
												className="text-destructive hover:text-destructive/80"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}