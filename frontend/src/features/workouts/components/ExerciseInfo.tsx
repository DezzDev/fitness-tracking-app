import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useExercise } from "@/features/exercises/hooks/useExercises";
import { Dumbbell, Info } from "lucide-react";

interface ExerciseInfoProps{
	exerciseId : string;
	index:number;
	showFullDescription?: boolean;
	compact?: boolean;
}

function capitalize(word: string) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }

export default function ExerciseInfo({
	exerciseId,
	index,
	showFullDescription = false,
	compact = false
}: ExerciseInfoProps){

	const { data: exercise, isLoading, isError } = useExercise(exerciseId);

	if (isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-5 w-48" />
				{!compact && <Skeleton className="h-4 w-64" /> }
				<div className="flex gap-2">
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-5 w-20" />
				</div>
			</div>
		)
	}

	// Fallback si har error o no se encuentra
	if(isError || !exercise) {
		return (
			<div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 ">
				<div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
					<Dumbbell className="h-5 w-5 text-amber-600"/>
				</div>
				<div>
					<h4 className="font-medium text-gray-900">
						Ejercicio #{index + 1}
					</h4>
					<p className="text-xs text-gray-500">
						 {exercise?.name || 'Ejercicio desconocido'}
					</p>
					<p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
						<Info className="h-3 w-3" />
						Ejercicio no encontrado
					</p>
				</div>
			</div>
		)
	}

	// configuración de estilo
	const difficultyConfig = {
		beginner: {
			label: 'Principiante',
			color: 'border-green-600 text-green-700 bg-green-50',
			emoji: '🟢'
		},
		intermediate: {
			label: 'Intermedio',
			color: 'border-yellow-600 text-yellow-700 bg-yellow-50',
			emoji: '🟡'
		},
		advanced: {
			label: 'Avanzado',
			color: 'border-red-600 text-red-700 bg-red-50',
			emoji: '🔴'
		}
	}

	const typeConfig = {
		strength: {
			label: 'Fuerza',
			icon: '💪',
			color: 'bg-blue-50 text-blue-700',
		},
		endurance: {
			label: 'Resistencia',
			icon: '🏋️‍♀️',
			color: 'bg-green-50 text-green-700',
		},
		skill: {
			label: 'Habilidad',
			icon: '🧠',
			color: 'bg-purple-50 text-purple-700',
		},
		explosive: {
			label: 'Explosivo',
			icon: '💥',
			color: 'bg-orange-50 text-orange-700',
		}
	}

	const difficulty = exercise.difficulty 
		? difficultyConfig[exercise.difficulty]
		: null;
	const type = exercise.type ? typeConfig[exercise.type] : null;


	// Versión compacta (para listas pequeñas)
	if(compact){
		return (
			<div className="flex items-center gap-2">
				<span className="font-semibold text-gray-600 text-sm">{index + 1}.</span>
				<span className="font-medium text-gray-900">{exercise.name}</span>
				{difficulty && (
					<Badge variant="outline" className={`text-xs ${difficulty.color}`}>
						{difficulty.emoji}
					</Badge>
				)}
			</div>
		);
	}

	// Versión completa
	return (
		<div className="space-y-3">
			{/* Header con número y título */}
			<div className="flex items-start gap-2">
				<span className="font-semibold text-blue-600 text-sm shrink-0 mt-0.5">
					{index + 1}.
				</span>
				<div className="flex-1">
					<h4 className="font-semibold text-gray-900 text-base leading-tight">
						{exercise.name}
					</h4>
				</div>
			</div>

			{/* Descripción con tooltip si es muy larga */}
			{exercise.description && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<p
								className={`text-sm text-gray-600 ${showFullDescription ? '' : 'line-clamp-2'
									}`}
							>
								{exercise.description}
							</p>
						</TooltipTrigger>
						{!showFullDescription && exercise.description.length > 100 && (
							<TooltipContent className="max-w-sm">
								<p className="text-sm">{exercise.description}</p>
							</TooltipContent>
						)}
					</Tooltip>
				</TooltipProvider>
			)}

			{/* Badges informativos */}
			<div className="flex items-center gap-2 flex-wrap">
				{/* Dificultad */}
				{difficulty && (
					<Badge
						variant="outline"
						className={`text-xs font-medium ${difficulty.color}`}
					>
						{difficulty.emoji} {difficulty.label}
					</Badge>
				)}

				{/* Grupo muscular */}
				{exercise.muscleGroup && (
					<Badge
						variant="secondary"
						className="text-xs font-medium bg-gray-100 text-gray-700"
					>
						🎯 {capitalize(exercise.muscleGroup)}
					</Badge>
				)}

				{/* Tipo */}
				{type && (
					<Badge
						variant="outline"
						className={`text-xs font-medium ${type.color}`}
					>
						{type.icon} {type.label}
					</Badge>
				)}
			</div>
		</div>
	);
}