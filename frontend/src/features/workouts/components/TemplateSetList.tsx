// src/features/workouts/components/TemplateSetList.tsx
import { useFieldArray, type Control, type FieldErrors } from 'react-hook-form';
import type { CreateTemplateFormData } from '../schemas/templateSchema';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TemplateSetListProps {
	control: Control<CreateTemplateFormData>;
	exerciseIndex: number;
	errors: FieldErrors<CreateTemplateFormData>;
}

export default function TemplateSetList({ control, exerciseIndex, errors }: TemplateSetListProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: `exercises.${exerciseIndex}.sets`
	});

	const handleAddSet = () => {
		const newSetNumber = fields.length + 1;
		append({
			setNumber: newSetNumber,
		});
	};

	const handleRemoveSet = (setIndex: number) => {
		if (fields.length === 1) {
			toast.error('Debe haber al menos 1 serie');
			return;
		}
		remove(setIndex);
	};

	return (
		<div className='space-y-3'>
			<div className="flex items-center justify-between">
				<h5 className='text-sm font-medium'>Series</h5>
				<Button
					type='button'
					size={'sm'}
					variant={'outline'}
					onClick={handleAddSet}
				>
					<Plus className='w-4 h-4 mr-2' />
					Agregar Serie
				</Button>
			</div>

			{fields.length === 0 && (
				<p className="text-sm text-muted-foreground italic">
					Sin series detalladas. Haz clic en &quot;Agregar Serie&quot; para definir los objetivos por serie.
				</p>
			)}

			<div className="space-y-3">
				{fields.map((field, setIndex) => (
					<div
						key={field.id}
						className="p-4 border rounded-lg bg-[var(--surface-elevated)] space-y-3"
					>
						{/* Header de la serie */}
						<div className="flex items-center justify-between">
							<Badge variant={'default'}>
								Serie {setIndex + 1}
							</Badge>

							<Button
								type='button'
								variant={'ghost'}
								size={'sm'}
								onClick={() => handleRemoveSet(setIndex)}
								className='h-7 text-destructive hover:text-destructive/80'
							>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>

						{/* Campos de la serie */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{/* Reps objetivo */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.targetReps`}
									className='text-xs'
								>
									Reps objetivo
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.targetReps`}
									type='number'
									placeholder='0'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.targetReps`,
										{ setValueAs: v => v === '' ? undefined : Number(v) }
									)}
								/>
								{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetReps && (
									<p className='text-sm text-destructive'>
										{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetReps?.message}
									</p>
								)}
							</div>

							{/* Peso objetivo */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.targetWeight`}
									className="text-xs"
								>
									Peso objetivo (kg)
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.targetWeight`}
									type='number'
									min={'0'}
									step={'0.5'}
									placeholder='0'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.targetWeight`,
										{ setValueAs: v => v === '' ? undefined : Number(v) }
									)}
								/>
								{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetWeight && (
									<p className='text-sm text-destructive'>
										{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetWeight?.message}
									</p>
								)}
							</div>

							{/* Duracion objetivo */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.targetDurationSeconds`}
									className="text-xs"
								>
									Duracion (seg)
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.targetDurationSeconds`}
									type='number'
									min={'0'}
									placeholder='0'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.targetDurationSeconds`,
										{ setValueAs: v => v === '' ? undefined : Number(v) }
									)}
								/>
								{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetDurationSeconds && (
									<p className='text-sm text-destructive'>
										{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetDurationSeconds?.message}
									</p>
								)}
							</div>

							{/* Descanso objetivo */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.targetRestSeconds`}
									className="text-xs"
								>
									Descanso (seg)
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.targetRestSeconds`}
									type='number'
									min={'0'}
									placeholder='60'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.targetRestSeconds`,
										{ setValueAs: v => v === '' ? undefined : Number(v) }
									)}
								/>
								{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetRestSeconds && (
									<p className='text-sm text-destructive'>
										{errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.targetRestSeconds?.message}
									</p>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
