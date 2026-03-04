// src/features/workouts/components/TemplatesList.tsx
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Copy, Pencil, Star, Dumbbell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
	useWorkoutTemplates, 
	useToggleFavorite, 
	useDuplicateTemplate 
} from '../hooks/useWorkoutTemplates';
import type { WorkoutTemplate } from '@/types';

export default function TemplatesList() {
	const navigate = useNavigate();
	const { data, isLoading } = useWorkoutTemplates({ limit: 100 });
	const { mutate: toggleFavorite } = useToggleFavorite();
	const { mutate: duplicateTemplate } = useDuplicateTemplate();

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
	}, [templates]);

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
							<h3 className="font-bebas tracking-wide text-xl text-foreground group-hover:text-primary transition-colors">
								{template.name}
							</h3>
						</Link>

						<button
							onClick={(e) => handleToggleFavorite(e, template.id)}
							className="shrink-0 p-1 hover:scale-110 transition-transform"
							aria-label="Marcar como favorito"
						>
							<Star 
								className={`h-5 w-5 ${
									template.isFavorite 
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
									className="font-barlow text-xs uppercase tracking-wide"
								>
									{ex.exercise?.name || 'Ejercicio'}
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
					<div className="flex gap-2 pt-2">
						<Button
							onClick={() => handleStartSession(template.id)}
							size="sm"
							className="flex-1 uppercase font-barlow font-semibold tracking-wide text-xs"
						>
							<Play className="h-4 w-4 mr-1.5" />
							Iniciar
						</Button>

						<Button
							onClick={() => handleEdit(template.id)}
							size="sm"
							variant="ghost"
							className="uppercase font-barlow font-semibold tracking-wide text-xs"
						>
							<Pencil className="h-4 w-4 mr-1.5" />
							Editar
						</Button>

						<Button
							onClick={() => handleDuplicate(template.id)}
							size="sm"
							variant="ghost"
							className="uppercase font-barlow font-semibold tracking-wide text-xs"
						>
							<Copy className="h-4 w-4 mr-1.5" />
							Duplicar
						</Button>
					</div>
				</div>
			</Card>
		);
	};

	return (
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
							<div className="flex items-center gap-3">
								<h2 className="text-sm font-bebas tracking-widest text-muted-foreground uppercase">
									Favoritas
								</h2>
								<div className="flex-1 h-px bg-border" />
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								{favorites.map(renderTemplate)}
							</div>
						</div>
					)}

					{/* Sección TODAS */}
					{nonFavorites.length > 0 && (
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<h2 className="text-sm font-bebas tracking-widest text-muted-foreground uppercase">
									Todas
								</h2>
								<div className="flex-1 h-px bg-border" />
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								{nonFavorites.map(renderTemplate)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}