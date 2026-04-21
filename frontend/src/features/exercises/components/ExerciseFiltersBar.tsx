import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ExerciseDifficulty, ExerciseType } from "@/types";

interface ExerciseFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  difficulty?: ExerciseDifficulty;
  onDifficultyChange: (value: ExerciseDifficulty | undefined) => void;
  type?: ExerciseType;
  onTypeChange: (value: ExerciseType | undefined) => void;
  muscleGroup?: string;
  onMuscleGroupChange: (value: string | undefined) => void;
  onClearFilters: () => void;
}

export default function ExerciseFiltersBar({
  searchTerm,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  type,
  onTypeChange,
  muscleGroup,
  onMuscleGroupChange,
  onClearFilters
}: ExerciseFiltersBarProps) {
  const hasActiveFilters = searchTerm || difficulty || type || muscleGroup;
  return (
    <>

      <div className="flex flex-col items-center gap-4">
        {/* Búsqueda */}
        <div className=" w-full max-w-[450px] self-start relative col-span-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ejercicios..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-none"
          />
        </div>

        <div className="flex self-start flex-wrap items-center gap-1">

          {/* Filtro de grupo muscular */}
          <Select
            value={muscleGroup || "all"}
            onValueChange={(value) =>
              onMuscleGroupChange(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="tracking-[2px] rounded-none">
              <SelectValue placeholder="Grupo muscular" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border" position="popper" align="start">
              <SelectItem value="all">Musculo</SelectItem>
              <SelectItem value="pecho">Pecho</SelectItem>
              <SelectItem value="espalda">Espalda</SelectItem>
              <SelectItem value="piernas">Piernas</SelectItem>
              <SelectItem value="hombros">Hombros</SelectItem>
              <SelectItem value="bíceps">Bíceps</SelectItem>
              <SelectItem value="tríceps">Tríceps</SelectItem>
              <SelectItem value="core">Core</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de dificultad */}
          <Select
            value={difficulty || "all"}
            onValueChange={(value) =>
              onDifficultyChange(value === "all" ? undefined : value as ExerciseDifficulty)
            }
          >
            <SelectTrigger className="tracking-[2px] rounded-none">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border" position="popper" align="start">
              <SelectItem value="all">Dificultad</SelectItem>
              <SelectItem value="beginner">Principiante</SelectItem>
              <SelectItem value="intermediate">Intermedio</SelectItem>
              <SelectItem value="advanced">Avanzado</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de tipo */}
          <Select
            value={type || "all"}
            onValueChange={(value) =>
              onTypeChange(value === "all" ? undefined : value as ExerciseType)
            }
          >
            <SelectTrigger className="tracking-[2px] rounded-none">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border" position="popper" align="start">
              <SelectItem value="all">Tipo</SelectItem>
              <SelectItem value="fuerza">Fuerza</SelectItem>
              <SelectItem value="resistencia">Resistencia</SelectItem>
              <SelectItem value="skill">Skill</SelectItem>
              <SelectItem value="explosivo">Explosivo</SelectItem>
              <SelectItem value="mobilidad">mobilidad</SelectItem>
              <SelectItem value="isométrico">isométrico</SelectItem>
            </SelectContent>
          </Select>



          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClearFilters}
              className="shrink-0 rounded-none"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

        </div>

      </div>


    </>
  );
}
