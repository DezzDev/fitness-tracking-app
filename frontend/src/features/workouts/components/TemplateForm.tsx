// src/features/workouts/components/TemplateForm.tsx
import { useFieldArray, useForm } from 'react-hook-form';
import { createTemplateSchema, type CreateTemplateFormData } from '../schemas/templateSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExerciseSelector from './ExerciseSelector';
import TemplateSetList from './TemplateSetList';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExerciseInfo from './ExerciseInfo';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const DAY_OPTIONS = [
	{ value: '0', label: 'Lunes' },
	{ value: '1', label: 'Martes' },
	{ value: '2', label: 'Miercoles' },
	{ value: '3', label: 'Jueves' },
	{ value: '4', label: 'Viernes' },
	{ value: '5', label: 'Sabado' },
	{ value: '6', label: 'Domingo' },
];

interface TemplateFormProps {
	initialData?: CreateTemplateFormData;
	onSubmit: (data: CreateTemplateFormData) => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export default function TemplateForm({
	initialData,
	onSubmit,
	isSubmitting = false,
	submitLabel = 'Guardar Plantilla'
}: TemplateFormProps) {
	const {
		register,
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isDirty }
	} = useForm<CreateTemplateFormData>({
		resolver: zodResolver(createTemplateSchema),
		values: initialData ?? {
			name: '',
			description: '',
			exercises: []
		}
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'exercises'
	});

	// Detectar cambios no guardados
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const blocker = useUnsavedChanges(isDirty && !hasSubmitted && !isSubmitting);

	const scheduledDay = watch('scheduledDayOfWeek');

	const handleFormSubmit = (data: CreateTemplateFormData) => {
		setHasSubmitted(true);
		onSubmit(data);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleAddExercise = (exerciseId: string, _exerciseName: string) => {
		// Verificar que no este ya agregado
		const exists = fields.some(f => f.exerciseId === exerciseId);
		if (exists) {
			toast.error('Ya existe este ejercicio');
			return;
		}

		append({
			exerciseId,
			orderIndex: fields.length,
		});
	};

	const handleRemoveExercise = (index: number) => {
		remove(index);
		// Reordenar indices
		fields.forEach((_, i) => {
			if (i > index) {
				setValue(`exercises.${i - 1}.orderIndex`, i - 1);
			}
		});
	};

	const handleDayChange = (value: string) => {
		if (value === 'none') {
			setValue('scheduledDayOfWeek', undefined, { shouldDirty: true });
		} else {
			setValue('scheduledDayOfWeek', Number(value), { shouldDirty: true });
		}
	};

	const selectedExerciseIds = fields.map(f => f.exerciseId);

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
			{/* Alerta de navegacion bloqueada */}
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

			{/* Informacion basica */}
			<Card className="p-6 space-y-4 rounded-none border-border">
				{/* Nombre */}
				<div className='space-y-2'>
					<Label
						htmlFor='name'
						className="text-xs uppercase tracking-wide font-barlow font-semibold text-muted-foreground"
					>
						Nombre de la plantilla <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='name'
						placeholder='Ej: Push Day - Pecho y Triceps'
						disabled={isSubmitting}
						className="font-barlow rounded-none"
						{...register('name')}
					/>
					{errors.name && (
						<p className='text-sm text-destructive font-barlow'>{errors.name.message}</p>
					)}
				</div>

				{/* Descripcion */}
				<div className='space-y-2'>
					<Label
						htmlFor='description'
						className="text-xs uppercase tracking-wide font-barlow font-semibold text-muted-foreground"
					>
						Descripcion (opcional)
					</Label>
					<Textarea
						id='description'
						placeholder='Describe brevemente esta plantilla...'
						rows={3}
						disabled={isSubmitting}
						className="font-barlow resize-none rounded-none"
						{...register('description')}
					/>
					{errors.description && (
						<p className='text-sm text-destructive font-barlow'>{errors.description.message}</p>
					)}
				</div>

				{/* Dia programado */}
				<div className='space-y-2'>
					<Label
						className="text-xs uppercase tracking-wide font-barlow font-semibold text-muted-foreground"
					>
						Dia programado (opcional)
					</Label>
					<Select
						value={scheduledDay !== undefined ? String(scheduledDay) : 'none'}
						onValueChange={handleDayChange}
						disabled={isSubmitting}
					>
						<SelectTrigger className="font-barlow rounded-none">
							<SelectValue placeholder="Sin programar" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Sin programar</SelectItem>
							{DAY_OPTIONS.map((day) => (
								<SelectItem key={day.value} value={day.value}>
									{day.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.scheduledDayOfWeek && (
						<p className='text-sm text-destructive font-barlow'>{errors.scheduledDayOfWeek.message}</p>
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
										{/* Numero de orden */}
										<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
											<span className="text-sm font-bebas text-primary">
												{index + 1}
											</span>
										</div>

										<div className='flex-1 min-w-0 space-y-3'>
											{/* Info del ejercicio y boton eliminar */}
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
											<TemplateSetList errors={errors} control={control} exerciseIndex={index} />
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

			{/* Boton de accion */}
			<Button
				type='submit'
				size={'lg'}
				disabled={isSubmitting || fields.length === 0}
				className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] border-none text-black font-bebas text-[22px] tracking-[4px] py-5 cursor-pointer transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-none mb-6"
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
	);
}
