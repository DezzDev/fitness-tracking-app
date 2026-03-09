// src/features/workouts/pages/TemplateDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Play, Pencil, Copy, TrendingUp, Clock, Dumbbell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
	useWorkoutTemplate, 
	useToggleFavorite, 
	useDuplicateTemplate 
} from '../hooks/useWorkoutTemplates';

export default function TemplateDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const templateId = id!;

	const { data: response, isLoading, isError } = useWorkoutTemplate(templateId);
	const { mutate: toggleFavorite } = useToggleFavorite();
	const { mutate: duplicateTemplate } = useDuplicateTemplate();

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

	const exerciseCount = template.exercises?.length || 0;

	return (
		<div className="max-w-4xl mx-auto space-y-6 w-full">
			{/* Back Button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate('/workouts?tab=templates')}
				className="font-barlow uppercase tracking-wide text-xs"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Plantillas
			</Button>

			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-3">
						{/* Tag */}
						<Badge 
							variant="outline" 
							className="font-barlow uppercase tracking-wide text-xs"
						>
							Plantilla
						</Badge>

						{/* Nombre */}
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
					</div>
				</div>

				{/* Stats */}
				<Card className="bg-muted/10 w-full">
					<div className="p-4 grid grid-cols-3 gap-4">
						{/* Usos */}
						<div className="text-center space-y-1">
							<div className="flex items-center justify-center gap-2">
								<TrendingUp className="h-4 w-4 text-primary" />
								<span className="text-2xl font-bebas text-foreground">
									{template.usageCount || 0}
								</span>
							</div>
							<p className="text-xs text-muted-foreground uppercase font-barlow tracking-wide">
								Usos
							</p>
						</div>

						{/* Duración promedio (placeholder - necesitaríamos datos del backend) */}
						<div className="text-center space-y-1">
							<div className="flex items-center justify-center gap-2">
								<Clock className="h-4 w-4 text-primary" />
								<span className="text-2xl font-bebas text-foreground">
									--
								</span>
							</div>
							<p className="text-xs text-muted-foreground uppercase font-barlow tracking-wide">
								Min promedio
							</p>
						</div>

						{/* Volumen promedio (placeholder - necesitaríamos datos del backend) */}
						<div className="text-center space-y-1">
							<div className="flex items-center justify-center gap-2">
								<Dumbbell className="h-4 w-4 text-primary" />
								<span className="text-2xl font-bebas text-foreground">
									--
								</span>
							</div>
							<p className="text-xs text-muted-foreground uppercase font-barlow tracking-wide">
								Kg promedio
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* ESTRUCTURA - Lista de ejercicios */}
			<Card className="w-full">
				<div className="p-6 space-y-6">
					<h2 className="text-lg font-bebas tracking-widest uppercase text-foreground">
						Estructura
					</h2>

					{exerciseCount === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p className="font-barlow">No hay ejercicios en esta plantilla</p>
						</div>
					) : (
						<div className="space-y-4">
							{template.exercises?.map((templateExercise: any, index: number) => (
								<div key={templateExercise.id}>
									{index > 0 && <Separator className="my-4" />}
									
									<div className="space-y-3">
										{/* Ejercicio info */}
										<div className="flex items-start gap-3">
											<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
												<span className="text-sm font-bebas text-primary">
													{index + 1}
												</span>
											</div>

											<div className="flex-1 min-w-0 space-y-1">
												<h3 className="font-bebas tracking-wide text-lg text-foreground">
													{templateExercise.exercise?.name || 'Ejercicio'}
												</h3>
												
												{templateExercise.exercise?.muscleGroup && (
													<Badge 
														variant="secondary" 
														className="font-barlow uppercase text-xs tracking-wide"
													>
														{templateExercise.exercise.muscleGroup}
													</Badge>
												)}
											</div>
										</div>

										{/* Sets sugeridos */}
										{(templateExercise.suggestedSets || templateExercise.suggestedReps) && (
											<div className="ml-11 space-y-1">
												<p className="text-xs text-muted-foreground uppercase font-barlow tracking-wide">
													Sugerido
												</p>
												<p className="text-sm font-barlow text-foreground">
													{templateExercise.suggestedSets && `${templateExercise.suggestedSets} series`}
													{templateExercise.suggestedSets && templateExercise.suggestedReps && ' × '}
													{templateExercise.suggestedReps && `${templateExercise.suggestedReps} reps`}
												</p>
											</div>
										)}

										{/* Notas */}
										{templateExercise.notes && (
											<div className="ml-11">
												<p className="text-sm text-muted-foreground font-barlow">
													{templateExercise.notes}
												</p>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</Card>

			{/* Acciones */}
			<div className="flex flex-col sm:flex-row gap-3 pt-4">
				<Button
					onClick={handleStartSession}
					size="lg"
					className="flex-1 uppercase font-barlow font-semibold tracking-wide"
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
			</div>
		</div>
	);
}
