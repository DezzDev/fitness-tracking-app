// src/features/workouts/pages/WorkoutDetailPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Clock, Dumbbell, TrendingUp, Copy, Trash2, AlertTriangle } from "lucide-react";

import { useWorkoutSession, useDeleteSession } from "../hooks/useWorkoutSessions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WorkoutDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const sessionId = id!;

	const { data: response, isLoading, isError } = useWorkoutSession(sessionId);
	const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);

	const session = response || null;

	const handleDelete = () => {
		deleteSession(sessionId, {
			onSuccess: () => {
				navigate('/workouts');
			}
		});
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<Skeleton className='h-10 w-3/4' />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (isError || !session) {
		return (
			<Card className="p-12 text-center max-w-md mx-auto">
				<p className="text-muted-foreground mb-4">
					Sesión no encontrada
				</p>
				<Button onClick={() => navigate('/workouts')}>
					Volver a Workouts
				</Button>
			</Card>
		);
	}

	const sessionDate = new Date(session.sessionDate);
	const exercises = session.exercises || [];

	// Calcular métricas
	const totalSets = exercises.reduce((sum: number, ex: any) => sum + (ex.sets?.length || 0), 0);
	const totalVolume = exercises.reduce((sum: number, ex: any) => {
		const exerciseVolume = ex.sets?.reduce((exSum: number, set: any) => {
			const weight = set.weight || 0;
			const reps = set.reps || 0;
			return exSum + (weight * reps);
		}, 0) || 0;
		return sum + exerciseVolume;
	}, 0);

	return (
		<>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Back Button */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate('/workouts')}
					className="font-barlow uppercase tracking-wide text-xs"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Workouts
				</Button>

				{/* Header */}
				<div className="space-y-4">
					{/* Fecha tag */}
					<Badge 
						variant="outline" 
						className="font-barlow uppercase tracking-wide text-xs"
					>
						{format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })}
					</Badge>

					{/* Título */}
					<h1 className="text-4xl font-bebas tracking-wide uppercase text-foreground">
						Sesión Completada
					</h1>

					{/* Stats row */}
					<div className="flex items-center gap-6 text-sm font-barlow">
						{session.durationMinutes && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-primary" />
								<span className="text-foreground font-semibold">{session.durationMinutes}</span>
								<span className="text-muted-foreground">minutos</span>
							</div>
						)}
						
						<div className="flex items-center gap-2">
							<Dumbbell className="h-4 w-4 text-primary" />
							<span className="text-foreground font-semibold">{totalSets}</span>
							<span className="text-muted-foreground">series</span>
						</div>

						{totalVolume > 0 && (
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-primary" />
								<span className="text-foreground font-semibold">{Math.round(totalVolume)}</span>
								<span className="text-muted-foreground">kg</span>
							</div>
						)}
					</div>
				</div>

				{/* Título de sesión */}
				{session.title && (
					<Card className="bg-muted/10">
						<div className="p-4">
							<h2 className="font-bebas tracking-wide text-xl text-foreground">
								{session.title}
							</h2>
							{session.notes && (
								<p className="text-muted-foreground font-barlow mt-2 text-sm">
									{session.notes}
								</p>
							)}
						</div>
					</Card>
				)}

				{/* Comparación de volumen (placeholder) */}
				{/* TODO: Implementar gráfico de comparación vs sesión anterior */}

				{/* Ejercicios */}
				<Card>
					<div className="p-6 space-y-6">
						<h2 className="text-lg font-bebas tracking-widest uppercase text-foreground">
							Ejercicios ({exercises.length})
						</h2>

						{exercises.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Dumbbell className='h-12 w-12 mx-auto mb-3 opacity-50' />
								<p className="font-barlow">No hay ejercicios registrados</p>
							</div>
						) : (
							<div className="space-y-6">
								{exercises.map((workoutExercise: any, index: number) => (
									<div key={workoutExercise.id}>
										{index > 0 && <Separator className="my-6" />}
										
										<div className="space-y-4">
											{/* Ejercicio info */}
											<div className="flex items-start gap-3">
												<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
													<span className="text-sm font-bebas text-primary">
														{index + 1}
													</span>
												</div>

												<div className="flex-1 min-w-0 space-y-1">
													<h3 className="font-bebas tracking-wide text-lg text-foreground">
														{workoutExercise.exercise?.name || 'Ejercicio'}
													</h3>
													
													{workoutExercise.exercise?.muscleGroup && (
														<Badge 
															variant="secondary" 
															className="font-barlow uppercase text-xs tracking-wide"
														>
															{workoutExercise.exercise.muscleGroup}
														</Badge>
													)}
												</div>
											</div>

											{/* Series */}
											{workoutExercise.sets && workoutExercise.sets.length > 0 && (
												<div className="ml-11 space-y-2">
													{workoutExercise.sets.map((set: any) => (
														<div 
															key={set.setNumber}
															className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg"
														>
															<span className="text-xs font-barlow font-bold uppercase text-muted-foreground tracking-wide min-w-[60px]">
																Serie {set.setNumber}
															</span>

															<div className="flex items-center gap-4 flex-wrap text-sm font-barlow">
																{set.reps !== null && set.reps !== undefined && (
																	<div>
																		<span className="font-semibold text-foreground">{set.reps}</span>
																		<span className="text-muted-foreground ml-1">reps</span>
																	</div>
																)}

																{set.weight !== null && set.weight !== undefined && set.weight > 0 && (
																	<div>
																		<span className="font-semibold text-foreground">{set.weight}</span>
																		<span className="text-muted-foreground ml-1">kg</span>
																	</div>
																)}

																{set.durationSeconds !== null && set.durationSeconds !== undefined && set.durationSeconds > 0 && (
																	<div>
																		<span className="font-semibold text-foreground">{set.durationSeconds}</span>
																		<span className="text-muted-foreground ml-1">seg</span>
																	</div>
																)}
															</div>

															{set.notes && (
																<p className="text-sm text-muted-foreground ml-auto font-barlow">
																	{set.notes}
																</p>
															)}
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</Card>

				{/* Acciones */}
				<div className="flex gap-3 pt-4">
					<Button
						variant="outline"
						size="lg"
						className="uppercase font-barlow font-semibold tracking-wide"
						onClick={() => {/* TODO: Implementar duplicar */}}
					>
						<Copy className="h-5 w-5 mr-2" />
						Duplicar
					</Button>

					<Button
						variant="destructive"
						size="lg"
						className="uppercase font-barlow font-semibold tracking-wide"
						onClick={() => setShowDeleteDialog(true)}
					>
						<Trash2 className="h-5 w-5 mr-2" />
						Eliminar
					</Button>
				</div>
			</div>

			{/* Dialog de confirmación de eliminación */}
			<Dialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5"/>
							¿Eliminar sesión?
						</DialogTitle>
						<DialogDescription>
							<p className="mb-3">
								Estás a punto de eliminar esta sesión de entrenamiento.
							</p>
							<p className="font-semibold text-foreground mb-3">
								"{session.title}"
							</p>
							<p className="text-sm">
								Esta acción no se puede deshacer. Se eliminarán todos los ejercicios y series asociados.
							</p>
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant={'outline'}
							onClick={() => setShowDeleteDialog(false)}
							disabled={isDeleting}
						>
							Cancelar
						</Button>
						<Button
							variant={'destructive'}
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Eliminando...' : 'Eliminar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}


