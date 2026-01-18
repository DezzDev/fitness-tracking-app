// src/features/workouts/pages/WorkoutsPage.tsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search, Calendar, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkouts } from "../hooks/useWorkouts";
import WorkoutCard from "../components/WorkoutCard";
import type { WorkoutFilters } from "@/types";


export default function WorkoutsPage() {
	const[filters, setFilters] = useState<WorkoutFilters>({
		page: 1,
		limit: 10,
		searchTerm: ''
	})

	const {data, isLoading, isError}= useWorkouts(filters);

	const handleSearch = (searchTerm: string) => {
		setFilters((prev) => ({...prev, searchTerm, page:1}))
	}

	const handlePageChange = (page:number) => {
		setFilters((prev) => ({...prev, page}))
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900"> Entrenamientos</h1>
					<p className="text-gray-600 mt-1">
						Administra y visualiza tus entrenamientos.
					</p>
				</div>

				<Link to={'/workouts/new'}>
					<Button size={'lg'}>
						<Plus className="mr-2 h-5 w-5" />
						Nuevo Entrenamiento
					</Button>
				</Link>
			</div>

			{/* Filtros */}
			<Card className="p-4">
				<div className="flex flex-col sm:flex-row gap-3">
					{/* Búsqueda */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input 
							placeholder="Buscar entrenamiento..."
							value={filters.searchTerm || ''}
							onChange= {(e) => handleSearch(e.target.value)}
							className="pl-10"
						/>						
					</div>

					{/* Filtro de fecha (placeholder - implementar después) */}
					<Button className="sm:w-auto" variant={'outline'}>
						<Calendar className="mr-2 h-4 w-4" />
						Fecha
					</Button>

					{/* Más filtros */}
					<Button className="sm:w-auto">
						<Filter className="mr-2 h-4-w-4" />
						Filtros
					</Button>
				</div>
			</Card>

			{/* Contenido */}
			{isLoading ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="p-6 space-y-3">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-20 w-ful" />
						</Card>
					))}
				</div>
			): isError ? (
				<Card className="p-12 text-center">
					<p className="text-gray-500">Error al cargar entrenamientos</p>
				</Card>
			): !data?.data?.items || data.data.items.length === 0 ? (
				<Card className="p-12 text-center">
					<div className="max-w-sm mx-auto space-y-4">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
							<Plus className="h-8 w-8 text-gray-400" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								No hay entrenamientos
							</h3>
							<p className="text-gray-500 mt-1">
								Comienza registrando tu primer entrenamiento
							</p>
						</div>
						<Link to={'/workouts/new'}>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Crear Entrenamiento
						</Button>
						</Link>
					</div>
				</Card>
			): (
				<>
					{/* Grid de workouts */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{data.data.items.map((workout)=>(
							<WorkoutCard key={workout.id} workout={workout} />
						))}
					</div>

					{/* Paginación */}
					{data.data.page !== undefined && data.data.totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-8">
							<Button
								variant="outline"
								onClick={()=> handlePageChange(data.data?.page! - 1)}
								disabled={data.data.page <= 1}
							>
								Anterior
							</Button>

							<span className="text-sm text-gray-600">
								Página {data.data.page} de {data.data.totalPages}
							</span>

							<Button
								variant={"outline"}
								onClick={() => handlePageChange(data.data?.page! + 1)}
								disabled={data.data.page === data.data.totalPages}
							>
								Siguiente
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	)
}

