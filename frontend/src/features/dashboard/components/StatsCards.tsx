import { Dumbbell, Flame, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { WorkoutStats } from '@/types';

interface StatsCardsProps {
  stats: WorkoutStats | undefined;
  isLoading: boolean;
}

interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentClass: string;
  bgClass: string;
}

function StatItem({ label, value, icon, accentClass, bgClass }: StatItemProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
            'transition-transform duration-300 group-hover:scale-110',
            bgClass
          )}
        >
          <span className={accentClass}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 py-4">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-14" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) return <StatsCardsSkeleton />;

  const items: StatItemProps[] = [
    {
      label: 'Total Workouts',
      value: stats?.totalWorkouts ?? 0,
      icon: <Dumbbell className="w-5 h-5" />,
      accentClass: 'text-blue-600',
      bgClass: 'bg-blue-100',
    },
    {
      label: 'Ejercicios Realizados',
      value: stats?.totalExercises ?? 0,
      icon: <Flame className="w-5 h-5" />,
      accentClass: 'text-orange-600',
      bgClass: 'bg-orange-100',
    },
    {
      label: 'Promedio por Workout',
      value: stats?.averageExercisesPerWorkout
        ? stats.averageExercisesPerWorkout.toFixed(1)
        : '0',
      icon: <Target className="w-5 h-5" />,
      accentClass: 'text-emerald-600',
      bgClass: 'bg-emerald-100',
    },
    {
      label: 'Racha Activa',
      value: stats?.totalWorkouts ? `${Math.min(stats.totalWorkouts, 7)}d` : '0d',
      icon: <TrendingUp className="w-5 h-5" />,
      accentClass: 'text-violet-600',
      bgClass: 'bg-violet-100',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatItem key={item.label} {...item} />
      ))}
    </div>
  );
}
