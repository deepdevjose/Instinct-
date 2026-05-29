import { motion } from "framer-motion";
import {
  Activity,
  Crosshair,
  Play,
  RotateCcw,
  Shield,
  Skull,
  Sparkles
} from "lucide-react";
import { Suspense, lazy } from "react";
import { getLevelById } from "../game/levels";
import { useGameStore } from "../store/gameStore";
import Console from "./Console";
import RoadmapProgress from "./RoadmapProgress";

const CodeEditor = lazy(() => import("./CodeEditor"));

export default function LevelPanel() {
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const code = useGameStore((state) => state.code);
  const setCode = useGameStore((state) => state.setCode);
  const runCode = useGameStore((state) => state.runCode);
  const resetToCheckpoint = useGameStore((state) => state.resetToCheckpoint);
  const consoleLines = useGameStore((state) => state.consoleLines);
  const runStatus = useGameStore((state) => state.runStatus);
  const attempts = useGameStore(
    (state) => state.attemptsByLevel[state.currentLevelId] ?? 0
  );
  const snake = useGameStore((state) => state.world.snake);
  const level = getLevelById(currentLevelId);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex h-full min-h-0 flex-col gap-4 border-l border-[#6e5630]/35 bg-[#080b0a]/92 p-4 shadow-2xl backdrop-blur"
    >
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-venom">
              INSTINCT()
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-bone">
              {level.title}
            </h1>
          </div>
          <div className="rounded-md border border-venom/25 bg-venom/10 px-3 py-2 text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#d8b574]/52">
              Nivel {String(level.id).padStart(2, "0")} / 45
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-venom">
              {formatActLabel(level.act)}
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-bone/66">{level.narrative}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <InfoBlock icon={Crosshair} label="Objetivo" value={level.objective} />
          <InfoBlock
            icon={Sparkles}
            label="Teoría"
            value={level.pythonConcept}
          />
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <Stat icon={Activity} label="Salud" value={snake.health} />
        <Stat icon={Shield} label="Energía" value={snake.energy} />
        <Stat icon={Skull} label="Veneno" value={snake.venom} />
      </section>

      <section className="flex min-h-[260px] flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-[#d8b574]/52">
            Código
          </div>
          <div className="font-mono text-xs text-bone/42">
            intentos {attempts} / {level.maxAttempts}
          </div>
        </div>
        <div className="min-h-[240px] flex-1">
          <Suspense
            fallback={
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-[#6e5630]/32 bg-[#0d1110] font-mono text-xs uppercase tracking-[0.24em] text-[#d8b574]/50">
                Cargando editor
              </div>
            }
          >
            <CodeEditor value={code} levelId={level.id} onChange={setCode} />
          </Suspense>
        </div>
      </section>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={runCode}
          className={`flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-black transition ${
            runStatus === "failure"
              ? "bg-red-300 hover:bg-red-200"
              : "bg-venom hover:bg-[#b8ffa8]"
          }`}
        >
          <Play className="h-4 w-4" />
          {runStatus === "running" ? "Ejecutando" : "Ejecutar"}
        </button>
        <button
          type="button"
          onClick={resetToCheckpoint}
          className="hud-control flex h-11 w-11 items-center justify-center rounded-md text-bone/70 transition hover:text-bone"
          aria-label="Reiniciar checkpoint"
          title="Reiniciar checkpoint"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <Console lines={consoleLines} />
      <RoadmapProgress />
    </motion.aside>
  );
}

function formatActLabel(act: string) {
  return act.replace(" - ", " · ").toUpperCase();
}

function InfoBlock({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Crosshair;
  label: string;
  value: string;
}) {
  return (
    <div className="hud-panel-muted rounded-md p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b574]/48">
        <Icon className="h-3.5 w-3.5 text-venom" />
        {label}
      </div>
      <p className="text-sm leading-5 text-bone/68">{value}</p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <div className="hud-panel-muted rounded-md p-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#d8b574]/45">
        <Icon className="h-3.5 w-3.5 text-venom" />
        {label}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#d8b574]/12">
        <div
          className="h-full rounded-full bg-venom transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
