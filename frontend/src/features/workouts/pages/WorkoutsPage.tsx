// src/features/workouts/pages/WorkoutsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplatesList from '../components/TemplatesList';
import SessionsList from '../components/SessionsList';

export default function WorkoutsPage() {
	const [ activeTab, setActiveTab ] = useState<'sessions' | 'templates'>('sessions');

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bebas tracking-[2px] uppercase text-foreground">
					Workouts
				</h1>
			</div>

			{/* Tabs */}
			
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
					<TabsList className="w-full max-w-md bg-muted/20 p-1 h-auto">
						<TabsTrigger
							value="sessions"
						className="flex-1 uppercase font-barlow font-semibold tracking-[3px] text-sm rounded-none focus:border-b-primary "
						>
							Sesiones
						</TabsTrigger>
						<TabsTrigger
							value="templates"
							className="flex-1 uppercase font-barlow font-semibold tracking-[3px] text-sm rounded-none"
						>
							Plantillas
						</TabsTrigger>
					</TabsList>

					{/* Tab: SESIONES */}
					<TabsContent value="sessions" className="mt-6 space-y-6">
						<SessionsList />

						{/* Bottom CTA */}
						<div className="flex justify-center pt-4">
							<Link to="/workouts/sessions/start">
								<Button
									size="lg"
									className="w-full sm:w-auto uppercase font-barlow font-semibold tracking-wide"
								>
									<Plus className="mr-2 h-5 w-5" />
									Nueva Sesión
								</Button>
							</Link>
						</div>
					</TabsContent>

					{/* Tab: PLANTILLAS */}
					<TabsContent value="templates" className="mt-6 space-y-6">
						<TemplatesList />

						{/* Bottom CTA */}
						<div className="flex justify-center pt-4">
							<Link to="/workouts/templates/new">
								<Button
									size="lg"
									className="w-full sm:w-auto uppercase font-barlow font-semibold tracking-wide"
								>
									<Plus className="mr-2 h-5 w-5" />
									Nueva Plantilla
								</Button>
							</Link>
						</div>
					</TabsContent>
				</Tabs>

			
		</div>
	);
}