import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom"
import { useWorkout } from "../hooks/useWorkouts";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";



export default function EditWorkoutPage() {

	const {id: workoutId} = useParams<{id:string}>()
	const navigate = useNavigate()

	const {data: workout, isLoading}  = useWorkout(workoutId);

	if(isLoading) {
		return <div>Cargando...</div>;
	}

	if(!workout) {
		return <div>Entrenamiento no encontrado</div>
	}

	return (
		<div className="max-w-4xl mx-auto space-y-4">
			<div>
				<Button
					variant={'ghost'}
					size={'sm'}
					onClick={()=> navigate(`/workouts/${workoutId}`)}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Volver
				</Button>

				<h1 className="text-3xl font-bold text-gray-900">
					Editar: {workout.title}
				</h1>
			</div>

			<Card className="p-12 text-center">
				<p className="text-gray-600">
					Funcionalidades de edición próximamente...
				</p>
				<p className="text-sm text gray-500 mt-2">
					Por ahora puedes eliminar y crear un nuevo entrenamiento
				</p>
			</Card>
		</div>
	)
}

