import { useMemo } from 'react';
import {
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
import type { WorkoutSession } from '@/types';

interface WeeklyActivityProps {
  sessions: WorkoutSession[] | undefined;
  isLoading: boolean;
}

function WeeklyActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WeeklyActivity({
  sessions,
  isLoading,
}: WeeklyActivityProps) {
  const weekDays = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, []);

  const sessionsByDay = useMemo(() => {
    if (!sessions) return new Map<string, number>();

    const map = new Map<string, number>();
    for (const session of sessions) {
      const date = new Date(session.sessionDate);
      for (const day of weekDays) {
        if (isSameDay(date, day)) {
          const key = format(day, 'yyyy-MM-dd');
          map.set(key, (map.get(key) ?? 0) + 1);
          break;
        }
      }
    }
    return map;
  }, [sessions, weekDays]);

  const maxSessions = Math.max(1, ...Array.from(sessionsByDay.values()));

  if (isLoading) return <WeeklyActivitySkeleton />;

  const today = new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          Actividad Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const count = sessionsByDay.get(key) ?? 0;
            const heightPercent = count > 0 ? (count / maxSessions) * 100 : 8;
            const isToday = isSameDay(day, today);

            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'text-xs font-medium uppercase',
                    isToday ? 'text-blue-600' : 'text-muted-foreground'
                  )}
                >
                  {format(day, 'EEE', { locale: es }).slice(0, 3)}
                </span>

                {/* Bar container */}
                <div className="relative w-full h-20 flex items-end justify-center">
                  <div
                    className={cn(
                      'w-full max-w-8 rounded-lg transition-all duration-500 ease-out',
                      count > 0
                        ? 'bg-blue-500'
                        : isToday
                          ? 'bg-blue-200'
                          : 'bg-muted'
                    )}
                    style={{ height: `${heightPercent}%`, minHeight: '6px' }}
                  />
                </div>

                {/* Count */}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    count > 0 ? 'text-foreground' : 'text-muted-foreground/50'
                  )}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary line */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
          <span className="text-muted-foreground">
            Esta semana
          </span>
          <span className="font-semibold">
            {Array.from(sessionsByDay.values()).reduce((a, b) => a + b, 0)}{' '}
            {Array.from(sessionsByDay.values()).reduce((a, b) => a + b, 0) === 1
              ? 'sesion'
              : 'sesiones'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
