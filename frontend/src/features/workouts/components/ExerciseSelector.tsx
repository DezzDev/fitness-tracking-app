// src/features/workouts/components/ExerciseSelector.tsx
import { useEffect, useState } from "react";
import { useExercises } from "@/features/exercises/hooks/useExercises";
import { Check, Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ExerciseFiltersBar from "@/features/exercises/components/ExerciseFiltersBar";
import type { ExerciseDifficulty, ExerciseType } from "@/types";

const difficultNameMap: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

interface ExerciseSelectorProps {
  onSelectExercise: (exerciseId: string, exerciseName: string) => void;
  selectedExerciseIds?: string[];
}

export default function ExerciseSelector({
  onSelectExercise,
  selectedExerciseIds = [],
}: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty | undefined>();
  const [type, setType] = useState<ExerciseType | undefined>();
  const [muscleGroup, setMuscleGroup] = useState<string | undefined>();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce del término de búsqueda (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);

    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);



  // Query de ejercicios
  const { data, isLoading } = useExercises({
    searchTerm: debouncedSearchTerm,
    difficulty,
    type,
    muscleGroup,
    limit: 100
  });


  const exercises = data?.data?.items || [];

  const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
    onSelectExercise(exerciseId, exerciseName);
    // Cerrar el selector después de agregar
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDifficulty(undefined);
    setType(undefined);
    setMuscleGroup(undefined);
  };


  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed border-border rounded-none hover:border-primary/50 hover:bg-primary/5 transition-colors uppercase font-barlow font-semibold tracking-wide"
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
          className="rounded-none"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Búsqueda */}
      {/* Filters Bar */}
      <ExerciseFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        type={type}
        onTypeChange={setType}
        muscleGroup={muscleGroup}
        onMuscleGroupChange={setMuscleGroup}
        onClearFilters={handleClearFilters}
      />

      {/* Lista de ejercicios */}
      <div className="max-h-96 overflow-y-auto overflow-x-hidden border border-border divide-y divide-border">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
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
                          className="text-xs font-medium bg-popover text-primary rounded-none tracking-widest uppercase"
                        >
                          {exercise.muscleGroup}
                        </Badge>
                      )}

                      {exercise.difficulty && (
                        <Badge
                          variant={'secondary'}
                          className="text-xs font-medium bg-popover text-muted-foreground rounded-none tracking-widest uppercase"
                        >
                          {
                            difficultNameMap[exercise.difficulty] || exercise.difficulty
                          }
                        </Badge>
                      )}

                      {exercise.type && (
                        <Badge
                          variant={'secondary'}
                          className="text-xs font-medium bg-popover text-muted-foreground rounded-none tracking-widest uppercase"
                        >
                          {exercise?.type || exercise.type}
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
                    className="shrink-0 uppercase font-barlow font-semibold tracking-wide text-xs rounded-none"
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
