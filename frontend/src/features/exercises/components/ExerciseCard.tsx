import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
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

  // Configuración de tipo
  const typeConfig = {
    strength: {
      label: 'Fuerza'
    },
    endurance: {
      label: 'Resistencia'
    },
    skill: {
      label: 'Habilidad'
    },
    explosive: {
      label: 'Explosivo'
    }
  };

  const difficulty = exercise.difficulty ? difficultyConfig[exercise.difficulty] : null;
  const type = exercise.type ? typeConfig[exercise.type] : null;

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer border-border rounded-none py-5
      gap-0 md:gap-4"
      onClick={onClick}
    >
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-2xl text-foreground line-clamp-1 capitalize">
            {exercise.name}
          </h3>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />

        </div>
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Grupo muscular */}
          {exercise.muscleGroup && (
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-popover text-primary rounded-none tracking-widest"
            >
              {capitalize(exercise.muscleGroup)}
            </Badge>
          )}

          {/* Dificultad */}
          {difficulty && (
            <Badge
              variant="secondary"
              className={`text-xs font-medium bg-popover text-muted-foreground rounded-none tracking-widest`}
            >
              {difficulty.label}
            </Badge>
          )}

          {/* Tipo */}
          {type && (
            <Badge
              variant="secondary"
              className={`text-xs font-medium bg-popover text-muted-foreground rounded-none tracking-widest`}
            >
              {type.label}
            </Badge>
          )}


        </div>
      </CardContent>
    </Card>
  );
}
