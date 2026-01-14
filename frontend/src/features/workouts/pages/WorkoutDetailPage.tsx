// src/features/workouts/pages/WorkoutDetailPage.tsx

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDeleteWorkout, useWorkout } from "../hooks/useWorkouts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";



export default function WorkoutDetailPage() {

	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const workoutId = id;

	const { data: workout, isLoading, isError } = useWorkout(workoutId);
	const { mutate: deleteWorkout, isPending: isDeleting } = useDeleteWorkout();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState(false)

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

			</div>
		</>
	)
}

