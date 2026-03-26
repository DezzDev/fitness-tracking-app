import { useMemo, useState } from 'react';
import { Activity, Clock3, Dumbbell, Flame, Trophy, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatsData, type StatsRange } from '../hooks/useStatsData';

const rangeOptions: Array<{ label: string; value: StatsRange }> = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
];

const formatVolume = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K kg`;
  }

  return `${Math.round(value)} kg`;
};

export default function StatsPage() {
  const [range, setRange] = useState<StatsRange>('30d');

  const {
    sessionStatsQuery,
    sessionsQuery,
    personalRecordStatsQuery,
    periodSummary,
    trends,
    recentSessions,
    rangeDays,
  } = useStatsData(range);

  const isLoading =
    sessionStatsQuery.isLoading || sessionsQuery.isLoading || personalRecordStatsQuery.isLoading;

  const maxTrendVolume = useMemo(() => {
    if (trends.length === 0) return 0;
    return Math.max(...trends.map((point) => point.volume));
  }, [trends]);

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const globalStats = sessionStatsQuery.data;
  const prStats = personalRecordStatsQuery.data;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-[2px] uppercase text-foreground">Estadisticas</h1>
          <p className="text-muted-foreground font-barlow mt-1">
            Resumen de tu progreso y consistencia de entrenamiento
          </p>
        </div>

        <div className="flex items-center gap-2 border border-border p-1 bg-muted/10">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={range === option.value ? 'default' : 'ghost'}
              onClick={() => setRange(option.value)}
              className="uppercase text-xs tracking-[2px] font-barlow"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Activity className="h-4 w-4" />
            Sesiones Totales
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{globalStats?.totalSessions || 0}</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <TrendingUp className="h-4 w-4" />
            Sesiones Este Mes
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{globalStats?.sessionsThisMonth || 0}</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Clock3 className="h-4 w-4" />
            Duracion Promedio
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{globalStats?.averageDuration || 0} min</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Flame className="h-4 w-4" />
            Volumen ({rangeDays}D)
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{formatVolume(periodSummary.totalVolume)}</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Dumbbell className="h-4 w-4" />
            Sets ({rangeDays}D)
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{periodSummary.totalSets}</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Activity className="h-4 w-4" />
            Ejercicios ({rangeDays}D)
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{periodSummary.totalExercises}</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Clock3 className="h-4 w-4" />
            Duracion ({rangeDays}D)
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{periodSummary.totalDuration} min</p>
        </Card>

        <Card className="p-4 rounded-none border-border space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[2px] font-barlow">
            <Trophy className="h-4 w-4" />
            PRs Totales
          </div>
          <p className="text-3xl font-bebas tracking-[2px] text-foreground">{prStats?.total || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 rounded-none border-border lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bebas tracking-[2px] uppercase text-foreground">Tendencia de Volumen</h2>
            <span className="text-xs text-muted-foreground uppercase tracking-[2px] font-barlow">Por semana</span>
          </div>

          {trends.length === 0 ? (
            <p className="text-sm text-muted-foreground font-barlow">No hay datos suficientes para mostrar tendencia.</p>
          ) : (
            <div className="space-y-3">
              {trends.map((point) => {
                const width = maxTrendVolume > 0 ? (point.volume / maxTrendVolume) * 100 : 0;

                return (
                  <div key={point.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-barlow uppercase tracking-wide">
                      <span className="text-muted-foreground">{point.label}</span>
                      <span className="text-foreground">
                        {formatVolume(point.volume)} - {point.sessions} sesiones
                      </span>
                    </div>
                    <div className="h-2 bg-muted/20">
                      <div
                        className="h-2 bg-primary transition-all"
                        style={{ width: `${Math.max(width, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4 rounded-none border-border space-y-4">
          <h2 className="text-lg font-bebas tracking-[2px] uppercase text-foreground">Template Mas Usado</h2>

          {globalStats?.mostUsedTemplate ? (
            <div className="space-y-2">
              <p className="text-2xl font-bebas tracking-[1px] text-foreground break-words">
                {globalStats.mostUsedTemplate.templateName}
              </p>
              <p className="text-sm text-muted-foreground font-barlow">
                {globalStats.mostUsedTemplate.usageCount} sesiones completadas
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-barlow">Sin datos de templates todavia.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-none border-border space-y-4">
          <h2 className="text-lg font-bebas tracking-[2px] uppercase text-foreground">Sesiones Recientes</h2>

          {recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground font-barlow">No hay sesiones en este periodo.</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="border border-border p-3 space-y-1">
                  <p className="font-bebas text-lg tracking-[1px] uppercase text-foreground">{session.title}</p>
                  <p className="text-xs text-muted-foreground font-barlow uppercase tracking-[2px]">
                    {format(new Date(session.sessionDate), "d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-sm font-barlow text-foreground">
                    {session.totalSets} sets - {formatVolume(session.totalVolumeKg || 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 rounded-none border-border space-y-4">
          <h2 className="text-lg font-bebas tracking-[2px] uppercase text-foreground">PRs Recientes</h2>

          {prStats?.recentRecords?.length ? (
            <div className="space-y-3">
              {prStats.recentRecords.map((record) => {
                const value =
                  record.maxWeight ?? record.maxReps ?? record.maxDurationSeconds ?? 0;

                const unit = record.maxWeight
                  ? 'kg'
                  : record.maxReps
                    ? 'reps'
                    : 'seg';

                return (
                  <div key={record.id} className="border border-border p-3 space-y-1">
                    <p className="font-bebas text-lg tracking-[1px] uppercase text-foreground">
                      {record.exerciseName}
                    </p>
                    <p className="text-sm font-barlow text-foreground">
                      {value} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground font-barlow uppercase tracking-[2px]">
                      {format(new Date(record.achievedAt), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-barlow">Aun no tienes PRs registrados.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
