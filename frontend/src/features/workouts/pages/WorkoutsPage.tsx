// src/features/workouts/pages/WorkoutsPage.tsx
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplatesList from '../components/TemplatesList';
import SessionsList from '../components/SessionsList';

export default function WorkoutsPage() {
	const [ searchParams, setSearchParams ] = useSearchParams();

	const activeTab = (searchParams.get('tab') === 'sessions') ? 'sessions' : 'workouts';

	const setActiveTab = (tab: string) => {
		setSearchParams(tab === 'sessions' ? {tab} : {}, { replace: true });
	};

	return (
		<div className="space-y-6 w-full">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bebas tracking-[2px] uppercase text-foreground">
					Workouts
				</h1>
			</div>

			{/* Tabs */}

			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as string)}>
				<TabsList className="w-full max-w-md bg-muted/20 p-1 h-auto">

					<TabsTrigger
						value="workouts"
						className="flex-1 uppercase font-barlow font-semibold tracking-[3px] text-sm rounded-none"
					>
						Workouts
					</TabsTrigger>

					<TabsTrigger
						value="sessions"
						className="flex-1 uppercase font-barlow font-semibold tracking-[3px] text-sm rounded-none focus:border-b-primary "
					>
						History
					</TabsTrigger>

				</TabsList>

				{/* Tab: WORKOUTS */}
				<TabsContent value="workouts" className="my-6 space-y-6">
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

				{/* Tab: SESIONES */}
				<TabsContent value="sessions" className="my-6 space-y-6">
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
			</Tabs>


		</div>
	);
}