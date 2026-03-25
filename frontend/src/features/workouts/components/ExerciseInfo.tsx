import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useExercise } from "@/features/exercises/hooks/useExercises";
import { Dumbbell, Info } from "lucide-react";

interface ExerciseInfoProps {
  exerciseId: string;
  index: number;
  showFullDescription?: boolean;
  compact?: boolean;
}

function capitalize(word: string) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }

export default function ExerciseInfo({
  exerciseId,
  index,
  showFullDescription = false,
  compact = false
}: ExerciseInfoProps) {

  const { data: exercise, isLoading, isError } = useExercise(exerciseId);
  console.log({ exercise })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 sm:w-48" />
        {!compact && <Skeleton className="h-4 w-32 sm:w-64" />}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    )
  }

  // Fallback si har error o no se encuentra
  if (isError || !exercise) {
    return (
      <div className="flex items-center gap-3 p-3 bg-(--warning)/10 rounded-lg border border-(--warning)/20 ">
        <div className="w-10 h-10 bg-(--warning)/20 rounded-lg flex items-center justify-center">
          <Dumbbell className="h-5 w-5 text-(--warning)" />
        </div>
        <div>
          <h4 className="font-medium text-foreground">
            Ejercicio #{index + 1}
          </h4>
          <p className="text-xs text-muted-foreground">
            {exercise?.name || 'Ejercicio desconocido'}
          </p>
          <p className="text-xs text-(--warning) mt-1 flex items-center gap-1">
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
  }

  const typeConfig = {
    strength: {
      label: 'Fuerza',
      icon: '💪',
      color: 'bg-primary/10 text-primary',
    },
    endurance: {
      label: 'Resistencia',
      icon: '🏋️‍♀️',
      color: 'bg-[var(--success)]/10 text-[var(--success)]',
    },
    skill: {
      label: 'Habilidad',
      icon: '🧠',
      color: 'bg-[#A855F7]/10 text-[#A855F7]',
    },
    explosive: {
      label: 'Explosivo',
      icon: '💥',
      color: 'bg-accent/10 text-accent',
    }
  }

  const difficulty = exercise.difficulty
    ? difficultyConfig[exercise.difficulty]
    : null;
  const type = exercise.type ? typeConfig[exercise.type] : null;


  // Versión compacta (para listas pequeñas)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-muted-foreground text-sm">{index + 1}.</span>
        <span className="font-medium text-foreground">{exercise.name}</span>
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
      {/* Header con título */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-base leading-tight">
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
                className={`text-sm text-muted-foreground ${showFullDescription ? '' : 'line-clamp-2'
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
            className={`text-xs font-medium ${difficulty.color} rounded-none`}
          >
            {difficulty.label}
          </Badge>
        )}

        {/* Grupo muscular */}
        {exercise.muscleGroup && (
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-popover text-muted-foreground rounded-none"
          >
            {capitalize(exercise.muscleGroup)}
          </Badge>
        )}

        {/* Tipo */}
        {type && (
          <Badge
            variant="outline"
            className={`text-xs font-medium ${type.color} rounded-none`}
          >
            {type.label}
          </Badge>
        )}
      </div>
    </div>
  );
}