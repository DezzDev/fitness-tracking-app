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
      label: 'Principiante'
    },
    intermediate: {
      label: 'Intermedio'
    },
    advanced: {
      label: 'Avanzado'
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary rounded-none w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px]">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-[100px] sm:w-3/4" />
            <Skeleton className="h-20 w-[200px] sm:w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12 sm:w-24" />
              <Skeleton className="h-6 w-12 sm:w-24" />
              <Skeleton className="h-6 w-12 sm:w-24" />
            </div>
          </div>
        ) : exercise ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bebas tracking-widest text-foreground">
                {exercise.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Descripción */}
              {exercise.description && (
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2 tracking-widest">
                    Descripción
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exercise.description}
                  </p>
                </div>
              )}

              {/* Badges */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2 tracking-widest">
                  Características
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Grupo muscular */}
                  {exercise.muscleGroup && (
                    <Badge
                      variant="secondary"
                      className="text-sm font-medium rounded-none tracking-widest"
                    >
                      {capitalize(exercise.muscleGroup)}
                    </Badge>
                  )}
                  {/* Dificultad */}
                  {exercise.difficulty && (
                    <Badge
                      variant="secondary"
                      className={`text-sm font-medium rounded-none tracking-widest`}
                    >
                      {difficultyConfig[exercise.difficulty].label}
                    </Badge>
                  )}

                  {/* Tipo */}
                  {exercise.type && (
                    <Badge
                      variant="secondary"
                      className={`text-sm font-medium rounded-none tracking-widest`}
                    >
                      {capitalize(exercise.type)}
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
