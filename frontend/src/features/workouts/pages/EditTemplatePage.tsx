// src/features/workouts/pages/EditTemplatePage.tsx
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import TemplateForm from '../components/TemplateForm';
import { useWorkoutTemplate, useUpdateTemplate } from '../hooks/useWorkoutTemplates';
import type { CreateTemplateFormData } from '../schemas/templateSchema';
import type { CreateWorkoutTemplateData } from '@/types';

export default function EditTemplatePage() {
	const { id: templateId } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: template, isLoading, isError } = useWorkoutTemplate(templateId!);
	const { mutate: updateTemplate, isPending } = useUpdateTemplate();

	// Map fetched WorkoutTemplate -> CreateTemplateFormData for the form
	const initialData = useMemo<CreateTemplateFormData | undefined>(() => {
		if (!template) return undefined;

		return {
			name: template.name,
			description: template.description ?? '',
			scheduledDayOfWeek: template.scheduledDayOfWeek ?? undefined,
			exercises: (template.exercises ?? []).map((ex) => ({
				exerciseId: ex.exerciseId,
				orderIndex: ex.orderIndex,
				suggestedSets: ex.suggestedSets,
				suggestedReps: ex.suggestedReps,
				notes: ex.notes,
				sets: ex.sets?.map((s) => ({
					setNumber: s.setNumber,
					targetReps: s.targetReps ?? undefined,
					targetWeight: s.targetWeight ?? undefined,
					targetDurationSeconds: s.targetDurationSeconds ?? undefined,
					targetRestSeconds: s.targetRestSeconds ?? undefined,
				})),
			})),
		};
	}, [template]);

	const handleSubmit = (data: CreateTemplateFormData) => {
		if (!templateId) return;

		const payload: CreateWorkoutTemplateData = {
			name: data.name,
			description: data.description,
			scheduledDayOfWeek: data.scheduledDayOfWeek,
			exercises: data.exercises.map((ex) => ({
				exerciseId: ex.exerciseId,
				orderIndex: ex.orderIndex,
				sets: ex.sets?.map((s, i) => ({
					setNumber: s.setNumber ?? i + 1,
					targetReps: s.targetReps,
					targetWeight: s.targetWeight,
					targetDurationSeconds: s.targetDurationSeconds,
					targetRestSeconds: s.targetRestSeconds,
				})),
			})),
		};

		updateTemplate(
			{ id: templateId, data: payload },
			{
				onSuccess: () => {
					navigate(`/workouts/templates/${templateId}`);
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6 w-full">
				<Skeleton className="h-10 w-3/4" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (isError || !template) {
		return (
			<div className="max-w-4xl mx-auto w-full">
				<Card className="p-12 text-center">
					<p className="text-muted-foreground mb-4">Plantilla no encontrada</p>
					<Button onClick={() => navigate('/workouts?tab=templates')}>
						Volver a plantillas
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6 w-full">
			{/* Back Button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate(-1)}
				className="font-barlow uppercase tracking-[2px] text-xs"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Volver
			</Button>

			{/* Header */}
			<div>
				<h1 className="text-4xl font-bebas tracking-[2px] uppercase text-foreground">
					Editar Plantilla
				</h1>
				<p className="text-muted-foreground mt-2 font-barlow">
					{template.name}
				</p>
			</div>

			{/* Form */}
			<TemplateForm
				initialData={initialData}
				onSubmit={handleSubmit}
				isSubmitting={isPending}
				submitLabel="Guardar Cambios"
			/>
		</div>
	);
}
