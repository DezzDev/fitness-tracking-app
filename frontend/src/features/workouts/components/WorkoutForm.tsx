import { useFieldArray, useForm } from "react-hook-form";
import { CreateWorkoutSchema, type CreateWorkoutFormData } from "../schemas/workoutSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import type { WorkoutWithExercises, WorkoutSessionWithExercises } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ExerciseSelector from "./ExerciseSelector";
import SetList from "./SetList";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ExerciseInfo from "./ExerciseInfo";


interface WorkoutFormProps {
	initialData?: WorkoutWithExercises | WorkoutSessionWithExercises;
	onSubmit: (data: CreateWorkoutFormData) => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export default function WorkoutForm({
	initialData,
	onSubmit,
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

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'exercises'
	})

	// Detectar cambios no guardados
	const [ hasSubmitted, setHasSubmitted ] = useState(false);
	const blocker = useUnsavedChanges(isDirty && !hasSubmitted && !isSubmitting);

	const handleFormSubmit = (data: CreateWorkoutFormData) => {
		setHasSubmitted(true);
		onSubmit(data)
	}

	const handleAddExercise = (exerciseId: string, _exerciseName: string) => {
		// Verificar que no esté ya agregado
		const exists = fields.some(f => f.exerciseId === exerciseId)
		if (exists) {
			toast.error('Ya existe este ejercicio')
			return
		}

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
			<Card className="p-6 space-y-4 rounded-none border-border">
				{/* Título */}
				<div className='space-y-2'>
					<Label 
						htmlFor='title'
						className="text-xs uppercase tracking-wide font-barlow font-semibold text-muted-foreground"
					>
						Nombre del entrenamiento <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='title'
						placeholder='Ej: Pecho y Tríceps - Día 1'
						disabled={isSubmitting}
						className="font-barlow rounded-none"
						{...register('title')}
					/>
					{errors.title && (
						<p className='text-sm text-destructive font-barlow'>{errors.title.message}</p>
					)}
				</div>

				{/* Notas */}
				<div className='space-y-2'>
					<Label 
						htmlFor='notes'
						className="text-xs uppercase tracking-wide font-barlow font-semibold text-muted-foreground"
					>
						Notas (opcional)
					</Label>
					<Textarea
						id='notes'
						placeholder='Agrega notas sobre tu entrenamiento...'
						rows={3}
						disabled={isSubmitting}
						className="font-barlow resize-none rounded-none"
						{...register('notes')}
					/>
					{errors.notes && (
						<p className='text-sm text-destructive font-barlow'>{errors.notes.message}</p>
					)}
				</div>
			</Card>

			{/* Selector de ejercicios */}
			<div className="space-y-3">
				<ExerciseSelector
					onSelectExercise={handleAddExercise}
					selectedExerciseIds={selectedExerciseIds}
				/>
			</div>

			{/* Lista de ejercicios agregados */}
			{fields.length > 0 && (
				<Card className="p-6 space-y-4">
					<div className="flex items-center gap-3">
						<h2 className="text-lg font-bebas tracking-widest uppercase text-foreground">
							Ejercicios
						</h2>
						<Badge variant="secondary" className="font-barlow font-semibold">
							{fields.length}
						</Badge>
					</div>

					<div className='space-y-6'>
						{fields.map((field, index) => (
							<div key={field.id}>
								{index > 0 && <Separator className="my-6" />}

								<div className='space-y-4'>
									{/* Header del ejercicio */}
									<div className='flex items-start gap-3'>
										{/* Número de orden */}
										<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
											<span className="text-sm font-bebas text-primary">
												{index + 1}
											</span>
										</div>

										<div className='flex-1 min-w-0 space-y-3'>
											{/* Info del ejercicio y botón eliminar */}
											<div className="flex items-start justify-between gap-3">
												<ExerciseInfo exerciseId={field.exerciseId} index={index} />
												
												<Button
													type='button'
													variant={'ghost'}
													size={'sm'}
													onClick={() => handleRemoveExercise(index)}
													className='text-destructive hover:text-destructive/80 shrink-0'
													disabled={isSubmitting}
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>

											{/* Series del ejercicio */}
											<SetList errors={errors} control={control} exerciseIndex={index} />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</Card>
			)}

			{/* Error de ejercicios */}
			{errors.exercises && (
				<p className='text-sm text-destructive font-barlow'>{errors.exercises.message}</p>
			)}

			{/* Botones de acción */}

				<Button
					type='submit'
					size={'lg'}
					disabled={isSubmitting || fields.length === 0}
					className="w-full text-lg text-primary-foreground uppercase font-barlow font-semibold tracking-[2px] rounded-none  mx-auto block"
				>
					{isSubmitting ? (
						<>
							<Loader2 className='mr-2 h-5 w-5 animate-spin' />
							Guardando...
						</>
					) : (
						submitLabel
					)}
				</Button>
		</form>
	)
}