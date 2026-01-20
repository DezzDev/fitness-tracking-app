import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom"
import { useUpdateWorkout, useWorkout } from "../hooks/useWorkouts";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CreateWorkoutFormData } from "../schemas/workoutSchemas";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutForm from "../components/WorkoutForm";



export default function EditWorkoutPage() {

	const { id: workoutId } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const { data: workout, isLoading, isError } = useWorkout(workoutId);
	const { mutate: updateWorkout, isPending } = useUpdateWorkout()

	const handleSubmit = (data: CreateWorkoutFormData) => {

		if (!workoutId) {
			return;
		}

		// Transformar datos al formato backend
		const workoutData = {
			title: data.title,
			notes: data.notes,
			exercises: data.exercises.map((ex) => ({
				exerciseId: ex.exerciseId,
				orderIndex: ex.orderIndex,
				sets: ex.sets
			}))
		}

		updateWorkout(
			{ id: workoutId, data: workoutData },
			{onSuccess: ()=> {
				navigate(`/workouts/${workoutId}`)
			}}
		)
	}

	const handleCancel = ()=> {
		navigate(`/workouts/${workoutId}`)
	}

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<Skeleton className="h-10 w-3/4" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	if (isError || !workout) {
		return(
			<div className="max-w-4xl mx-auto">
				<Card className="p-12 text-center">
					<p className="text-gray-500 mb-4">Entrenamiento no encontrado</p>
					<Button onClick={()=> navigate('/workouts')}>
						Volver a entrenamientos
					</Button>
				</Card>
			</div>
		)
	}


	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant={'ghost'}
					size={'sm'}
					onClick={() => navigate(`/workouts/${workoutId}`)}
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Volver
				</Button>

				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Editar Entrenamiento
					</h1>
					<p className="text-gray-600 mt-1">{workout.title}</p>
				</div>
			</div>

			{/* Formulario con datos pre-cargados */}
			<WorkoutForm 
				initialData={workout}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isSubmitting={isPending}
				submitLabel='Guardar Cambios'
			/>
		</div>
	)
}

