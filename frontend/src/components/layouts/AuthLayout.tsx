import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles, TimerReset, Trophy } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const highlights = [
  { icon: Trophy, label: "Planifica y completa metas semanales" },
  { icon: TimerReset, label: "Mantén rachas con seguimiento diario" },
  { icon: Sparkles, label: "Interfaz limpia para entrenar con foco" },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="app-gradient-bg min-h-screen lg:grid lg:grid-cols-2">
      <section className="relative z-10 hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="inline-flex items-center gap-3 text-xl font-bold text-white">
          <div className="brand-badge">💪</div>
          <span>Fitness Tracker</span>
        </Link>

        <div className="max-w-md space-y-5">
          <h1 className="text-5xl font-bold leading-tight text-white">Entrena con claridad. Mejora con datos.</h1>
          <p className="text-lg text-slate-300">
            Organiza tus rutinas, revisa tu constancia y mantiene tus objetivos con una experiencia visual consistente.
          </p>

          <ul className="space-y-3 text-sm text-slate-200">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={16} className="text-cyan-300" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <StatCard value="15k+" label="Usuarios activos" />
          <StatCard value="500k+" label="Series registradas" />
          <StatCard value="92%" label="Retención mensual" />
        </div>
      </section>

      <section className="relative z-10 flex items-center justify-center p-6 sm:p-8">
        <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="mb-6 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
              <div className="brand-badge">💪</div>
              <span>Fitness Tracker</span>
            </Link>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="mt-2 text-slate-300">{subtitle}</p>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="glass-panel rounded-xl p-3">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-300">{label}</p>
    </article>
  );
}
