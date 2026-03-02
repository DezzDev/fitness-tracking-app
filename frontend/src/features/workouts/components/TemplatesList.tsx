// src/features/workouts/components/TemplatesList.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Play, Copy, Pencil, Trash2, MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkoutTemplates, useDeleteTemplate, useDuplicateTemplate } from '../hooks/useWorkoutTemplates';

export default function TemplatesList() {
	const [ searchTerm, setSearchTerm ] = useState('');
	const { data, isLoading } = useWorkoutTemplates({ searchTerm, limit: 50 });
	const { mutate: deleteTemplate } = useDeleteTemplate();
	const { mutate: duplicateTemplate } = useDuplicateTemplate();

	const templates = data?.data.items || [];

	return (
		<div className="space-y-6">
			{/* Búsqueda */}
			<Card className="p-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar plantillas..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</Card>

			{/* Lista */}
			{isLoading ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[ ...Array(6) ].map((_, i) => (
						<Card key={i} className="p-6 space-y-3">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-20 w-full" />
						</Card>
					))}
				</div>
			) : templates.length === 0 ? (
				<Card className="p-12 text-center">
					<div className="max-w-sm mx-auto space-y-4">
					<div className="w-16 h-16 bg-[var(--surface-elevated)] rounded-full flex items-center justify-center mx-auto">
						<Plus className="h-8 w-8 text-muted-foreground" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">
							No hay plantillas
						</h3>
						<p className="text-muted-foreground mt-1">
								Crea tu primera plantilla de entrenamiento
							</p>
						</div>
						<Link to="/workouts/templates/new">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Crear Plantilla
							</Button>
						</Link>
					</div>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{templates.map((template) => (
						<Card key={template.id} className="hover:shadow-lg transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-lg line-clamp-1">
											{template.name}
										</CardTitle>
										{template.description && (
											<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
												{template.description}
											</p>
										)}
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link
													to={`/workouts/sessions/start?templateId=${template.id}`}
													className="flex items-center cursor-pointer"
												>
													<Play className="mr-2 h-4 w-4" />
													Iniciar entrenamiento
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link
													to={`/workouts/templates/${template.id}/edit`}
													className="flex items-center cursor-pointer"
												>
													<Pencil className="mr-2 h-4 w-4" />
													Editar
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => duplicateTemplate(template.id)}
											>
												<Copy className="mr-2 h-4 w-4" />
												Duplicar
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => deleteTemplate(template.id)}
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
								<div className="flex items-center justify-between">
									<Badge variant="secondary">
										{template.exercises?.length || 0} ejercicio
										{template.exercises?.length !== 1 ? 's' : ''}
									</Badge>

									<Link to={`/workouts/sessions/start?templateId=${template.id}`}>
										<Button size="sm" variant="outline">
											<Play className="mr-2 h-4 w-4" />
											Usar
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}