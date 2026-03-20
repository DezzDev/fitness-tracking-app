import { useState, useEffect } from "react";
import { useExercises } from "../hooks/useExercises";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import ExerciseStatsBar from "../components/ExerciseStatsBar";
import ExerciseFiltersBar from "../components/ExerciseFiltersBar";
import ExerciseCard from "../components/ExerciseCard";
import ExerciseDetailDialog from "../components/ExerciseDetailDialog";
import Pagination from "../components/Pagination";
import type { ExerciseDifficulty, ExerciseType } from "@/types";

export default function ExercisesPage() {
	// Estados de filtros
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [difficulty, setDifficulty] = useState<ExerciseDifficulty | undefined>();
	const [type, setType] = useState<ExerciseType | undefined>();
	const [muscleGroup, setMuscleGroup] = useState<string | undefined>();
	const [page, setPage] = useState(1);
	
	// Estado del diálogo de detalle
	const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	// Debounce del término de búsqueda (300ms)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setPage(1); // ir a página 1 cuando cambia la búsqueda
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Query de ejercicios
	const { data, isLoading } = useExercises({
		searchTerm: debouncedSearchTerm,
		difficulty,
		type,
		muscleGroup,
		page,
		limit: 12
	});

	const exercises = data?.data?.items || [];
	const totalPages = data?.data?.totalPages || 1;

	// Handlers
	const handleClearFilters = () => {
		setSearchTerm("");
		setDebouncedSearchTerm("");
		setDifficulty(undefined);
		setType(undefined);
		setMuscleGroup(undefined);
		setPage(1);
	};

	const handleExerciseClick = (exerciseId: string) => {
		setSelectedExerciseId(exerciseId);
		setDialogOpen(true);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Resetear página cuando cambian filtros
	useEffect(() => {
		setPage(1);
	}, [difficulty, type, muscleGroup]);

	return (
		<div className="space-y-6 flex flex-1 flex-col">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-foreground font-bebas tracking-wide">
					Ejercicios
				</h1>
				<p className="text-muted-foreground mt-1">
					Explora el catálogo de ejercicios disponibles
				</p>
			</div>

			{/* Stats Bar */}
			{/* <ExerciseStatsBar /> */}

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

			{/* Exercise Grid - Three states: Loading | Empty | Data */}
			{isLoading ? (
				<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(12)].map((_, i) => (
						<Card key={i} className="p-6 space-y-3 border-border rounded-none py-2 md:py-6 gap-0 md:gap-4">
							<Skeleton className="h-6 w-3/4" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-20" />
							</div>
						</Card>
					))}
				</div>
			) : exercises.length === 0 ? (
				<Card className="p-12 text-center border-border rounded-none">
					<div className="max-w-sm mx-auto space-y-4">
						<div className="w-16 h-16 bg-popover rounded-full flex items-center justify-center mx-auto">
							<Plus className="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-foreground tracking-widest">
								No se encontraron ejercicios
							</h3>
							<p className="text-muted-foreground mt-1 tracking-widest">
								{searchTerm || difficulty || type || muscleGroup
									? 'Intenta ajustar los filtros de búsqueda'
									: 'No hay ejercicios disponibles en este momento'}
							</p>
						</div>
					</div>
				</Card>
			) : (
				<>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{exercises.map((exercise) => (
							<ExerciseCard
								key={exercise.id}
								exercise={exercise}
								onClick={() => handleExerciseClick(exercise.id)}
							/>
						))}
					</div>

					{/* Pagination */}
					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</>
			)}

			{/* Exercise Detail Dialog */}
			<ExerciseDetailDialog
				exerciseId={selectedExerciseId}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	);
}
