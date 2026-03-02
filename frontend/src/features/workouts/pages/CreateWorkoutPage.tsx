// src/features/workouts/pages/CreateWorkoutPage.tsx
import { useNavigate } from 'react-router-dom';
import { useCreateWorkout } from '../hooks/useWorkouts';

import {
	type CreateWorkoutFormData
} from '../schemas/workoutSchemas';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WorkoutForm from '../components/WorkoutForm';

export default function CreateWorkoutPage() {

	const navigate = useNavigate();
	const { mutate: createWorkout, isPending } = useCreateWorkout();

	const handleSubmit = (data: CreateWorkoutFormData) => {
		// Transformar datos al formato del backend
		const workoutData = {
			title: data.title,
			notes: data.notes,
			exercises: data.exercises.map((ex) => ({
				exerciseId: ex.exerciseId,
				orderIndex: ex.orderIndex,
				sets: ex.sets,
			})),
		};

		createWorkout(workoutData, {
			onSuccess: () => {
				navigate('/workouts');
			},
		});
	};

	const handleCancel = () => {
		navigate('/workouts');
	};

	return (
		<div className='max-w-4xl mx-auto space-y-6'>
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant='ghost'
					size='sm'
					onClick={() => navigate('/workouts')}
				>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Volver
				</Button>

				<div>
				<h1 className="text-3xl font-bold text-foreground font-bebas tracking-wide">
					Nuevo Entrenamiento
				</h1>
				<p className='text-muted-foreground mt-1'>
						Registra tu sesión de entrenamiento
					</p>
				</div>
			</div>

			{/* Formulario */}
			<WorkoutForm 
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isSubmitting={isPending}
				submitLabel='Crear Entrenamiento'
			/>

		</div>
	)


}