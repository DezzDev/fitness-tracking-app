import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useExercise } from "../hooks/useExercises";

interface ExerciseDetailDialogProps {
	exerciseId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function capitalize(word: string) {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export default function ExerciseDetailDialog({
	exerciseId,
	open,
	onOpenChange
}: ExerciseDetailDialogProps) {
	const { data: exercise, isLoading } = useExercise(exerciseId || '');

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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-20 w-full" />
						<div className="flex gap-2">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-24" />
						</div>
					</div>
				) : exercise ? (
					<>
						<DialogHeader>
							<DialogTitle className="text-2xl font-bebas tracking-wide text-foreground">
								{exercise.name}
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							{/* Descripción */}
							{exercise.description && (
								<div>
									<h4 className="text-sm font-semibold text-foreground mb-2">
										Descripción
									</h4>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{exercise.description}
									</p>
								</div>
							)}

							{/* Badges */}
							<div>
								<h4 className="text-sm font-semibold text-foreground mb-2">
									Características
								</h4>
								<div className="flex items-center gap-2 flex-wrap">
									{/* Dificultad */}
									{exercise.difficulty && (
										<Badge
											variant="outline"
											className={`text-sm font-medium ${
												difficultyConfig[exercise.difficulty].color
											}`}
										>
											{difficultyConfig[exercise.difficulty].emoji}{' '}
											{difficultyConfig[exercise.difficulty].label}
										</Badge>
									)}

									{/* Tipo */}
									{exercise.type && (
										<Badge
											variant="outline"
											className={`text-sm font-medium ${
												typeConfig[exercise.type].color
											}`}
										>
											{typeConfig[exercise.type].icon}{' '}
											{typeConfig[exercise.type].label}
										</Badge>
									)}

									{/* Grupo muscular */}
									{exercise.muscleGroup && (
										<Badge
											variant="secondary"
											className="text-sm font-medium bg-[var(--surface-elevated)] text-muted-foreground"
										>
											🎯 {capitalize(exercise.muscleGroup)}
										</Badge>
									)}
								</div>
							</div>

							{/* Fecha de creación */}
							<div className="pt-4 border-t border-border">
								<p className="text-xs text-muted-foreground">
									Creado el{' '}
									{format(new Date(exercise.createdAt), "dd 'de' MMMM 'de' yyyy", {
										locale: es
									})}
								</p>
							</div>
						</div>
					</>
				) : (
					<div className="text-center py-8">
						<p className="text-muted-foreground">Ejercicio no encontrado</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
