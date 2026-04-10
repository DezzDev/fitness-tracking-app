// src/features/workouts/components/TemplatesList.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Dumbbell, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	useWorkoutTemplates,
	useToggleFavorite,
	useDuplicateTemplate,
	useDeleteTemplate
} from '../hooks/useWorkoutTemplates';
import type { WorkoutTemplate } from '@/types';
import { Separator } from '@/components/ui/separator';

export default function TemplatesList() {
	const navigate = useNavigate();
	const { data, isLoading } = useWorkoutTemplates({ limit: 100 });
	const { mutate: toggleFavorite } = useToggleFavorite();
	const { mutate: duplicateTemplate } = useDuplicateTemplate();
	const deleteTemplateMutation = useDeleteTemplate();

	// ID of the template whose delete confirmation is currently open (null = none)
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const templates = data?.data.items || [];

	// Separar favoritas y todas
	const { favorites, nonFavorites } = useMemo(() => {
		const favs: WorkoutTemplate[] = [];
		const nonFavs: WorkoutTemplate[] = [];

		templates.forEach((template) => {
			if (template.isFavorite) {
				favs.push(template);
			} else {
				nonFavs.push(template);
			}
		});

		return { favorites: favs, nonFavorites: nonFavs };
	}, [ templates ]);

	const handleStartSession = (templateId: string) => {
		navigate(`/workouts/sessions/start?templateId=${templateId}`);
	};

	const handleEdit = (templateId: string) => {
		navigate(`/workouts/templates/${templateId}/edit`);
	};

	const handleDuplicate = (templateId: string) => {
		duplicateTemplate(templateId);
	};

	const handleToggleFavorite = (e: React.MouseEvent, templateId: string) => {
		e.preventDefault();
		e.stopPropagation();
		toggleFavorite(templateId);
	};

	const handleDeleteClick = (templateId: string) => {
		setDeletingId(templateId);
	};

	const handleConfirmDelete = (templateId: string) => {
		deleteTemplateMutation.mutate(templateId, {
			onSettled: () => setDeletingId(null),
		});
	};

	const handleCancelDelete = () => {
		setDeletingId(null);
	};

	const deletingTemplateName = useMemo(() => {
		if (!deletingId) return '';
		return templates.find((t) => t.id === deletingId)?.name ?? '';
	}, [deletingId, templates]);

	const renderTemplate = (template: WorkoutTemplate) => {
		const exerciseCount = template.exercises?.length || 0;
		const firstThreeExercises = template.exercises?.slice(0, 3) || [];
		const remainingCount = exerciseCount > 3 ? exerciseCount - 3 : 0;

		return (
			<Card
				key={template.id}
				className="hover:shadow-md transition-all duration-200 hover:border-primary/50 rounded-none border-border
				"
			>
				<div className="px-4 space-y-4">
					{/* Header con nombre y favorito */}
					<div className="flex items-start justify-between gap-3">
						<Link
							to={`/workouts/templates/${template.id}`}
							className="flex-1 min-w-0 group"
						>
							<h3 className="font-bebas tracking-[2px] text-xl text-foreground group-hover:text-primary transition-colors">
								{template.name}
							</h3>
						</Link>

						<button
							onClick={(e) => handleToggleFavorite(e, template.id)}
							className="shrink-0 p-1 hover:scale-110 transition-transform"
							aria-label="Marcar como favorito"
						>
							<Star
								className={`h-5 w-5 ${template.isFavorite
										? 'fill-primary text-primary'
										: 'text-muted-foreground'
									}`}
							/>
						</button>
					</div>

					{/* Pills de ejercicios */}
					{exerciseCount > 0 && (
						<div className="flex flex-wrap gap-2">
							{firstThreeExercises.map((ex) => (
								<Badge
									key={ex.id}
									variant="secondary"
									className="font-barlow text-xs uppercase tracking-[2px] rounded-none"
								>
									{ex.exerciseName || 'Ejercicio'}
								</Badge>
							))}
							{remainingCount > 0 && (
								<Badge
									variant="outline"
									className="font-barlow text-xs font-semibold"
								>
									+{remainingCount}
								</Badge>
							)}
						</div>
					)}

					{/* Acciones */}
					<div className="flex justify-between text-2xl flex-wrap align-middle">
            <div >
              <Button
                onClick={() => handleStartSession(template.id)}
                size="sm"
                variant="ghost"
                className="uppercase font-barlow font-semibold tracking-[3px] text-primary px-2"
              >
                Iniciar
              </Button>

              <Button
                onClick={() => handleEdit(template.id)}
                size="sm"
                variant="ghost"
                className="uppercase font-barlow font-semibold tracking-[3px] px-2"
              >
                Editar
              </Button>

              <Button
                onClick={() => handleDuplicate(template.id)}
                size="sm"
                variant="ghost"
                className="uppercase font-barlow font-semibold tracking-[3px] px-2"
              >
                Duplicar
              </Button>

            </div>

						<Button
							onClick={() => handleDeleteClick(template.id)}
							size="sm"
							variant="ghost"
							className="uppercase font-barlow font-semibold tracking-[3px] text-destructive/70 hover:text-destructive px-2"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</Card>
		);
	};

	return (
		<>
		<div className="space-y-8">
			{/* Loading */}
			{isLoading ? (
				<div className="space-y-6">
					{[ ...Array(4) ].map((_, i) => (
						<div key={i}>
							<Skeleton className="h-32 w-full" />
						</div>
					))}
				</div>
			) : templates.length === 0 ? (
				/* Empty state */
				<Card className="border-2 border-dashed border-border bg-muted/5">
					<div className="p-12 text-center max-w-sm mx-auto space-y-4">
						<div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
							<Dumbbell className="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<h3 className="text-lg font-bebas tracking-wide uppercase text-foreground">
								No hay plantillas
							</h3>
							<p className="text-muted-foreground mt-1 text-sm font-barlow">
								Crea tu primera plantilla de entrenamiento
							</p>
						</div>
					</div>
				</Card>
			) : (
				<>
					{/* Sección FAVORITAS */}
					{favorites.length > 0 && (
						<div className="space-y-4">

							<h3 className="text-sm font-bebas tracking-[3px] text-muted-foreground uppercase mb-2">
								Favoritas
							</h3>

							<Separator className="mb-4"/>

							<div className="grid gap-4 sm:grid-cols-2">
								{favorites.map(renderTemplate)}
							</div>

						</div>
					)}

					{/* Sección TODAS */}
					{nonFavorites.length > 0 && (
						<div className="space-y-4">

							<h2 className="text-sm font-bebas tracking-widest text-muted-foreground uppercase">
								Todas
							</h2>
							<Separator />

							<div className="grid gap-4 sm:grid-cols-2">
								{nonFavorites.map(renderTemplate)}
							</div>
						</div>
					)}
				</>
			)}
		</div>

			{/* Modal de confirmacion de eliminacion */}
			<Dialog
				open={deletingId !== null}
				onOpenChange={(open) => { if (!open) handleCancelDelete(); }}
			>
				<DialogContent showCloseButton={false} className="rounded-none">
					<DialogHeader>
						<DialogTitle className="font-bebas tracking-[2px] text-xl uppercase">
							Eliminar plantilla
						</DialogTitle>
						<DialogDescription className="font-barlow">
							Esta accion no se puede deshacer. Se eliminara la plantilla{' '}
							<span className="font-semibold text-foreground">
								{deletingTemplateName}
							</span>{' '}
							permanentemente.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="ghost"
							onClick={handleCancelDelete}
							disabled={deleteTemplateMutation.isPending}
							className="uppercase font-barlow font-semibold tracking-[3px] rounded-none"
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={() => deletingId && handleConfirmDelete(deletingId)}
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