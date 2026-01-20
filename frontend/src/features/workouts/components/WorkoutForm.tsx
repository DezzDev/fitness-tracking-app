import { useFieldArray, useForm } from "react-hook-form";
import { CreateWorkoutSchema, type CreateWorkoutFormData } from "../schemas/workoutSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import type { WorkoutWithExercises } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseSelector from "./ExerciseSelector";
import SetList from "./SetList";


interface WorkoutFormProps {
	initialData?: WorkoutWithExercises;
	onSubmit: (data: CreateWorkoutFormData) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export default function WorkoutForm({
	initialData,
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel = 'Guardar Entrenamiento'
}: WorkoutFormProps) {
	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<CreateWorkoutFormData>({
		resolver: zodResolver(CreateWorkoutSchema),
		defaultValues: {
			title: '',
			notes: '',
			exercises: []
		}
	})

	const { fields, append, remove, move } = useFieldArray({
		control,
		name: 'exercises'
	})

	// guardar los nombres de los ejercicios con el id como index, para mostrarlos en la lista de ejercicios
	const [ exerciseNames, setExerciseNames ] = useState<Record<string, string>>({});

	// Cargar datos iniciales si estamos editando un entrenamiento
	useEffect(() => {
		if (initialData) {
			console.log({initialData})
			setValue('title', initialData.title)
			setValue('notes', initialData.notes || '')

			// Guardar los nombres de los ejercicios con el id como index, para mostrarlos en la lista de ejercicios
			const names: Record<string, string> = {}
			initialData.exercises.forEach(ex => {
				if(ex.exerciseName) {
					names[ex.exerciseId] = ex.exerciseName
				}
			})
			setExerciseNames(names)			

			// Mapear ejercicios con sus series
			const mappedExercises = initialData.exercises?.map((we) => ({
				exerciseId: we.exerciseId,
				orderIndex: we.orderIndex,
				sets: we.sets?.map((s) => ({
					setNumber: s.setNumber,
					reps: s.reps || 0,
					durationSeconds: s.durationSeconds || 0,
					weight: s.weight || 0,
					restSeconds: s.restSeconds || 0,
					notes: s.notes || undefined
				})) || []
			})) || []

			console.log({ mappedExercises })

			setValue('exercises', mappedExercises)
		}
	}, [ initialData, setValue ]);

	const handleFormSubmit = (data: CreateWorkoutFormData) => {
		onSubmit(data)
	}

	const handleAddExercise = (exerciseId: string, exerciseName: string) => {
		// Verificar que no esté ya agregado
		const exists = fields.some(f => f.exerciseId === exerciseId)
		if (exists) {
			toast.error('Ya existe este ejercicio')
			return
		}

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
					reps: 0,
					weight: 0,
					restSeconds: 0,
					durationSeconds: 0,
				}
			]
		})
	}

	const handleRemoveExercise = (index: number) => {
		remove(index)
		// Reordenar indices
		fields.forEach((_, i) => {
			if (i > index) {
				setValue(`exercises.${i - 1}.orderIndex`, i - 1)
			}
		})
	}

	const handleMoveExercise = (fromIndex: number, toIndex: number) => {
		move(fromIndex, toIndex)
		// Actualizar order index
		fields.forEach((_, i) => {
			setValue(`exercises.${i}.orderIndex`, i)
		})
	}

	const selectedExerciseIds = fields.map(f => f.exerciseId)

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
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
							disabled={isSubmitting}
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
							disabled={isSubmitting}
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
					<ExerciseSelector
						onSelectExercise={handleAddExercise}
						selectedExerciseIds={selectedExerciseIds}
					/>
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

								<div className='flex items-center gap-3'>
									{/* Drag handle */}
									<div className="flex flex-col gap-1 pt-2">
										<Button
											className="h-7 w-7 p-0 cursor-hand"
											type="button"
											variant={'ghost'}
											size={'sm'}
											disabled={index === 0 || isSubmitting}
											onClick={() => handleMoveExercise(index, index - 1)}
										>
											<ArrowUp />
										</Button>
										<Button
											className="h-7 w-7 p-0 cursor-hand"
											type="button"
											variant={'ghost'}
											size={'sm'}
											disabled={index === fields.length - 1 || isSubmitting}
											onClick={() => handleMoveExercise(index, index + 1)}
										>
											<ArrowDown />
										</Button>
									</div>

									<div className='flex-1 space-y-3' >
										<div className="flex items start justify-between">
											<div>
												<h4 className='font-medium'>{exerciseNames[ field.exerciseId ]}</h4>
												<p className="text-sm  text-gray-500">

													Ejercicio #{index + 1}
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
								</div>
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
					disabled={isSubmitting || fields.length === 0}
				>
					{isSubmitting ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Guardando...
						</>
					) : (
						submitLabel
					)}
				</Button>

				<Button
					type='button'
					variant={'outline'}
					size={'lg'}
					onClick={() => onCancel()}
					disabled={isSubmitting}
				>
					Cancelar
				</Button>

			</div>
		</form>
	)
}