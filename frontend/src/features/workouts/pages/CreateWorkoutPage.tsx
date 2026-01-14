// src/features/workouts/pages/CreateWorkoutPage.tsx
import { useNavigate } from 'react-router-dom';
import { useCreateWorkout } from '../hooks/useWorkouts';

import {
	CreateWorkoutSchema,
	type CreateWorkoutFormData
} from '../schemas/workoutSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import ExerciseSelector from '../components/ExerciseSelector';
import SetList from '../components/SetList';
import { useState } from 'react';

export default function CreateWorkoutPage() {

	// guardar los nombres de los ejercicios con el id como index, para mostrarlos en la lista de ejercicios
	const [ exerciseNames, setExerciseNames ] = useState<Record<string, string>>({});

	const navigate = useNavigate();
	const { mutate: createWorkout, isPending } = useCreateWorkout();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors }
	} = useForm<CreateWorkoutFormData>({
		resolver: zodResolver(CreateWorkoutSchema),
		defaultValues: {
			title: '',
			notes: '',
			exercises: []
		}
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'exercises'
	})

	const onSubmit = (data: CreateWorkoutFormData) => {
		// Transformar datos al formato del backend
		const workoutData = {
			title: data.title,
			notes: data.notes,
			exercises: data.exercises.map((ex) => ({
				exerciseId: ex.exerciseId,
				orderIndex: ex.orderIndex,
				sets: ex.sets
			}))
		}

		createWorkout(workoutData, {
			onSuccess: () => {
				navigate('/workouts')
			}
		})
	}

	const handleAddExercise = (exerciseId: string, exerciseName: string) => {

		setExerciseNames((prev) => ({
			...prev,
			[ exerciseId ]: exerciseName,
		}));


		append({
			exerciseId,
			orderIndex: fields.length,
			sets: [
				{
					setNumber: 1,
					reps: 10,
					weight: 0,
					durationSeconds:0,
					restSeconds: 60
				}
			]
		})
	}

	const handleRemoveExercise = (index: number) => {
		remove(index);
		// Reordenar índices

		fields.forEach((_, i) => {
			if (i > index && i < fields.length) {
				// ajustar orderIndex					
				fields.at(i)!.orderIndex = i - 1;
			}
		})
	}

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
					<h1 className="text-3xl font-bold text-gray-900">
						Nuevo Entrenamiento
					</h1>
					<p className='text-gray-600 mt-1'>
						Registra tu sesión de entrenamiento
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				{/* Información básica */}
				<Card>
					<CardHeader>
						<CardTitle>Información General</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						{/* Titulo */}
						<div className='space-y-2'>
							<Label htmlFor='title'>
								Título del entrenamiento <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='title'
								placeholder='Ej: Pecho - Día 1'
								{...register('title')}
							/>
							{errors.title && (
								<p className='text-sm text-red-600'>{errors.title.message}</p>
							)}
						</div>

						{/* Notas */}
						<div className='space-y-2'>
							<Label htmlFor='notes'>Notas (opcional)</Label>
							<Textarea
								id='notes'
								placeholder='Agrega notas sobre tu entrenamiento'
								rows={3}
								{...register('notes')}
							/>
							{errors.notes && (
								<p className='text-sm text-red-600'>{errors.notes.message}</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Selector de ejercicios  */}
				<Card>
					<CardHeader>
						<CardTitle>Agregar Ejercicios</CardTitle>
					</CardHeader>
					<CardContent>
						<ExerciseSelector onSelectExercise={handleAddExercise} />
					</CardContent>
				</Card>

				{/* Lista de ejercicios agregados */}
				{fields.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Ejercicios ({fields.length})</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							{fields.map((field, index) => (
								<div key={field.id} className='space-y-3'>
									{index > 0 && <Separator />}

									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<h4 className='font-medium'>Ejercicio #{index + 1}</h4>
											<p className="text-sm text-gray-500">

												{exerciseNames[ field.exerciseId ]}
											</p>
										</div>

										<Button
											type='button'
											variant={'ghost'}
											size={'sm'}
											onClick={() => handleRemoveExercise(index)}
											className='text-red-600 hover:text-red-700'
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>

									{/* Series de ejercicio (sets) */}
									<SetList control={control} exerciseIndex={index} />
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{errors.exercises && (
					<p className='text-sm text-red-600'>{errors.exercises.message}</p>
				)}

				{/* Botones de acción */}
				<div className='flex gap-3'>
					<Button
						type='submit'
						size={'lg'}
						disabled={isPending || fields.length === 0}
					>
						{isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Guardando...
							</>
						) : (
							'Guardar Entrenamiento'
						)}
					</Button>

					<Button
						type='button'
						variant={'outline'}
						size={'lg'}
						onClick={() => navigate('/workouts')}
						disabled={isPending}
					>
						Cancelar
					</Button>

				</div>
			</form>

		</div>
	)


}