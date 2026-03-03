import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ChevronRight, Calendar, Dumbbell } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { WorkoutSession } from '@/types';

interface RecentSessionsProps {
  sessions: WorkoutSession[] | undefined;
  isLoading: boolean;
}

function SessionRow({ session }: { session: WorkoutSession }) {
  const sessionDate = new Date(session.sessionDate);
  const exerciseCount = session.exercises?.length ?? 0;
  const totalSets = session.exercises?.reduce(
    (acc, ex) => acc + (ex.sets?.length ?? 0),
    0
  ) ?? 0;

  return (
    <div className="flex items-center gap-4 py-3 group">
      {/* Date pill */}
      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-muted shrink-0 text-center">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {format(sessionDate, 'EEE', { locale: es })}
        </span>
        <span className="text-lg font-bold leading-none">
          {format(sessionDate, 'd')}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{session.title}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5" />
            {exerciseCount} ejercicios
          </span>
          {session.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {session.duration} min
            </span>
          )}
        </div>
      </div>

      {/* Sets badge */}
      <Badge variant="secondary" className="shrink-0">
        {totalSets} sets
      </Badge>
    </div>
  );
}

function RecentSessionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function RecentSessions({
  sessions,
  isLoading,
}: RecentSessionsProps) {
  if (isLoading) return <RecentSessionsSkeleton />;

  const recentSessions = sessions?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          Sesiones Recientes
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
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              No hay sesiones registradas aun.
            </p>
            <Link to="/workouts/sessions/start">
              <Button variant="outline" size="sm" className="mt-3">
                Iniciar Entrenamiento
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {recentSessions.map((session, index) => (
              <div key={session.id}>
                <SessionRow session={session} />
                {index < recentSessions.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
