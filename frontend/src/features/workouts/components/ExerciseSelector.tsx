// src/features/workouts/components/ExerciseSelector.tsx
import { useState } from "react";
import { useExercises } from "@/features/exercises/hooks/useExercises";
import { Check, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExerciseSelectorProps {
	onSelectExercise: (exerciseId: string, exerciseName: string) => void;
	selectedExerciseIds?: string[];
}

export default function ExerciseSelector({
	onSelectExercise,
	selectedExerciseIds = [],
}: ExerciseSelectorProps) {
	const [ searchTerm, setSearchTerm ] = useState('');

	const { data, isLoading } = useExercises({
		searchTerm,
		limit: 50 // Cantidad de ejercicios a mostrar en la lista
	})

	const exercises = data?.data?.items || [];

	return (
		<div className="space-y-4">
			{/* Búsqueda */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder='Buscar ejercicios...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{/* Lista de ejercicios */}
			<div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
				{isLoading ? (
					<div className="p-4 space-y-3">
						{[ ...Array(5) ].map((_, i) => (
							<div key={i} className="flex items-center justify-between">
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h3 w-1/2" />
								</div>
								<Skeleton className="h-9 w-20" />
							</div>
						))}
					</div>
				) : exercises.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground">
						<p>No se encontraron ejercicios</p>
						{searchTerm && (
							<p className="text-sm mt-1">
								Intenta con otro término de búsqueda
							</p>
						)}
					</div>
				) : (
					exercises.map((exercise) => {
						const isSelected = selectedExerciseIds.includes(exercise.id)

						return (
							<div
								key={exercise.id}
								className="p-4 hover:bg-[var(--surface-elevated)] transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-foreground truncate">
											{exercise.name}
										</h4>

										{exercise.description && (
											<p className="text-sm text-muted-foreground mt-1 line-clamp-1">
												{exercise.description}
											</p>
										)}

										<div className="flex items-center gap-2 mt-2">
											{exercise.difficulty && (
												<Badge
													variant={'outline'}
												className={`text-xs ${exercise.difficulty === 'beginner'
													? 'border-[var(--success)] text-[var(--success)]'
													: exercise.difficulty === 'intermediate'
														? 'border-[var(--warning)] text-[var(--warning)]'
														: 'border-destructive text-destructive'
													}`}
												>
													{
														exercise.difficulty === 'beginner'
															? 'Principiante'
															: exercise.difficulty === 'intermediate'
																? 'Intermedio'
																: 'Avanzado'
													}
												</Badge>
											)}

											{exercise.muscleGroup && (
												<Badge variant={'secondary'} className="text-xs">
													{exercise.muscleGroup}
												</Badge>
											)}

											{exercise.type && (
												<Badge variant={'outline'} className="text-xs">
													{
														exercise.type === 'strength'
															? 'Fuerza'
															: exercise.type === 'endurance'
																? 'Resistencia'
																: exercise.type === 'skill'
																	? 'Habilidad'
																	: 'Explosivo'
													}
												</Badge>
											)}
										</div>
									</div>

									<Button
										type="button"
										size="sm"
										variant={isSelected ? 'secondary' : 'default'}
										onClick={() => onSelectExercise(exercise.id, exercise.name)}
										disabled={isSelected}
									>
										{isSelected ? (
											<>
												<Check className='h-4 w-4 mr-2' />
												Agregado
											</>
										) : (
											<>
												<Plus className="h-4 w-4 mr-2" />
												Agregar
											</>
										)}

									</Button>
								</div>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
