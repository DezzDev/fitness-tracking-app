import type { WorkoutSessionWithExercises, EditableSet } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X, MessageSquare } from 'lucide-react';

interface ActiveSessionProps {
  session: WorkoutSessionWithExercises;
  onComplete: (editedSets: EditableSet[][]) => void;
  onCancel?: () => void;
  isCancelling?: boolean;
}

/** Build initial editable state from the session's pre-populated sets. */
function buildEditableSets(session: WorkoutSessionWithExercises): EditableSet[][] {
  return session.exercises.map((ex) =>
    ex.sets.map((s) => ({
      setNumber: s.setNumber,
      reps: s.reps,
      weight: s.weight,
      durationSeconds: s.durationSeconds,
      restSeconds: s.restSeconds,
      notes: s.notes,
      isCompleted: false,
    }))
  );
}

export default function ActiveSession({
  session,
  onComplete,
  onCancel,
  isCancelling = false,
}: ActiveSessionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [editableSets, setEditableSets] = useState<EditableSet[][]>(() =>
    buildEditableSets(session)
  );
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Ref for auto-scrolling to active set
  const activeSetRef = useRef<HTMLDivElement | null>(null);

  // Keep a ref in sync so setTimeout callbacks can read the latest state
  // without abusing state updaters (which StrictMode calls twice).
  const editableSetsRef = useRef(editableSets);
  useEffect(() => {
    editableSetsRef.current = editableSets;
  }, [editableSets]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  // Auto-scroll to the next incomplete set when it changes
  useEffect(() => {
    if (activeSetRef.current) {
      activeSetRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIdx, editableSets]);

  const exercise = session.exercises[currentIdx];
  const currentSets = editableSets[currentIdx];
  const exCompleted = currentSets.every((s) => s.isCompleted);
  const nextSetIdx = currentSets.findIndex((s) => !s.isCompleted);
  const totalCompleted = editableSets.filter((sets) =>
    sets.every((s) => s.isCompleted)
  ).length;

  // ── Handlers ──────────────────────────────────────────────

  const updateSetField = (
    exerciseIdx: number,
    setIdx: number,
    field: keyof EditableSet,
    value: number | string | boolean | undefined
  ) => {
    setEditableSets((prev) =>
      prev.map((sets, ei) =>
        ei === exerciseIdx
          ? sets.map((s, si) =>
            si === setIdx ? { ...s, [field]: value } : s
          )
          : sets
      )
    );
  };

  const completeSet = () => {
    if (nextSetIdx === -1) return;

    setPulse(true);
    setTimeout(() => setPulse(false), 300);

    updateSetField(currentIdx, nextSetIdx, 'isCompleted', true);

    // Check if all sets are now done after this toggle
    const allDoneAfter = currentSets.every((s, i) =>
      i === nextSetIdx ? true : s.isCompleted
    );

    if (allDoneAfter) {
      if (currentIdx === session.exercises.length - 1) {
        // Use the ref to read the latest state — avoids the state updater
        // which StrictMode invokes twice, causing duplicate onComplete calls.
        setTimeout(() => {
          onComplete(editableSetsRef.current);
        }, 600);
      } else {
        setTimeout(() => goTo(currentIdx + 1, 1), 700);
      }
    }
  };

  const goTo = (idx: number, dir: number) => {
    if (idx < 0 || idx >= session.exercises.length || animating) return;
    setAnimating(true);
    setSlideDir(dir);
    setTimeout(() => {
      setCurrentIdx(idx);
      setSlideDir(0);
      setAnimating(false);
    }, 300);
  };

  const toggleNotes = (setIdx: number) => {
    const key = `${currentIdx}-${setIdx}`;
    setExpandedNotes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const progress = (totalCompleted / session.exercises.length) * 100;

  // ── Helpers for numeric inputs ────────────────────────────

  const parseNumericInput = (
    val: string,
    integer: boolean
  ): number | undefined => {
    if (val === '') return undefined;
    const n = integer ? parseInt(val, 10) : parseFloat(val);
    if (isNaN(n) || n < 0) return undefined;
    return n;
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'flex flex-col h-full w-full transition-opacity duration-400 ease-in-out',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Header */}
      <div className="px-8 pt-5 pb-4 flex justify-between items-center border-b border-border">
        <div>
          <div className="font-barlow text-[11px] tracking-[3px] text-muted-foreground">
            {new Date(session.sessionDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
          <div className="font-barlow text-[15px] tracking-[2px] text-secondary-foreground font-semibold">
            {session.title}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-bebas text-[28px] text-primary">
            {String(currentIdx + 1).padStart(2, '0')}
            <span className="text-[16px] text-muted-foreground mx-0.5">/</span>
            <span className="text-[16px] text-muted-foreground">
              {session.exercises.length}
            </span>
          </div>
          {onCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Cancelar sesión"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-8 w-full max-w-sm border border-border bg-background p-8 space-y-6">
            <div>
              <div className="font-bebas text-2xl tracking-[2px] text-foreground mb-2">
                CANCELAR SESIÓN
              </div>
              <p className="font-barlow text-sm text-muted-foreground">
                Se perderá todo el progreso de esta sesión. Esta acción no se
                puede deshacer.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancel?.();
                }}
                disabled={isCancelling}
                className="w-full bg-destructive border-none text-destructive-foreground font-bebas text-[18px] tracking-[3px] py-4 cursor-pointer transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'CANCELANDO...' : 'CANCELAR SESIÓN'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-[13px] tracking-[3px] py-4 cursor-pointer hover:bg-muted/20 transition-colors disabled:opacity-50"
              >
                CONTINUAR ENTRENANDO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise area */}
      <div
        className={cn(
          'flex-1 flex flex-col p-8 overflow-y-auto transition-all duration-300 ease-in-out',
          animating ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          transform: animating
            ? `translateX(${slideDir * -60}px)`
            : 'translateX(0)',
        }}
      >
        {/* Muscle group tag */}
        <div className="font-barlow text-[10px] tracking-[4px] text-primary font-semibold mb-3">
          {exercise.muscleGroup}
        </div>

        {/* Exercise name */}
        <div
          className={cn(
            'font-bebas text-[clamp(40px,10vw,64px)] leading-[0.9] tracking-[2px] mb-6 transition-colors duration-300 ease-in-out',
            exCompleted ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {exercise.exerciseName}
        </div>

        {/* Sets — inline editable rows */}
        <div className="flex flex-col gap-1">
          {currentSets.map((set, i) => {
            const isActive = i === nextSetIdx;
            const notesKey = `${currentIdx}-${i}`;
            const notesOpen = !!expandedNotes[notesKey];

            return (
              <div
                key={i}
                ref={isActive ? activeSetRef : undefined}
                className={cn(
                  'border border-border rounded transition-all duration-200',
                  isActive && 'border-primary/40 bg-primary/5',
                  set.isCompleted && 'opacity-60'
                )}
              >
                {/* Main set row */}
                <div className="flex items-center gap-2 px-3 py-2.5"> 
                  {/* Set label */}
                  <div
                    className={cn(
                      'font-barlow text-[11px] tracking-[3px] font-semibold shrink-0 w-12',
                      set.isCompleted
                        ? 'text-muted-foreground'
                        : 'text-secondary-foreground'
                    )}
                  >
                    SET {i + 1}
                  </div>

                  {/* Editable fields */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                  
                    {/* Reps */}
                    <SetInput
                      label="REPS"
                      value={set.reps}
                      onChange={(v) =>
                        updateSetField(currentIdx, i, 'reps', parseNumericInput(v, true))
                      }
                      integer
                    />

                     {/* Weight */}
                    <SetInput
                      label="KG"
                      value={set.weight}
                      onChange={(v) =>
                        updateSetField(currentIdx, i, 'weight', parseNumericInput(v, false))
                      }
                      step="0.5"
                      integer={false}
                    />

                    {/* Duration */}
                    <SetInput
                      label="SEG"
                      value={set.durationSeconds}
                      onChange={(v) =>
                        updateSetField(
                          currentIdx,
                          i,
                          'durationSeconds',
                          parseNumericInput(v, true)
                        )
                      }
                      integer
                    />

                    {/* Rest */}
                    <SetInput
                      label="DESC"
                      value={set.restSeconds}
                      onChange={(v) =>
                        updateSetField(
                          currentIdx,
                          i,
                          'restSeconds',
                          parseNumericInput(v, true)
                        )
                      }
                      integer
                    />
                  </div>

                  {/* Notes toggle */}
                  <button
                    onClick={() => toggleNotes(i)}
                    className={cn(
                      'p-1 shrink-0 transition-colors',
                      set.notes
                        ? 'text-primary'
                        : 'text-muted-foreground/40 hover:text-muted-foreground'
                    )}
                    aria-label="Notas"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>

                  {/* Completion dot */}
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all duration-200 ease-in-out shrink-0',
                      set.isCompleted
                        ? 'bg-primary shadow-[0_0_8px_var(--orange-glow)]'
                        : 'bg-transparent border-[1.5px] border-border'
                    )}
                  />
                </div>

                {/* Notes row (collapsible) */}
                {notesOpen && (
                  <div className="px-3 pb-2.5">
                    <input
                      type="text"
                      value={set.notes ?? ''}
                      onChange={(e) =>
                        updateSetField(currentIdx, i, 'notes', e.target.value || undefined)
                      }
                      placeholder="Notas del set..."
                      className="w-full bg-transparent border border-border rounded px-2 py-1.5 font-barlow text-[11px] tracking-[1px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
                      maxLength={500}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-1.5 px-8 pb-3">
        {session.exercises.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i, i > currentIdx ? 1 : -1)}
            className={cn(
              'h-1 rounded-sm cursor-pointer transition-all duration-200 ease-in-out',
              i === currentIdx
                ? 'w-5 bg-primary'
                : editableSets[i].every((s) => s.isCompleted)
                  ? 'w-1.5 bg-muted-foreground'
                  : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="px-8 pb-5">
        <button
          onClick={completeSet}
          disabled={exCompleted}
          className={cn(
            'w-full font-bebas text-[20px] tracking-[4px] py-[18px] transition-all duration-300 ease-in-out',
            exCompleted
              ? 'bg-transparent border border-border text-muted-foreground cursor-default'
              : 'bg-primary border-none text-black cursor-pointer',
            pulse ? 'scale-[0.97]' : 'scale-100'
          )}
        >
          {exCompleted ? 'EJERCICIO COMPLETADO' : '+ COMPLETAR SET'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-8 pb-7">
        <div className="flex justify-between mb-2">
          <div className="font-barlow text-[10px] tracking-[3px] text-secondary">
            {totalCompleted} / {session.exercises.length} EJERCICIOS
          </div>
        </div>
        <div className="h-0.5 bg-border rounded-sm overflow-hidden">
          <div
            className="h-full bg-primary rounded-sm transition-[width] duration-400 ease-in-out shadow-[0_0_6px_var(--orange-glow)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Swipe hint */}
      <div className="flex justify-between px-8 pb-4">
        <button
          onClick={() => goTo(currentIdx - 1, -1)}
          disabled={currentIdx === 0}
          className={cn(
            'bg-transparent border-none font-barlow text-[11px] tracking-[2px] p-0',
            currentIdx === 0
              ? 'text-border cursor-default'
              : 'text-muted-foreground cursor-pointer'
          )}
        >
          ← ANTERIOR
        </button>
        <button
          onClick={() => goTo(currentIdx + 1, 1)}
          disabled={currentIdx === session.exercises.length - 1}
          className={cn(
            'bg-transparent border-none font-barlow text-[11px] tracking-[2px] p-0',
            currentIdx === session.exercises.length - 1
              ? 'text-border cursor-default'
              : 'text-muted-foreground cursor-pointer'
          )}
        >
          SIGUIENTE →
        </button>
      </div>
    </div>
  );
}

// ── Small numeric input for set fields ──────────────────────

interface SetInputProps {
  label: string;
  value: number | undefined;
  onChange: (raw: string) => void;
  step?: string;
  integer?: boolean;
}

function SetInput({ label, value, onChange, step, integer = true }: SetInputProps) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        inputMode={integer ? 'numeric' : 'decimal'}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        step={step ?? '1'}
        min="0"
        className="w-14 bg-transparent border border-border rounded px-1.5 py-1 font-bebas text-[16px] text-foreground text-center focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="font-barlow text-[9px] tracking-[2px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
