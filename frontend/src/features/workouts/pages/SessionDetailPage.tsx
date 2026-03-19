// src/features/workouts/pages/WorkoutDetailPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Dumbbell, Copy, Trash2, AlertTriangle } from "lucide-react";

import { useWorkoutSession, useDeleteSession } from "../hooks/useWorkoutSessions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { WorkoutSessionExercise, WorkoutSessionSet } from "@/types";

export default function SessionDetailPage() {
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
				navigate(-1);
			}
		});
	};

	if (isLoading) {
		return (
			<div className="mx-auto space-y-6 w-full">
				<Skeleton className='h-10 w-3/4' />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (isError || !session) {
		return (
			<Card className="p-12 text-center mx-auto w-full">
				<p className="text-muted-foreground mb-4">
					Sesión no encontrada
				</p>
				<Button onClick={() => navigate('/workouts?tab=sessions')}>
					Ir a historial
				</Button>
			</Card>
		);
	}

	const sessionDate = new Date(session.sessionDate);
	const exercises = session.exercises || [];


	// Calcular métricas
	const totalSets = exercises.reduce((sum: number, ex: WorkoutSessionExercise) => sum + (ex.sets?.length || 0), 0);
	const totalVolume = exercises.reduce((sum: number, ex: WorkoutSessionExercise) => {
		const exerciseVolume = ex.sets?.reduce((exSum: number, set: WorkoutSessionSet) => {
			const weight = set.weight || 0;
			const reps = set.reps || 0;
			return exSum + (weight * reps);
		}, 0) || 0;
		return sum + exerciseVolume;
	}, 0);

	return (
		<>
			<div className="px-2 md:px-6 space-y-6 w-full">
				{/* Back Button */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(-1)}
					className="font-barlow uppercase tracking-[2px] text-xs"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Volver
				</Button>


				{/* Header */}
				<div className="space-y-4">

					{/* Fecha tag */}
					<h2
						className="font-barlow uppercase tracking-[3px] text-xs text-primary mb-2"
					>
						{format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })}
						{session.templateName ? ` - ${session.templateName}` : ''}
					</h2>


					{/* Título */}
					<h1 className="text-4xl font-bebas tracking-wide uppercase text-foreground">
						Sesión Completada
					</h1>

					{/* Stats row */}
					<div className="flex items-center gap-6 text-sm font-barlow">
						{session.durationMinutes && (
							<div className="flex flex-col items-center">
								<span className="text-foreground font-semibold text-lg">{session.durationMinutes}</span>
								<span className="text-muted-foreground uppercase text-sm tracking-[2px] ">min</span>
							</div>
						)}

						<div className="flex flex-col items-center">
							<span className="text-foreground font-semibold text-lg">{totalSets}</span>
							<span className="text-muted-foreground uppercase text-sm tracking-[2px]">series</span>
						</div>

						{totalVolume > 0 && (
							<div className="flex flex-col items-center">
								<span className="text-foreground font-semibold text-lg">{Math.round(totalVolume)}</span>
								<span className="text-muted-foreground uppercase text-sm tracking-[2px]">kg</span>
							</div>
						)}
					</div>
				</div>

				<Separator />

				{/* Estadisticas de comparacion */}
				<p>Estadísticas de comparación</p>
				{/* Comparación de volumen (placeholder) */}
				{/* TODO: Implementar gráfico de comparación vs sesión anterior */}

				<Separator />
				

				{/* Ejercicios */}
				<div>
					<div className="space-y-6">
						<h2 className="text-lg font-bebas tracking-[2px] uppercase text-foreground">
							Ejercicios
						</h2>
						<Separator />
						{exercises.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Dumbbell className='h-12 w-12 mx-auto mb-3 opacity-50' />
								<p className="font-barlow">No hay ejercicios registrados</p>
							</div>
						) : (
							<div className="space-y-6">
								{exercises.map((workoutExercise: WorkoutSessionExercise, index: number) => (
									<div key={workoutExercise.id}>
										{index > 0 && <Separator className="my-6" />}

										<div className="space-y-4">
											{/* Ejercicio info */}
											<div className="flex flex-col items-start gap-1">

												{workoutExercise.muscleGroup && (
													<div
														className="font-barlow uppercase text-xs tracking-[2px] text-primary"
													>
														{workoutExercise.muscleGroup}
													</div>
												)}

												<div className="flex-1 min-w-0 space-y-1">
													<h3 className="font-bebas tracking-[2px] text-2xl text-foreground">
														{workoutExercise.exerciseName || 'Ejercicio'}
													</h3>

												</div>
											</div>

											{/* Series */}
											{workoutExercise.sets && workoutExercise.sets.length > 0 && (
												<div className="space-y-2">
													{workoutExercise.sets.map((set: WorkoutSessionSet) => (
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
				</div>

				{/* Acciones */}
				<div className="flex gap-3 pt-4">
					<Button
						variant="outline"
						size="lg"
						className="uppercase font-barlow font-semibold tracking-wide"
						onClick={() => {/* TODO: Implementar duplicar */ }}
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
							<AlertTriangle className="h-5 w-5" />
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


