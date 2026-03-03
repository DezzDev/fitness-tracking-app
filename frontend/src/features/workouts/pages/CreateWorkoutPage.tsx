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
			<div>
				<h1 className="text-4xl font-bebas tracking-wide uppercase text-foreground">
					Nuevo Entrenamiento
				</h1>
				<p className='text-muted-foreground mt-2 font-barlow'>
					Registra tu sesión de entrenamiento
				</p>
			</div>

			{/* Formulario */}
			<WorkoutForm 
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isSubmitting={isPending}
				submitLabel='Guardar Entrenamiento'
			/>

		</div>
	);
}
