import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Code2,
  Heart,
  LogOut,
  Map,
  Play,
  RotateCcw,
  Save,
  Shield,
  Skull,
  Sparkles,
  X,
  Zap,
  type LucideIcon
} from "lucide-react";
import {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import iconUrl from "../assets/icon.png";
import { getLevelById } from "../game/levels";
import { useGameStore } from "../store/gameStore";
import Console from "./Console";
import RoadmapProgress from "./RoadmapProgress";

const CodeEditor = lazy(() => import("./CodeEditor"));

type DragState = {
  active: boolean;
  pointerId: number;
  originX: number;
  originY: number;
  startX: number;
  startY: number;
};

interface ImmersiveHUDProps {
  onSaveAndExit: () => void;
}

export default function ImmersiveHUD({ onSaveAndExit }: ImmersiveHUDProps) {
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const level = getLevelById(currentLevelId);
  const snake = useGameStore((state) => state.world.snake);
  const runStatus = useGameStore((state) => state.runStatus);
  const [editorOpen, setEditorOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 640
  );
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_45%,rgba(242,195,107,0.14),transparent_18rem),radial-gradient(circle_at_78%_62%,rgba(141,255,122,0.08),transparent_24rem),linear-gradient(90deg,rgba(0,0,0,0.34),transparent_38%,rgba(0,0,0,0.42))]" />

      <TopIdentity />
      <TopRightControls
        levelId={level.id}
        act={level.act}
        onSaveAndExit={onSaveAndExit}
      />
      <ObjectiveCard
        title={level.title}
        narrative={level.narrative}
        objective={level.objective}
      />
      <StatsHUD health={snake.health} energy={snake.energy} venom={snake.venom} />

      <div className="pointer-events-auto absolute left-4 top-20 z-20 flex flex-wrap items-end gap-3 sm:bottom-5 sm:left-5 sm:top-auto">
        <RoadmapButton
          isOpen={roadmapOpen}
          onClick={() => setRoadmapOpen((value) => !value)}
        />
        <StatusPill status={runStatus} />
      </div>

      <AnimatePresence>
        {roadmapOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto absolute left-4 top-32 z-30 w-[min(560px,calc(100vw-2rem))] sm:bottom-24 sm:left-5 sm:top-auto"
          >
            <div className="hud-panel rounded-xl p-2">
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#d8b574]">
                  Bloodline Roadmap
                </span>
                <button
                  type="button"
                  onClick={() => setRoadmapOpen(false)}
                  className="rounded-md p-1 text-[#d8b574]/60 transition hover:bg-[#d8b574]/10 hover:text-bone"
                  aria-label="Close roadmap"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <RoadmapProgress />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editorOpen ? (
          <FloatingCodeDock onClose={() => setEditorOpen(false)} />
        ) : (
          <OpenCodeButton onClick={() => setEditorOpen(true)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TopRightControls({
  levelId,
  act,
  onSaveAndExit
}: {
  levelId: number;
  act: string;
  onSaveAndExit: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex flex-col-reverse items-end gap-2 sm:right-5 sm:top-5 sm:flex-row sm:items-stretch">
      <SaveExitButton onSaveAndExit={onSaveAndExit} />
      <LevelBadge levelId={levelId} act={act} />
    </div>
  );
}

function SaveExitButton({ onSaveAndExit }: { onSaveAndExit: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onSaveAndExit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
      className="hud-control flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#f3d491] transition hover:text-venom sm:h-auto sm:px-4"
      aria-label="Save and exit"
      title="Save and exit"
    >
      <Save className="h-4 w-4" />
      <span className="hidden sm:inline">Save & Exit</span>
      <LogOut className="hidden h-4 w-4 text-[#d8b574]/42 sm:block" />
    </motion.button>
  );
}

function TopIdentity() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="pointer-events-auto absolute left-4 top-4 flex items-center gap-3 sm:left-5 sm:top-5"
    >
      <div className="hud-panel-muted relative flex h-14 w-14 items-center justify-center rounded-lg">
        <div className="absolute inset-1 rounded-md border border-venom/[0.055]" />
        <img
          src={iconUrl}
          alt=""
          className="h-11 w-11 rounded-md object-cover"
        />
      </div>
      <div className="hidden sm:block">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.34em] text-venom drop-shadow-[0_0_10px_rgba(141,255,122,0.34)]">
          INSTINCT()
        </p>
        <p className="mt-1 text-sm text-bone/72">Survival Compiler</p>
      </div>
    </motion.header>
  );
}

function LevelBadge({ levelId, act }: { levelId: number; act: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
      className="hud-panel-muted rounded-lg px-3 py-3 sm:px-4"
    >
      <div className="flex items-center gap-3">
        <div className="hud-icon-frame flex h-10 w-10 items-center justify-center rounded-md">
          <Sparkles className="h-5 w-5 text-[#d8b574]" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8b574]/58">
            Level {String(levelId).padStart(2, "0")} / 45
          </p>
          <p className="mt-0.5 text-sm font-semibold uppercase tracking-[0.1em] text-bone">
            {formatActLabel(act)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ObjectiveCard({
  title,
  narrative,
  objective
}: {
  title: string;
  narrative: string;
  objective: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
      className="hud-panel pointer-events-auto absolute right-4 top-28 hidden w-[min(430px,calc(100vw-2rem))] overflow-hidden rounded-xl p-4 md:block"
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#7b6338]/45 to-transparent" />
      <div className="flex gap-4">
        <div className="hud-icon-frame flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
          <BookOpen className="h-6 w-6 text-[#d8b574]" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-bone">{title}</p>
          <p className="mt-2 text-sm leading-6 text-bone/72">{narrative}</p>
          <p className="mt-3 text-sm leading-6 text-[#f3d491]">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-venom">
              Objective:
            </span>{" "}
            {objective}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function StatsHUD({
  health,
  energy,
  venom
}: {
  health: number;
  energy: number;
  venom: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className="hud-panel-muted pointer-events-auto absolute bottom-20 left-4 hidden w-[min(330px,calc(100vw-2rem))] rounded-xl p-4 sm:bottom-24 sm:left-5 sm:block"
    >
      <StatPips icon={Heart} label="Health" value={health} tone="#8dff7a" />
      <StatPips icon={Zap} label="Energy" value={energy} tone="#ffd27a" />
      <StatPips icon={Skull} label="Venom" value={venom} tone="#a7ff87" />
    </motion.section>
  );
}

function StatPips({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
}) {
  const activeCount = Math.max(0, Math.min(5, Math.ceil(value / 20)));

  return (
    <div className="grid grid-cols-[74px_1fr_66px] items-center gap-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#d8b574]/82" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/58">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }, (_, index) => {
          const isActive = index < activeCount;

          return (
            <Icon
              key={`${label}-${index}`}
              className={`h-4 w-4 transition ${
                isActive ? "drop-shadow-[0_0_8px_rgba(141,255,122,0.28)]" : "opacity-25"
              }`}
              style={{
                color: isActive ? tone : "#d8b574",
                fill: isActive && Icon === Heart ? tone : "transparent"
              }}
            />
          );
        })}
      </div>
      <span className="whitespace-nowrap text-right font-mono text-[10px] text-bone/62">
        {value} / 100
      </span>
    </div>
  );
}

function RoadmapButton({
  isOpen,
  onClick
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hud-control flex h-11 w-11 items-center justify-center gap-2 rounded-lg px-0 text-sm font-semibold text-[#f3d491] transition hover:text-venom sm:h-12 sm:w-auto sm:px-4"
    >
      <Map className="h-5 w-5" />
      <span className="hidden sm:inline">
        {isOpen ? "Close Roadmap" : "Open Roadmap"}
      </span>
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = useMemo(() => {
    if (status === "running") {
      return "RUNNING...";
    }

    if (status === "success") {
      return "SIGNAL ACCEPTED";
    }

    if (status === "failure") {
      return "SIGNAL REJECTED";
    }

    if (status === "checkpoint") {
      return "CHECKPOINT RESTORED";
    }

    return "CODE READY";
  }, [status]);

  return (
    <div
      className={`hidden h-12 items-center gap-2 rounded-lg px-4 text-xs font-semibold uppercase tracking-[0.18em] sm:flex ${
        status === "failure"
          ? "hud-control text-red-200"
          : status === "success"
            ? "hud-control text-venom"
            : status === "checkpoint"
              ? "hud-control text-[#f3d491]"
              : "hud-control text-[#d8b574]/58"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "failure"
            ? "bg-red-300"
            : status === "success"
              ? "bg-venom"
              : status === "running"
                ? "bg-[#ffd27a] shadow-[0_0_14px_rgba(255,210,122,0.75)]"
                : "bg-[#d8b574]"
        }`}
      />
      {label}
    </div>
  );
}

function FloatingCodeDock({ onClose }: { onClose: () => void }) {
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const code = useGameStore((state) => state.code);
  const setCode = useGameStore((state) => state.setCode);
  const runCode = useGameStore((state) => state.runCode);
  const resetToCheckpoint = useGameStore((state) => state.resetToCheckpoint);
  const consoleLines = useGameStore((state) => state.consoleLines);
  const runStatus = useGameStore((state) => state.runStatus);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const current = drag.current;

      if (!current?.active || event.pointerId !== current.pointerId) {
        return;
      }

      setPosition({
        x: current.startX + event.clientX - current.originX,
        y: current.startY + event.clientY - current.originY
      });
    }

    function onPointerUp(event: PointerEvent) {
      if (drag.current?.pointerId === event.pointerId) {
        drag.current = null;
      }
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    drag.current = {
      active: true,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startX: position.x,
      startY: position.y
    };
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 28, scale: 0.96 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`pointer-events-auto absolute bottom-3 left-3 right-3 z-20 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[min(540px,calc(100vw-2rem))] ${
        runStatus === "success"
          ? "drop-shadow-[0_0_22px_rgba(141,255,122,0.24)]"
          : runStatus === "failure"
            ? "drop-shadow-[0_0_22px_rgba(255,90,90,0.18)]"
            : ""
      }`}
      style={{ translate: `${position.x}px ${position.y}px` }}
    >
      <div className="hud-panel relative overflow-hidden rounded-xl">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#7b6338]/38 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(216,181,116,0.13),transparent_16rem),radial-gradient(circle_at_92%_18%,rgba(141,255,122,0.09),transparent_14rem)]" />
        <div
          onPointerDown={startDrag}
          className="relative flex cursor-grab items-center justify-between gap-3 border-b border-[#6e5630]/35 px-4 py-3 active:cursor-grabbing"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d8b574]/18" />
              <span className="h-2.5 w-2.5 rounded-full bg-venom shadow-venom" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d8b574]/18" />
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-venom" />
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-venom">
                  Instinct Script
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#d8b574]/76">
                  HATCHLING.PY
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-[#6e5630]/32 bg-[#d8b574]/[0.035] px-3 py-1.5 text-xs text-bone/62 sm:flex">
              <Shield className="h-3.5 w-3.5 text-venom" />
              Python
              <ChevronDown className="h-3.5 w-3.5 text-[#d8b574]/46" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-[#d8b574]/58 transition hover:bg-[#d8b574]/10 hover:text-bone"
              aria-label="Close code editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative p-3">
          <div className="h-[190px] overflow-hidden rounded-lg bg-black/24 shadow-[inset_0_0_0_1px_rgba(18,27,18,0.92),inset_0_0_42px_rgba(0,0,0,0.34)] sm:h-[min(30vh,250px)] sm:min-h-[210px]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.24em] text-[#d8b574]/50">
                  Loading editor
                </div>
              }
            >
              <CodeEditor
                value={code}
                levelId={currentLevelId}
                onChange={setCode}
              />
            </Suspense>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_112px] gap-3 sm:grid-cols-[1fr_140px]">
            <motion.button
              type="button"
              onClick={runCode}
              whileHover={{ scale: 1.018 }}
              whileTap={{ scale: 0.985 }}
              animate={
                runStatus === "running"
                  ? {
                      boxShadow: [
                        "0 0 18px rgba(141,255,122,0.28)",
                        "0 0 34px rgba(255,210,122,0.52)",
                        "0 0 18px rgba(141,255,122,0.28)"
                      ]
                    }
                  : {
                      boxShadow: [
                        "0 0 16px rgba(141,255,122,0.28)",
                        "0 0 30px rgba(141,255,122,0.42)",
                        "0 0 16px rgba(141,255,122,0.28)"
                      ]
                    }
              }
              transition={{ duration: 1.55, repeat: Infinity, ease: "easeInOut" }}
              className={`flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-black transition ${
                runStatus === "failure"
                  ? "border border-red-900/45 bg-red-300 hover:bg-red-200"
                  : "hud-control-primary hover:bg-[#b8ffa8]"
              }`}
            >
              <Play className="h-4 w-4" />
              {runStatus === "running" ? "Running" : "Run Signal"}
            </motion.button>
            <button
              type="button"
              onClick={resetToCheckpoint}
              className="hud-control flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-bone/72 transition hover:text-bone"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <Console lines={consoleLines.slice(-5)} compact className="mt-3" />
    </motion.section>
  );
}

function OpenCodeButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="hud-control pointer-events-auto absolute bottom-4 right-4 z-20 flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-venom transition sm:bottom-5 sm:right-5"
    >
      <Code2 className="h-5 w-5" />
      Open Code
    </motion.button>
  );
}

function formatActLabel(act: string) {
  return act.replace(" - ", " · ").toUpperCase();
}
