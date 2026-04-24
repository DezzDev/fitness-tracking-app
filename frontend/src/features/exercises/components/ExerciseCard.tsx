import { Card, CardContent } from "@/components/ui/card";
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
      label: 'Principiante'
    },
    intermediate: {
      label: 'Intermedio'
    },
    advanced: {
      label: 'Avanzado'
    }
  };


  const difficulty = exercise.difficulty ? difficultyConfig[exercise.difficulty] : null;
  const type = exercise.type ? exercise.type : null;

  return (
    <Card
      className="bg-card rounded-none hover:shadow-lg hover:bg-card/50 transition-shadow cursor-pointer py-3 border border-border"
      onClick={onClick}
    >
      <CardContent className="space-y-2 grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-4">
        <div>
          <h3 className="font-semibold text-2xl text-foreground capitalize tracking-widest">
            {exercise.name}
          </h3>

          <p className="text-sm text-muted-foreground tracking-wide">
            {exercise.description  
              ? exercise.description                
              : 'No hay descripción disponible para este ejercicio.'}
          </p>

        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap ">

          {/* Grupo muscular */}
          {exercise.muscleGroup && (
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-popover text-primary rounded-none tracking-widest uppercase"
            >
              {capitalize(exercise.muscleGroup)}
            </Badge>
          )}

          {/* Dificultad */}
          {difficulty && (
            <Badge
              variant="secondary"
              className={`text-xs font-medium bg-popover text-muted-foreground rounded-none tracking-widest uppercase`}
            >
              {difficulty.label}
            </Badge>
          )}

          {/* Tipo */}
          {type && (
            <Badge
              variant="secondary"
              className={`text-xs font-medium bg-popover text-muted-foreground rounded-none tracking-widest uppercase`}
            >
              {type}
            </Badge>
          )}


        </div>
      </CardContent>
    </Card>
  );
}
