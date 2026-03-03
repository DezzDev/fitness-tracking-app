import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Play, Layers } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { WorkoutTemplate } from '@/types';

interface TemplatesOverviewProps {
  templates: WorkoutTemplate[] | undefined;
  isLoading: boolean;
}

function TemplateRow({ template }: { template: WorkoutTemplate }) {
  const exerciseCount = template.exercises?.length ?? 0;

  return (
    <div className="flex items-center gap-4 py-3 group">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 shrink-0">
        <Layers className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{template.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
        </p>
      </div>
      <Link to="/workouts/sessions/start">
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}

function TemplatesOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TemplatesOverview({
  templates,
  isLoading,
}: TemplatesOverviewProps) {
  if (isLoading) return <TemplatesOverviewSkeleton />;

  const displayTemplates = templates?.slice(0, 4) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          Mis Plantillas
        </CardTitle>
        <CardAction>
          <Link to="/workouts">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Ver todo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {displayTemplates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              No tienes plantillas creadas.
            </p>
            <Link to="/workouts/templates/new">
              <Button variant="outline" size="sm" className="mt-3">
                Crear Plantilla
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {displayTemplates.map((template, index) => (
              <div key={template.id}>
                <TemplateRow template={template} />
                {index < displayTemplates.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
