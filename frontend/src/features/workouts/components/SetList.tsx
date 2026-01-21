// src/features/workouts/components/SetsList.tsx
import { useFieldArray, type Control } from 'react-hook-form';
import type { CreateWorkoutFormData } from '../schemas/workoutSchemas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SetListProps {
	control: Control<CreateWorkoutFormData>;
	exerciseIndex: number;
}

export default function SetList({ control, exerciseIndex }: SetListProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: `exercises.${exerciseIndex}.sets`
	})

	const handleAddSet = () => {
		const newSetNumber = fields.length + 1;
		append({
			setNumber: newSetNumber,
			reps: 0,
			weight: 0,
			durationSeconds: 0,
			restSeconds: 0
		})
	}

	const handleRemoveSet = (setIndex: number) => {
		if (fields.length === 1) {
			toast.error('Debe haber al menos 1 set')
			return
		}
		remove(setIndex)
	}

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

			<div className="space-y-3">
				{fields.map((field, setIndex) => (
					<div
						key={field.id}
						className="p-4 border rounded-lg bg-gray-50 space-y-3"
					>
						{/* Header de la serie */}
						<div className="flex items-center justify-between">
							<Badge variant={'default'}>
								Serie {setIndex + 1}
							</Badge>

							{fields.length > 1 && (
								<Button
									type='button'
									variant={'ghost'}
									size={'sm'}
									onClick={() => handleRemoveSet(setIndex)}
									className='h-7 text-red-600 hover:text-red-700'
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							)}
						</div>

						{/* Campos de la serie */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{/* Repeticiones */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
									className='text-xs'
								>
									Reps
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
									type='number'
									min={'0'}
									placeholder='0'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.reps`,
										{ valueAsNumber: true }
									)}
								/>
							</div>

							{/* Peso */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
									className="text-xs"
								>
									Peso (kg)
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
									type='number'
									min={'0'}
									step={'0.5'}
									placeholder='0'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.weight`,
										{ valueAsNumber: true }
									)}
								/>
							</div>

							{/* Duración */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.durationSeconds`}
									className="text-xs"
								>
									Duración (seg)
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.durationSeconds`}
									type='number'
									min={'0'}
									placeholder='0'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.durationSeconds`,
										{ valueAsNumber: true }
									)}
								/>
							</div>

							{/* Descanso */}
							<div className="space-y-1">
								<Label
									htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.restSeconds`}
									className="text-xs"
								>
									Descanso (seg)
								</Label>
								<Input
									id={`exercises.${exerciseIndex}.sets.${setIndex}.restSeconds`}
									type='number'
									min={'0'}
									placeholder='60'
									{...control.register(
										`exercises.${exerciseIndex}.sets.${setIndex}.restSeconds`,
										{ valueAsNumber: true }
									)}
								/>
							</div>
						</div>

						{/* Notas (opcional) */}
						<div className="space-y-1">
							<Label
								htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.notes`}
								className="text-xs"
							>
								Notas (opcional)
							</Label>
							<Input
								id={`exercises.${exerciseIndex}.sets.${setIndex}.notes`}

								placeholder='Ej: Buen tiempo, forma correcta'
								{...control.register(
									`exercises.${exerciseIndex}.sets.${setIndex}.notes`,
								)}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}