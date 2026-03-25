// src/features/workouts/components/ExerciseSelector.tsx
import { useState } from "react";
import { useExercises } from "@/features/exercises/hooks/useExercises";
import { Check, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const difficultNameMap: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

const typeNameMap: Record<string, string> = {
  strength: 'Fuerza',
  skill: 'Habilidad',
  explosive: 'Explosivo',
  endurance: 'Resistencia',
  cardio: 'Cardio',
  flexibility: 'Flexibilidad',
  balance: 'Equilibrio',
  mobility: 'Movilidad',
  other: 'Otro'
}

interface ExerciseSelectorProps {
	onSelectExercise: (exerciseId: string, exerciseName: string) => void;
	selectedExerciseIds?: string[];
}

export default function ExerciseSelector({
	onSelectExercise,
	selectedExerciseIds = [],
}: ExerciseSelectorProps) {
	const [ isOpen, setIsOpen ] = useState(false);
	const [ searchTerm, setSearchTerm ] = useState('');

	const { data, isLoading } = useExercises({
		searchTerm,
		limit: 50 // Cantidad de ejercicios a mostrar en la lista
	})

	const exercises = data?.data?.items || [];
  console.log(exercises);

	const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
		onSelectExercise(exerciseId, exerciseName);
		// Cerrar el selector después de agregar
		setIsOpen(false);
		setSearchTerm('');
	};

	if (!isOpen) {
		return (
			<Button
				type="button"
				variant="outline"
				size="lg"
				onClick={() => setIsOpen(true)}
				className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors uppercase font-barlow font-semibold tracking-wide"
			>
				<Plus className="h-5 w-5 mr-2" />
				<span className="tracking-[2px]">Añadir Ejercicio</span>
			</Button>
		);
	}

	return (
		<Card className="p-4 border-border rounded-none ">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bebas tracking-widest uppercase text-foreground">
					Seleccionar Ejercicio
				</h3>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => {
						setIsOpen(false);
						setSearchTerm('');
					}}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{/* Búsqueda */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder='Buscar ejercicios...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10 font-barlow rounded-none"
					autoFocus
				/>
			</div>

			{/* Lista de ejercicios */}
			<div className="max-h-96 overflow-y-auto overflow-x-hidden border divide-y">
				{isLoading ? (
					<div className="p-4 space-y-3">
						{[ ...Array(5) ].map((_, i) => (
							<div key={i} className="flex items-center justify-between">
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
								<Skeleton className="h-9 w-20" />
							</div>
						))}
					</div>
				) : exercises.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground tracking-widest">
						<p className="font-barlow">No se encontraron ejercicios</p>
						{searchTerm && (
							<p className="text-sm mt-1 font-barlow">
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
								className="p-4 hover:bg-muted/20 transition-colors"
							>
								<div className="flex gap-4 justify-between">
									<div className="min-w-0 ">
										<h4 className="font-bebas text-foreground  tracking-widest">
											{exercise.name}
										</h4>

										{exercise.description && (
											<p className="text-sm text-muted-foreground mt-1  font-barlow ">
												{exercise.description}
											</p>
										)}

										<div className="flex items-center gap-2 mt-2 flex-wrap">
											{exercise.muscleGroup && (
												<Badge 
													variant={'secondary'} 
													className="text-xs font-barlow uppercase tracking-wide rounded-none"
												>
													{exercise.muscleGroup}
												</Badge>
											)}

											{exercise.difficulty && (
												<Badge
													variant={'outline'}
													className={`text-xs font-barlow uppercase tracking-wide rounded-none ${
														exercise.difficulty === 'beginner'
															? 'border-green-500/50 text-green-500'
															: exercise.difficulty === 'intermediate'
																? 'border-yellow-500/50 text-yellow-500'
																: 'border-red-500/50 text-red-500'
													}`}
												>
													{
														difficultNameMap[exercise.difficulty] || exercise.difficulty
													}
												</Badge>
											)}

                      {exercise.type && (
                        <Badge
                          variant={'secondary'}
                          className="text-xs font-barlow uppercase tracking-wide rounded-none"
                        >
                          {typeNameMap[exercise.type] || exercise.type}
                        </Badge>
                      )}
										</div>
									</div>

									<Button
										type="button"
										size="sm"
										variant={isSelected ? 'secondary' : 'default'}
										onClick={() => handleSelectExercise(exercise.id, exercise.name)}
										disabled={isSelected}
										className="shrink-0 uppercase font-barlow font-semibold tracking-wide text-xs"
									>
										{isSelected ? (
											<>
												<Check className='h-4 w-4 sm:mr-1.5' />
												<span className="hidden sm:inline">Agregado</span>
											</>
										) : (
											<>
												<Plus className="h-4 w-4 sm:mr-1.5" />
												<span className="hidden sm:inline">Agregar</span>
											</>
										)}

									</Button>
								</div>
							</div>
						)
					})
				)}
			</div>
		</Card>
	)
}
