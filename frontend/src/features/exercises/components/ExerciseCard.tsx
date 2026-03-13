import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/types";

interface ExerciseCardProps {
	exercise: Exercise;
	onClick: () => void;
}

function capitalize(word: string) {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export default function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
	// Configuración de dificultad
	const difficultyConfig = {
		beginner: {
			label: 'Principiante',
			color: 'border-[var(--success)] text-[var(--success)] bg-[var(--success)]/10',
			emoji: '🟢'
		},
		intermediate: {
			label: 'Intermedio',
			color: 'border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/10',
			emoji: '🟡'
		},
		advanced: {
			label: 'Avanzado',
			color: 'border-destructive text-destructive bg-destructive/10',
			emoji: '🔴'
		}
	};

	// Configuración de tipo
	const typeConfig = {
		strength: {
			label: 'Fuerza',
			icon: '💪',
			color: 'bg-primary/10 text-primary border-primary/20',
		},
		endurance: {
			label: 'Resistencia',
			icon: '🏋️‍♀️',
			color: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
		},
		skill: {
			label: 'Habilidad',
			icon: '🧠',
			color: 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20',
		},
		explosive: {
			label: 'Explosivo',
			icon: '💥',
			color: 'bg-accent/10 text-accent border-accent/20',
		}
	};

	const difficulty = exercise.difficulty ? difficultyConfig[exercise.difficulty] : null;
	const type = exercise.type ? typeConfig[exercise.type] : null;

	return (
		<Card 
			className="hover:shadow-lg transition-shadow cursor-pointer" 
			onClick={onClick}
		>
			<CardHeader className="pb-3">
				<h3 className="font-semibold text-lg text-foreground line-clamp-1">
					{exercise.name}
				</h3>
			</CardHeader>
			
			<CardContent className="space-y-3">
				{/* Descripción */}
				{exercise.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{exercise.description}
					</p>
				)}

				{/* Badges */}
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

					{/* Tipo */}
					{type && (
						<Badge
							variant="outline"
							className={`text-xs font-medium ${type.color}`}
						>
							{type.icon} {type.label}
						</Badge>
					)}

					{/* Grupo muscular */}
					{exercise.muscleGroup && (
						<Badge
							variant="secondary"
							className="text-xs font-medium bg-[var(--surface-elevated)] text-muted-foreground"
						>
							🎯 {capitalize(exercise.muscleGroup)}
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
