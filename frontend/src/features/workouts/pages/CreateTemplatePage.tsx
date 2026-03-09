// src/features/workouts/pages/CreateTemplatePage.tsx
import { useNavigate } from 'react-router-dom';
import { useCreateTemplate } from '../hooks/useWorkoutTemplates';
import type { CreateTemplateFormData } from '../schemas/templateSchema';
import type { CreateWorkoutTemplateData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TemplateForm from '../components/TemplateForm';

export default function CreateTemplatePage() {

	const navigate = useNavigate();
	const { mutate: createTemplate, isPending } = useCreateTemplate();

	const handleSubmit = (data: CreateTemplateFormData) => {
		const templateData: CreateWorkoutTemplateData = {
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

		createTemplate(templateData, {
			onSuccess: () => {
				navigate('/workouts?tab=templates');
			},
		});
	};

	return (
		<div className='max-w-4xl mx-auto space-y-6 w-full'>
			{/* Back Button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate('/workouts?tab=templates')}
				className="font-barlow uppercase  tracking-[2px] text-xs"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Plantillas
			</Button>

			{/* Header */}
			<div>
				<h1 className="text-4xl font-bebas tracking-[2px] uppercase text-foreground">
					Nueva Plantilla
				</h1>
				<p className='text-muted-foreground mt-2 font-barlow'>
					Crea una plantilla de entrenamiento con ejercicios y series objetivo.
				</p>
			</div>

			{/* Formulario */}
			<TemplateForm
				onSubmit={handleSubmit}
				isSubmitting={isPending}
				submitLabel='Crear Plantilla'
			/>

		</div>
	);
}
