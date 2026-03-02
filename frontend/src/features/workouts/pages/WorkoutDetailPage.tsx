// src/features/workouts/pages/WorkoutDetailPage.tsx

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDeleteWorkout, useWorkout } from "../hooks/useWorkouts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Calendar, Clock, Dumbbell, Pencil, Repeat, Trash2, Weight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExerciseInfo from "../components/ExerciseInfo";


export default function WorkoutDetailPage() {

	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const workoutId = id;

	const { data: workout, isLoading, isError } = useWorkout(workoutId);
	const { mutate: deleteWorkout, isPending: isDeleting } = useDeleteWorkout();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState(false)
	console.log({workout})

	const handleDelete = () => {
		if (workoutId === undefined) return
		deleteWorkout(workoutId, {
			onSuccess: () => {
				navigate('/workouts')
			}
		})
	}

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<Skeleton className='h-10 w-3/4' />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	if (isError || !workout) {
		return (
			<Card className="p-12 text-center">
				<p className="text-gray-500">
					Entrenamiento no encontrado
				</p>
				<Button
					onClick={() => navigate('/workouts')}
					className="mt-4"
				>
					Volver a entrenamientos
				</Button>
			</Card>
		)
	}

	const workoutDate = new Date(workout.createdAt);

	return (
		<>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between gap-4">

					<div className="flex-1">
						<Button
							className="mb-4"
							variant={'ghost'}
							size={'sm'}
							onClick={() => navigate('/workouts')}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Volver
						</Button>

						<h1 className="text-3xl font-bold text-gray-900">
							{workout.title}
						</h1>

						<div className="flex items-center gap-4 mt-3 text-gray-600">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>{format(workoutDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span>{format(workoutDate, 'HH:mm')}</span>
							</div>
						</div>
					</div>

					{/* Acciones */}
					<div className="flex gap-2">
						<Link to={`/workouts/${workoutId}/edit`}>
							<Button variant={'outline'}>
								<Pencil className="h-4 w-4 mr-2" />
								Editar
							</Button>
						</Link>

						<Button
							variant={'destructive'}
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Eliminar
						</Button>
					</div>
				</div>

				{/* Notas */}
				{workout.notes && (
					<Card>
						<CardHeader>
							<CardTitle className="tex-base">
								Notas
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700 whitespace-pre-wrap">
								{workout.notes}
							</p>
						</CardContent>
					</Card>
				)}

				{/* Ejercicios */}
				<Card>
					<CardHeader>
						<CardTitle>
							Ejercicios ({workout.exercises?.length || 0})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{!workout.exercises || workout.exercises.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<Dumbbell className='h-12 w-12 mx-auto mb-3 opacity-50' />
								<p>No hay ejercicios registrados</p>
							</div>
						): (
							<div className="space-y">
								{workout.exercises.map((workoutExercise, index) => (
									<div key={workoutExercise.id}>
										{index > 0 && <Separator className="my-6" />
										}
										{/* Ejercicio */}
										<div className="space-y-4">
											<div className="flex items-start justify-between">
												<ExerciseInfo exerciseId={workoutExercise.exerciseId} index={index} />
												
											</div>

											{/* Series (sets) */}
											{workoutExercise.sets && workoutExercise.sets.length > 0 && (
												<div className="space-y-2">
													<h4 className="text sm font-medium text-gray-700">
														Series ({workoutExercise.sets.length})
													</h4>

													<div className="space-y-2">
														{workoutExercise.sets.map(set => (
															<div 
																className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
																key={set.setNumber}	
															>
																<Badge className="shrink-0" variant={'default'}>
																	Serie {set.setNumber}
																</Badge>

																<div className="flex items-center gap-4 flex-wrap text-sm">
																	{set.reps !== null && set.reps !== undefined && (
																		<div className="flex items-center gap-1">
																			<Repeat className="h-4 w-4 text-gray-500" />
																			<span className="font-medium">{set.reps}</span>
																			<span className="text-gray-500">reps</span>
																		</div>
																	)}

																	{set.weight !== null && set.weight !== undefined && set.weight > 0 && (
																		<div className="flex items-center gap-1">
																			<Weight className="h-4 w-4 text-gray-500" />
																			<span className="font-medium">{set.weight}</span>
																			<span className="text-gray-500">kg</span>
																		</div>
																	)}

																	{set.durationSeconds !== null && set.durationSeconds !== undefined && set.durationSeconds > 0 && (
																		<div className="flex items-center gap-1">
																			<Clock className="h-4 w-4 text-gray-500" />
																			<span className="font-medium">{set.durationSeconds}</span>
																			<span className="text-gray-500">seg</span>
																		</div>
																	)}

																	{set.restSeconds !== null && set.restSeconds !== undefined && set.restSeconds > 0 && (
																		<div className="flex items-center gap-1 text-gray-500">
																			<span>↓</span>
																			<span>{set.restSeconds}s descanso</span>
																		</div>
																	)}
																</div>

																{set.notes && (
																	<p className="text-sm text-gray-600 ml-auto">
																		{set.notes}
																	</p>
																)}
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Dialog de confirmación de eliminación */}
			<Dialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-5 w-5"/>
							¿Eliminar entrenamiento?
						</DialogTitle>
						<DialogDescription>
							<p className="mb-3">
								Estás a punto de eliminar el entrenamiento:
							</p>
							<p className="font-semibold text-gray-900 mb-3">
								"{workout.title}"
							</p>
							<p className="text-sm">
								Esta acción no se puede deshacer. Se eliminarán todos los ejercicios y series asociados.
							</p>
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant={'outline'}
							onClick={()=> setShowDeleteDialog(false)}
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
	)
}

