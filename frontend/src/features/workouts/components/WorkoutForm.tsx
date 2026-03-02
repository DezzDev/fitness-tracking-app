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
import { Trash2, Loader2, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseSelector from "./ExerciseSelector";
import SetList from "./SetList";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ExerciseInfo from "./ExerciseInfo";


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
		formState: { errors, isDirty }
	} = useForm<CreateWorkoutFormData>({
		resolver: zodResolver(CreateWorkoutSchema),
		values: initialData ?? {
			title: '',
			notes: '',
			exercises: []
		}
	})

	const { fields, append, remove, move } = useFieldArray({
		control,
		name: 'exercises'
	})

	// Detectar cambios no guardados
	const [ hasSubmitted, setHasSubmitted ] = useState(false);
	const blocker = useUnsavedChanges(isDirty && !hasSubmitted && !isSubmitting);

	// guardar los nombres de los ejercicios con el id como index, para mostrarlos en la lista de ejercicios
	const [ exerciseNames, setExerciseNames ] = useState<Record<string, string>>({});

	// Cargar datos iniciales si estamos editando un entrenamiento
	useEffect(() => {
		if (initialData) {

			// Guardar los nombres de los ejercicios con el id como index, para mostrarlos en la lista de ejercicios
			const names: Record<string, string> = {}
			initialData.exercises.forEach(ex => {
				if(ex.exerciseName) {
					names[ex.exerciseId] = ex.exerciseName
				}
			})
			setExerciseNames(names)			

		}
	}, [ initialData, setValue ]);

	const handleFormSubmit = (data: CreateWorkoutFormData) => {
		setHasSubmitted(true);
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
			{/* Alerta de navegación bloqueada */}
			{blocker.state === 'blocked' && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>Tienes cambios sin guardar. ¿Deseas descartarlos?</span>
						<div className="flex gap-2">
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() => blocker.reset?.()}
							>
								Cancelar
							</Button>
							<Button
								type="button"
								size="sm"
								variant="destructive"
								onClick={() => blocker.proceed?.()}
							>
								Descartar
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			)}
			
			{/* Información básica */}
			<Card>
				<CardHeader>
					<CardTitle>Información General</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{/* Titulo */}
					<div className='space-y-2'>
						<Label htmlFor='title'>
							Título del entrenamiento 					<span className='text-destructive'>*</span>
						</Label>
						<Input
							id='title'
							placeholder='Ej: Pecho - Día 1'
							disabled={isSubmitting}
							{...register('title')}
						/>
						{errors.title && (
							<p className='text-sm text-destructive'>{errors.title.message}</p>
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
							<p className='text-sm text-destructive'>{errors.notes.message}</p>
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
												{/*  queda por definir cuando implementar la vista compacta */}
												<ExerciseInfo exerciseId={field.exerciseId} index={index}   />
											</div>

											<Button
												type='button'
												variant={'ghost'}
												size={'sm'}
												onClick={() => handleRemoveExercise(index)}
												className='text-destructive hover:text-destructive/80'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
										{/* Series de ejercicio (sets) */}
										<SetList errors={errors} control={control} exerciseIndex={index} />
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{errors.exercises && (
				<p className='text-sm text-destructive'>{errors.exercises.message}</p>
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