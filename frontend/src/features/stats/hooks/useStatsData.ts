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
  reps: number;
};

export type PeriodSummary = {
  totalVolume: number;
  totalReps: number;
  totalSets: number;
  totalExercises: number;
  totalDuration: number;
  avgVolumePerSession: number;
};

export type MetricComparison = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number | null;
};

export type WeekdayDistribution = {
  day: string;
  shortDay: string;
  sessions: number;
};

export type ConsistencyData = {
  trainedDays: number;
  targetDays: number;
  score: number;
  currentStreak: number;
};

type TemplateUsage = {
  name: string;
  sessions: number;
  volume: number;
  reps: number;
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

const buildSummary = (sessions: WorkoutSessionWithMetrics[]): PeriodSummary => {
  const totalVolume = sessions.reduce((sum, session) => sum + (session.totalVolumeKg || 0), 0);
  const totalReps = sessions.reduce((sum, session) => sum + (session.totalReps || 0), 0);
  const totalSets = sessions.reduce((sum, session) => sum + (session.totalSets || 0), 0);
  const totalExercises = sessions.reduce((sum, session) => sum + (session.totalExercises || 0), 0);
  const totalDuration = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);

  return {
    totalVolume,
    totalReps,
    totalSets,
    totalExercises,
    totalDuration,
    avgVolumePerSession: sessions.length > 0 ? totalVolume / sessions.length : 0,
  };
};

const compareMetric = (current: number, previous: number): MetricComparison => {
  const delta = current - previous;

  if (previous === 0) {
    return {
      current,
      previous,
      delta,
      deltaPercent: current === 0 ? 0 : null,
    };
  }

  return {
    current,
    previous,
    delta,
    deltaPercent: (delta / previous) * 100,
  };
};

const getDateOnly = (isoDate: string): string => isoDate.split('T')[0] || isoDate;

const getCurrentStreak = (sessions: WorkoutSessionWithMetrics[]): number => {
  if (sessions.length === 0) {
    return 0;
  }

  const days = new Set(sessions.map((session) => getDateOnly(session.sessionDate)));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(cursor.toISOString().split('T')[0] || '')) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (days.has(cursor.toISOString().split('T')[0] || '')) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const buildWeekdayDistribution = (
  sessions: WorkoutSessionWithMetrics[]
): WeekdayDistribution[] => {
  const days: WeekdayDistribution[] = [
    { day: 'Lunes', shortDay: 'L', sessions: 0 },
    { day: 'Martes', shortDay: 'M', sessions: 0 },
    { day: 'Miercoles', shortDay: 'X', sessions: 0 },
    { day: 'Jueves', shortDay: 'J', sessions: 0 },
    { day: 'Viernes', shortDay: 'V', sessions: 0 },
    { day: 'Sabado', shortDay: 'S', sessions: 0 },
    { day: 'Domingo', shortDay: 'D', sessions: 0 },
  ];

  sessions.forEach((session) => {
    const day = new Date(session.sessionDate).getDay();
    const index = day === 0 ? 6 : day - 1;
    const current = days[index];

    if (current) {
      current.sessions += 1;
    }
  });

  return days;
};

const buildTopTemplates = (sessions: WorkoutSessionWithMetrics[]): TemplateUsage[] => {
  const byTemplate = new Map<string, TemplateUsage>();

  sessions.forEach((session) => {
    const name = session.title || 'Sesion libre';
    const previous = byTemplate.get(name);

    if (previous) {
      byTemplate.set(name, {
        name,
        sessions: previous.sessions + 1,
        volume: previous.volume + (session.totalVolumeKg || 0),
        reps: previous.reps + (session.totalReps || 0),
      });
      return;
    }

    byTemplate.set(name, {
      name,
      sessions: 1,
      volume: session.totalVolumeKg || 0,
      reps: session.totalReps || 0,
    });
  });

  return Array.from(byTemplate.values())
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 4);
};

const groupByWeek = (sessions: WorkoutSessionWithMetrics[]): TrendPoint[] => {
  const byWeek = new Map<string, { sessions: number; volume: number; reps: number; date: Date }>();

  sessions.forEach((session) => {
    const date = new Date(session.sessionDate);
    const key = formatWeekLabel(date);

    const prev = byWeek.get(key);
    if (prev) {
      byWeek.set(key, {
        sessions: prev.sessions + 1,
        volume: prev.volume + (session.totalVolumeKg || 0),
        reps: prev.reps + (session.totalReps || 0),
        date: prev.date,
      });
      return;
    }

    byWeek.set(key, {
      sessions: 1,
      volume: session.totalVolumeKg || 0,
      reps: session.totalReps || 0,
      date,
    });
  });

  return Array.from(byWeek.entries())
    .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
    .map(([label, value]) => ({
      label,
      sessions: value.sessions,
      volume: value.volume,
      reps: value.reps,
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
  const rangeDays = getPeriodDays(range);

  const dateRange = useMemo(() => getDateRange(range), [range]);

  const previousDateRange = useMemo(() => {
    const currentStart = new Date(dateRange.startDate);
    const previousEnd = currentStart;
    const previousStart = subDays(previousEnd, rangeDays);

    return {
      startDate: previousStart.toISOString(),
      endDate: previousEnd.toISOString(),
    };
  }, [dateRange.startDate, rangeDays]);

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

  const previousSessionFilters = useMemo(
    () => ({
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
      limit: 200,
      page: 1,
    }),
    [previousDateRange.endDate, previousDateRange.startDate]
  );

  const previousSessionsQuery = useWorkoutSessions(previousSessionFilters);

  const personalRecordStatsQuery = useQuery({
    queryKey: ['personal-records', 'stats'],
    queryFn: () => personalRecordsApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  const sessions = useMemo(() => sessionsQuery.data?.data.items || [], [sessionsQuery.data]);

  const previousSessions = useMemo(
    () => previousSessionsQuery.data?.data.items || [],
    [previousSessionsQuery.data]
  );

  const periodSummary = useMemo(() => buildSummary(sessions), [sessions]);

  const previousPeriodSummary = useMemo(() => buildSummary(previousSessions), [previousSessions]);

  const comparison = useMemo(
    () => ({
      sessions: compareMetric(sessions.length, previousSessions.length),
      reps: compareMetric(periodSummary.totalReps, previousPeriodSummary.totalReps),
      volume: compareMetric(periodSummary.totalVolume, previousPeriodSummary.totalVolume),
      duration: compareMetric(periodSummary.totalDuration, previousPeriodSummary.totalDuration),
      sets: compareMetric(periodSummary.totalSets, previousPeriodSummary.totalSets),
    }),
    [periodSummary, previousPeriodSummary, previousSessions.length, sessions.length]
  );

  const consistency = useMemo<ConsistencyData>(() => {
    const trainedDays = new Set(sessions.map((session) => getDateOnly(session.sessionDate))).size;
    const targetDays = Math.max(Math.round(rangeDays * 0.45), 1);
    const score = Math.min(100, Math.round((trainedDays / rangeDays) * 100));

    return {
      trainedDays,
      targetDays,
      score,
      currentStreak: getCurrentStreak(sessions),
    };
  }, [rangeDays, sessions]);

  const trends = useMemo(() => groupByWeek(sessions), [sessions]);

  const weekdayDistribution = useMemo(() => buildWeekdayDistribution(sessions), [sessions]);

  const topTemplates = useMemo(() => buildTopTemplates(sessions), [sessions]);

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
    previousSessionsQuery,
    personalRecordStatsQuery,
    sessions,
    previousSessions,
    periodSummary,
    previousPeriodSummary,
    comparison,
    consistency,
    trends,
    weekdayDistribution,
    topTemplates,
    recentSessions,
    rangeDays,
  };
};
