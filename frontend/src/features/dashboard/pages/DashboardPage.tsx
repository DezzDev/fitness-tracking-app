import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sparkles } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useWorkoutStats } from '@/features/workouts/hooks/useWorkouts';
import { useWorkoutSessions } from '@/features/workouts/hooks/useWorkoutSessions';
import { useWorkoutTemplates } from '@/features/workouts/hooks/useWorkoutTemplates';

import StatsCards from '../components/StatsCards';
import RecentSessions from '../components/RecentSessions';
import QuickActions from '../components/QuickActions';
import WeeklyActivity from '../components/WeeklyActivity';
import TemplatesOverview from '../components/TemplatesOverview';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos dias';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useWorkoutStats();

  const { data: sessionsResponse, isLoading: sessionsLoading } =
    useWorkoutSessions({ limit: 5 });

  const { data: templatesResponse, isLoading: templatesLoading } =
    useWorkoutTemplates({ limit: 4 });

  const sessions = sessionsResponse?.data?.items;
  const templates = templatesResponse?.data?.items;
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'atleta'}
          </h1>
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-gray-600 mt-1 capitalize">{today}</p>
      </div>

      {/* Stats Overview */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Acciones Rapidas
        </h2>
        <QuickActions />
      </section>

      {/* Two-column layout: Recent Sessions + Right Sidebar */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Recent Sessions (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          <RecentSessions sessions={sessions} isLoading={sessionsLoading} />
        </div>

        {/* Right sidebar (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyActivity
            sessions={sessions}
            isLoading={sessionsLoading}
          />
          <TemplatesOverview
            templates={templates}
            isLoading={templatesLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
