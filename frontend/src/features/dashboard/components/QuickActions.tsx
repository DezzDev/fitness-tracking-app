import { Link } from 'react-router-dom';
import {
  Dumbbell,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  accentClass: string;
  bgClass: string;
}

const actions: QuickAction[] = [
  {
    label: 'Iniciar Entrenamiento',
    description: 'Comienza una nueva sesion',
    icon: <Plus className="w-5 h-5" />,
    to: '/workouts/sessions/start',
    accentClass: 'text-blue-600',
    bgClass: 'bg-blue-600',
  },
  {
    label: 'Plantillas',
    description: 'Gestiona tus rutinas',
    icon: <FileText className="w-5 h-5" />,
    to: '/workouts',
    accentClass: 'text-emerald-600',
    bgClass: 'bg-emerald-600',
  },
  {
    label: 'Ejercicios',
    description: 'Explora el catalogo',
    icon: <Dumbbell className="w-5 h-5" />,
    to: '/exercises',
    accentClass: 'text-orange-600',
    bgClass: 'bg-orange-600',
  },
  {
    label: 'Progreso',
    description: 'Revisa tus estadisticas',
    icon: <TrendingUp className="w-5 h-5" />,
    to: '/profile',
    accentClass: 'text-violet-600',
    bgClass: 'bg-violet-600',
  },
];

export default function QuickActions() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.to + action.label} to={action.to}>
          <Card
            className={cn(
              'group cursor-pointer transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5',
              'active:scale-[0.98]'
            )}
          >
            <CardContent className="flex flex-col gap-3 py-4">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg text-white',
                  'transition-transform duration-200 group-hover:scale-110',
                  action.bgClass
                )}
              >
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
              <ArrowRight
                className={cn(
                  'w-4 h-4 text-muted-foreground/50',
                  'transition-all duration-200',
                  'group-hover:translate-x-1 group-hover:text-foreground'
                )}
              />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
