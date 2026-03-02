// src/features/workouts/pages/WorkoutsMainPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell, Clock, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplatesList from '../components/TemplatesList';
import SessionsList from '../components/SessionsList';

export default function WorkoutsMainPage() {
	const [ activeTab, setActiveTab ] = useState<'templates' | 'sessions'>('templates');

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
				<h1 className="text-3xl font-bold text-foreground font-bebas tracking-wide">Entrenamientos</h1>
					<p className="text-muted-foreground mt-1">
						Crea plantillas y registra tus sesiones
					</p>
				</div>

				<div className="flex gap-2">
					{activeTab === 'templates' ? (
						<Link to="/workouts/templates/new">
							<Button size="lg">
								<Plus className="mr-2 h-5 w-5" />
								Nueva Plantilla
							</Button>
						</Link>
					) : (
						<Link to="/workouts/sessions/start">
							<Button size="lg">
								<Dumbbell className="mr-2 h-5 w-5" />
								Iniciar Entrenamiento
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
				<TabsList className="grid w-full grid-cols-2 max-w-md">
					<TabsTrigger value="templates" className="flex items-center gap-2">
						<FileText size={18} />
						<span>Plantillas</span>
					</TabsTrigger>
					<TabsTrigger value="sessions" className="flex items-center gap-2">
						<Clock size={18} />
						<span>Historial</span>
					</TabsTrigger>
				</TabsList>

				{/* Tab: Plantillas */}
				<TabsContent value="templates" className="space-y-6 mt-6">
					<TemplatesList />
				</TabsContent>

				{/* Tab: Sesiones (Historial) */}
				<TabsContent value="sessions" className="space-y-6 mt-6">
					<SessionsList />
				</TabsContent>
			</Tabs>
		</div>
	);
}