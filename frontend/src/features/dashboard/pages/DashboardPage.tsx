import { Activity, ArrowUpRight, Flame, Goal, HeartPulse, TrendingUp } from "lucide-react";

const metrics = [
  {
    title: "Entrenamientos esta semana",
    value: "5",
    change: "+2 vs semana pasada",
    icon: Activity,
  },
  {
    title: "Minutos activos",
    value: "286",
    change: "+14% de consistencia",
    icon: Flame,
  },
  {
    title: "Objetivos cumplidos",
    value: "82%",
    change: "4 metas completadas",
    icon: Goal,
  },
  {
    title: "Ritmo promedio",
    value: "132 bpm",
    change: "Zona cardio óptima",
    icon: HeartPulse,
  },
];

const upcoming = [
  { day: "Lunes", plan: "Push + Core", time: "07:00" },
  { day: "Miércoles", plan: "Pierna + movilidad", time: "18:30" },
  { day: "Viernes", plan: "Pull + HIIT", time: "07:15" },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-3xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 p-6 shadow-2xl shadow-black/20 md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">Panel de rendimiento</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Tu progreso, claro y accionable.</h1>
        <p className="mt-3 max-w-2xl text-slate-200/90">
          Revisa métricas clave, detecta tendencias y prepara tus próximas sesiones desde un único panel.
        </p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/25">
          Ver plan semanal
          <ArrowUpRight size={16} />
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, change, icon: Icon }) => (
          <article key={title} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">{title}</p>
              <div className="rounded-lg bg-cyan-400/20 p-2 text-cyan-200">
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{value}</p>
            <p className="mt-1 text-sm text-emerald-300">{change}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <article className="glass-panel rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="text-cyan-300" />
            <h2 className="text-xl font-semibold text-white">Evolución semanal</h2>
          </div>

          <div className="space-y-4">
            {[65, 78, 54, 88, 70, 92, 80].map((value, index) => (
              <div key={`${value}-${index}`}>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>Día {index + 1}</span>
                  <span>{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white">Próximas sesiones</h2>
          <ul className="mt-4 space-y-3">
            {upcoming.map((session) => (
              <li key={session.day} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <p className="text-sm font-semibold text-white">{session.day}</p>
                <p className="text-sm text-slate-300">{session.plan}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cyan-300">{session.time}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
