// src/features/workouts/pages/TemplateDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Star, Play, Pencil, Copy, Dumbbell, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	useWorkoutTemplate,
	useToggleFavorite,
	useDuplicateTemplate,
	useDeleteTemplate
} from '../hooks/useWorkoutTemplates';
import type { WorkoutTemplateExercise, WorkoutTemplateSet } from '@/types';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function TemplateDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const templateId = id!;

	const { data: response, isLoading, isError } = useWorkoutTemplate(templateId);
	const { mutate: toggleFavorite } = useToggleFavorite();
	const { mutate: duplicateTemplate } = useDuplicateTemplate();
	const deleteTemplateMutation = useDeleteTemplate();

	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const template = response || null;

	const handleStartSession = () => {
		navigate(`/workouts/sessions/start?templateId=${templateId}`);
	};

	const handleEdit = () => {
		navigate(`/workouts/templates/${templateId}/edit`);
	};

	const handleDuplicate = () => {
		duplicateTemplate(templateId);
	};

	const handleConfirmDelete = () => {
		deleteTemplateMutation.mutate(templateId, {
			onSuccess: () => navigate('/workouts?tab=templates'),
			onSettled: () => setShowDeleteModal(false),
		});
	};

	const handleToggleFavorite = () => {
		toggleFavorite(templateId);
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6 w-full">
				<Skeleton className="h-10 w-3/4" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (isError || !template) {
		return (
			<Card className="p-12 text-center max-w-md mx-auto w-full">
				<p className="text-muted-foreground mb-4">
					Plantilla no encontrada
				</p>
				<Button onClick={() => navigate('/workouts')}>
					Volver a Workouts
				</Button>
			</Card>
		);
	}

	const exercises = template.exercises || [];
	const totalSets = exercises.reduce(
		(sum: number, ex: WorkoutTemplateExercise) => sum + (ex.sets?.length || ex.suggestedSets || 0),
		0
	);

	return (
		<>
		<div className="max-w-4xl mx-auto space-y-6 w-full">
			{/* Back Button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate('/workouts?tab=templates')}
				className="font-barlow uppercase tracking-[2px] text-xs"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Plantillas
			</Button>

			{/* Header */}
			<div className="space-y-4">

				{/* Tag */}
				<h2 className="font-barlow uppercase tracking-[3px] text-xs text-primary mb-2">
					Plantilla
					{template.scheduledDayOfWeek !== undefined && template.scheduledDayOfWeek !== null
						? ` - ${DAY_NAMES[template.scheduledDayOfWeek]}`
						: ''}
				</h2>

				{/* Nombre + Favorito */}
				<div className="flex items-center gap-3">
					<h1 className="text-4xl font-bebas tracking-wide uppercase text-foreground">
						{template.name}
					</h1>
					<button
						onClick={handleToggleFavorite}
						className="shrink-0 p-1 hover:scale-110 transition-transform"
						aria-label="Marcar como favorito"
					>
						<Star
							className={`h-6 w-6 ${
								template.isFavorite
									? 'fill-primary text-primary'
									: 'text-muted-foreground'
							}`}
						/>
					</button>
				</div>

				{/* Descripción */}
				{template.description && (
					<p className="text-muted-foreground font-barlow">
						{template.description}
					</p>
				)}

				{/* Stats row */}
				<div className="flex items-center gap-6 text-sm font-barlow">
					<div className="flex flex-col items-center">
						<span className="text-foreground font-semibold text-lg">{exercises.length}</span>
						<span className="text-muted-foreground uppercase text-sm tracking-[2px]">ejercicios</span>
					</div>

					<div className="flex flex-col items-center">
						<span className="text-foreground font-semibold text-lg">{totalSets}</span>
						<span className="text-muted-foreground uppercase text-sm tracking-[2px]">series</span>
					</div>

					<div className="flex flex-col items-center">
						<span className="text-foreground font-semibold text-lg">{template.usageCount || 0}</span>
						<span className="text-muted-foreground uppercase text-sm tracking-[2px]">usos</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* Ejercicios */}
			<div>
				<div className="space-y-6">
					<h2 className="text-lg font-bebas tracking-[2px] uppercase text-foreground">
						Ejercicios
					</h2>
					<Separator />
					{exercises.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p className="font-barlow">No hay ejercicios en esta plantilla</p>
						</div>
					) : (
						<div className="space-y-6">
							{exercises.map((templateExercise: WorkoutTemplateExercise, index: number) => (
								<div key={templateExercise.id}>
									{index > 0 && <Separator className="my-6" />}

									<div className="space-y-4">
										{/* Ejercicio info */}
										<div className="flex flex-col items-start gap-1">

											{templateExercise.muscleGroup && (
												<div
													className="font-barlow uppercase text-xs tracking-[2px] text-primary"
												>
													{templateExercise.muscleGroup}
												</div>
											)}

											<div className="flex-1 min-w-0 space-y-1">
												<h3 className="font-bebas tracking-[2px] text-2xl text-foreground">
													{templateExercise.exerciseName || 'Ejercicio'}
												</h3>
											</div>
										</div>

										{/* Sets */}
										{templateExercise.sets && templateExercise.sets.length > 0 ? (
											<div className="space-y-2">
												{templateExercise.sets.map((set: WorkoutTemplateSet) => (
													<div
														key={set.id}
														className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg"
													>
														<span className="text-xs font-barlow font-bold uppercase text-muted-foreground tracking-wide min-w-[60px]">
															Serie {set.setNumber}
														</span>

														<div className="flex items-center gap-4 flex-wrap text-sm font-barlow">
															{set.targetReps !== null && set.targetReps !== undefined && (
																<div>
																	<span className="font-semibold text-foreground">{set.targetReps}</span>
																	<span className="text-muted-foreground ml-1">reps</span>
																</div>
															)}

															{set.targetWeight !== null && set.targetWeight !== undefined && set.targetWeight > 0 && (
																<div>
																	<span className="font-semibold text-foreground">{set.targetWeight}</span>
																	<span className="text-muted-foreground ml-1">kg</span>
																</div>
															)}

															{set.targetDurationSeconds !== null && set.targetDurationSeconds !== undefined && set.targetDurationSeconds > 0 && (
																<div>
																	<span className="font-semibold text-foreground">{set.targetDurationSeconds}</span>
																	<span className="text-muted-foreground ml-1">seg</span>
																</div>
															)}

															{set.targetRestSeconds !== null && set.targetRestSeconds !== undefined && set.targetRestSeconds > 0 && (
																<div>
																	<span className="font-semibold text-foreground">{set.targetRestSeconds}</span>
																	<span className="text-muted-foreground ml-1">desc</span>
																</div>
															)}
														</div>
													</div>
												))}
											</div>
										) : (templateExercise.suggestedSets || templateExercise.suggestedReps) ? (
											<div className="space-y-2">
												{Array.from({ length: templateExercise.suggestedSets || 1 }).map((_, i) => (
													<div
														key={i}
														className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg"
													>
														<span className="text-xs font-barlow font-bold uppercase text-muted-foreground tracking-wide min-w-[60px]">
															Serie {i + 1}
														</span>

														<div className="flex items-center gap-4 flex-wrap text-sm font-barlow">
															{templateExercise.suggestedReps && (
																<div>
																	<span className="font-semibold text-foreground">{templateExercise.suggestedReps}</span>
																	<span className="text-muted-foreground ml-1">reps</span>
																</div>
															)}
														</div>
													</div>
												))}
											</div>
										) : null}

										{/* Notas */}
										{templateExercise.notes && (
											<p className="text-sm text-muted-foreground font-barlow">
												{templateExercise.notes}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Acciones */}
			<div className="flex gap-3 pt-4">
				<Button
					onClick={handleStartSession}
					size="lg"
					className="uppercase font-barlow font-semibold tracking-wide"
				>
					<Play className="h-5 w-5 mr-2" />
					Iniciar Sesión
				</Button>

				<Button
					onClick={handleEdit}
					size="lg"
					variant="outline"
					className="uppercase font-barlow font-semibold tracking-wide"
				>
					<Pencil className="h-5 w-5 mr-2" />
					Editar
				</Button>

				<Button
					onClick={handleDuplicate}
					size="lg"
					variant="outline"
					className="uppercase font-barlow font-semibold tracking-wide"
				>
					<Copy className="h-5 w-5 mr-2" />
					Duplicar
				</Button>

				<Button
					onClick={() => setShowDeleteModal(true)}
					size="lg"
					variant="outline"
					className="uppercase font-barlow font-semibold tracking-wide text-destructive/70 hover:text-destructive border-destructive/30 hover:border-destructive/60 ml-auto"
				>
					<Trash2 className="h-5 w-5 mr-2" />
					Eliminar
				</Button>
			</div>
		</div>

		{/* Modal de confirmacion de eliminacion */}
		<Dialog
			open={showDeleteModal}
			onOpenChange={(open) => { if (!open) setShowDeleteModal(false); }}
		>
			<DialogContent showCloseButton={false} className="rounded-none">
				<DialogHeader>
					<DialogTitle className="font-bebas tracking-[2px] text-xl uppercase">
						Eliminar plantilla
					</DialogTitle>
					<DialogDescription className="font-barlow">
						Esta accion no se puede deshacer. Se eliminara la plantilla{' '}
						<span className="font-semibold text-foreground">
							{template.name}
						</span>{' '}
						permanentemente.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="ghost"
						onClick={() => setShowDeleteModal(false)}
						disabled={deleteTemplateMutation.isPending}
						className="uppercase font-barlow font-semibold tracking-[3px] rounded-none"
					>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirmDelete}
						disabled={deleteTemplateMutation.isPending}
						className="uppercase font-barlow font-semibold tracking-[3px] rounded-none"
					>
						{deleteTemplateMutation.isPending ? 'Eliminando...' : 'Eliminar'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		</>
	);
}
