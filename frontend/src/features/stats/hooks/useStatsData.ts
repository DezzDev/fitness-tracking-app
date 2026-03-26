import { useMemo } from 'react';
import { subDays } from 'date-fns';

import { useSessionStats, useWorkoutSessions } from '@/features/workouts/hooks/useWorkoutSessions';
import { useQuery } from '@tanstack/react-query';
import { personalRecordsApi } from '@/api/endpoints/personalRecords';
import type { WorkoutSessionWithMetrics } from '@/types';

export type StatsRange = '7d' | '30d' | '90d';

export type TrendPoint = {
  label: string;
  sessions: number;
  volume: number;
};

const formatWeekLabel = (date: Date): string => {
  const start = new Date(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  const month = start.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  return `${start.getDate()} ${month}`.toUpperCase();
};

const getPeriodDays = (range: StatsRange): number => {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  return 90;
};

const groupByWeek = (sessions: WorkoutSessionWithMetrics[]): TrendPoint[] => {
  const byWeek = new Map<string, { sessions: number; volume: number; date: Date }>();

  sessions.forEach((session) => {
    const date = new Date(session.sessionDate);
    const key = formatWeekLabel(date);

    const prev = byWeek.get(key);
    if (prev) {
      byWeek.set(key, {
        sessions: prev.sessions + 1,
        volume: prev.volume + (session.totalVolumeKg || 0),
        date: prev.date,
      });
      return;
    }

    byWeek.set(key, {
      sessions: 1,
      volume: session.totalVolumeKg || 0,
      date,
    });
  });

  return Array.from(byWeek.entries())
    .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
    .map(([label, value]) => ({
      label,
      sessions: value.sessions,
      volume: value.volume,
    }));
};

const getDateRange = (range: StatsRange) => {
  const end = new Date();
  const start = subDays(end, getPeriodDays(range));
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

export const useStatsData = (range: StatsRange) => {
  const dateRange = useMemo(() => getDateRange(range), [range]);

  const sessionFilters = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 200,
      page: 1,
    }),
    [dateRange.endDate, dateRange.startDate]
  );

  const sessionStatsQuery = useSessionStats();
  const sessionsQuery = useWorkoutSessions(sessionFilters);

  const personalRecordStatsQuery = useQuery({
    queryKey: ['personal-records', 'stats'],
    queryFn: () => personalRecordsApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  const sessions = useMemo(() => sessionsQuery.data?.data.items || [], [sessionsQuery.data]);

  const periodSummary = useMemo(() => {
    const totalVolume = sessions.reduce((sum, session) => sum + (session.totalVolumeKg || 0), 0);
    const totalSets = sessions.reduce((sum, session) => sum + (session.totalSets || 0), 0);
    const totalExercises = sessions.reduce((sum, session) => sum + (session.totalExercises || 0), 0);
    const totalDuration = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);

    return {
      totalVolume,
      totalSets,
      totalExercises,
      totalDuration,
      avgVolumePerSession: sessions.length > 0 ? totalVolume / sessions.length : 0,
    };
  }, [sessions]);

  const trends = useMemo(() => groupByWeek(sessions), [sessions]);

  const recentSessions = useMemo(
    () =>
      [ ...sessions ]
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
        .slice(0, 5),
    [sessions]
  );

  return {
    sessionStatsQuery,
    sessionsQuery,
    personalRecordStatsQuery,
    sessions,
    periodSummary,
    trends,
    recentSessions,
    rangeDays: getPeriodDays(range),
  };
};
