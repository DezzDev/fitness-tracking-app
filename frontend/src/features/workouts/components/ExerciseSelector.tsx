// src/features/workouts/components/ExerciseSelector.tsx
import { useState } from "react";
import { useExercises } from "../hooks/useExercise";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseSelectorProps {
	onSelectExercise: (exerciseId: string) => void;
	selectedExerciseIds?: string[];
}

export default function ExerciseSelector({
	onSelectExercise,
	selectedExerciseIds = [],
}: ExerciseSelectorProps) {
	const [ searchTerm, setSearchTerm ] = useState('');

	const { data, isLoading } = useExercises({
		searchTerm,
		limit: 50 // Mostrar más ejercicios
	})

	const exercises = data?.data || [];

	return (
		<div className="space-y-4">
			{/* Búsqueda */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
					<div className="p-8 text-center text-gray-500">
						<p>No se encontraron ejercicios</p>
						{searchTerm && (
							<p className="text-sm mt-1">
								Intenta con otro término de búsqueda
							</p>
						)}
					</div>
				) : (
					exercises.map((exercise)=>{
						const isSelected = selectedExerciseIds.includes(exercise.id)

						return(
							
						)
					})
				)
				}
			</div>
		</div>
	)
}
