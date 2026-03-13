import { useState } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	Calendar,
	Dumbbell,
	MoreVertical,
	Pencil,
	Trash2,
	Eye,
	AlertTriangle
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { WorkoutWithExercises, WorkoutSessionWithExercises } from "@/types";
import { useDeleteSession } from "../hooks/useWorkoutSessions";

interface WorkoutCardProps {
	workout: WorkoutWithExercises | WorkoutSessionWithExercises;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
	const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);
	const { mutate: deleteWorkout, isPending } = useDeleteSession();
	console.log({workout})

	const handleDelete = () => {
		deleteWorkout(workout.id, {
			onSuccess: () => {
				setShowDeleteDialog(false);
			}
		})
	}

	const workoutDate = new Date(workout.createdAt);

	return (
		<>
			<Card className="hover:shadow-lg transition-shadow">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">

						<div className="flex-1">
							<Link to={`/workouts/sessions/${workout.id}`}>
								<h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
									{workout.title}
								</h3>
							</Link>

							<div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
								<Calendar className="w-4 h-4" />
								<span>
									{format(workoutDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
								</span>
							</div>
						</div>

						{/* Menu de acciones */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link
										to={`/workouts/sessions/${workout.id}`}
										className="flex items-center cursor-pointer"
									>
										<Eye className="mr-2 h-4 w-4" />
										Ver detalle
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										to={`/workouts/sessions/${workout.id}/edit`}
										className="flex items-center cursor-pointer"
									>
										<Pencil className="mr-2 h-4 w-4" />
										Editar
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => setShowDeleteDialog(true)}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Eliminar
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>

				<CardContent>
					{/* Notas */}
					{workout.notes && (
						<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
							{workout.notes}
						</p>
					)}

					{/* Footer - placeholder para cuando tenga ejercicios */}
					<div className="flex items-center justify-between pt-3 border-t">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Dumbbell className="h-4 w-4" />
							<span>
								{workout.exercises.length || 0} ejercicio
								{workout.exercises.length !== 1 ? 's' : ''}

							</span>
						</div>

						<Badge variant="outline" className="text-xs">
							{format(workoutDate, 'HH:mm')}
						</Badge>
					</div>
				</CardContent>

			</Card>

			{/* Dialog de confirmación de eliminación */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							¿Eliminar entrenamiento?
						</DialogTitle>
						<DialogDescription>
							<p className="mb-3">
								Estás a punto de eliminar el entrenamiento:
							</p>
							<p className="font-semibold text-foreground mb-3">
								"{workout.title}"
							</p>
							<p className="text-sm">
								Esta acción no se puede deshacer. Se eliminarán todos los
								ejercicios y series asociados.
							</p>
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isPending}
						>
							{isPending ? 'Eliminando...' : 'Eliminar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}


