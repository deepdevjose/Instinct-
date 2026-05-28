import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Download,
  Gamepad2,
  HelpCircle,
  Leaf,
  Map,
  Play,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Volume2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import avatarUrl from "../assets/avatar.png";
import iconUrl from "../assets/icon.png";
import { levels } from "../game/levels";
import { useGameStore } from "../store/gameStore";
import RoadmapProgress from "./RoadmapProgress";

type MenuSection =
  | "main"
  | "checkpoints"
  | "roadmap"
  | "help"
  | "settings"
  | "credits";

interface MainMenuProps {
  onStart: () => void;
}

const tips = [
  "Tip: print() is the first way code speaks.",
  "Survival Tip: failing 3 times sends you back one level.",
  "Instinct Tip: variables let the body remember danger.",
  "Field Note: hiding costs energy, but buys time."
];

export default function MainMenu({ onStart }: MainMenuProps) {
  const [phase, setPhase] = useState<"splash" | "menu">(() =>
    new URLSearchParams(window.location.search).get("menu") === "main"
      ? "menu"
      : "splash"
  );
  const [section, setSection] = useState<MenuSection>("main");
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const unlockedLevelId = useGameStore((state) => state.unlockedLevelId);
  const attemptsByLevel = useGameStore((state) => state.attemptsByLevel);
  const loadLevel = useGameStore((state) => state.loadLevel);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const currentLevel = levels.find((level) => level.id === currentLevelId) ?? levels[0];
  const completedCount = Math.max(0, unlockedLevelId - 1);
  const progress = Math.round((completedCount / levels.length) * 100);
  const totalAttempts = Object.values(attemptsByLevel).reduce(
    (sum, attempts) => sum + attempts,
    0
  );
  const activeTip = tips[currentLevelId % tips.length];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" && phase === "splash") {
        setPhase("menu");
      }

      if (event.key === "Enter" && phase === "menu" && section === "main") {
        continueGame();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, section]);

  function continueGame() {
    loadLevel(currentLevelId);
    onStart();
  }

  function startNewGame() {
    const hasProgress = unlockedLevelId > 1 || currentLevelId > 1;

    if (
      hasProgress &&
      !window.confirm("Starting a new journey will overwrite current progress.")
    ) {
      return;
    }

    resetProgress();
    onStart();
  }

  function loadCheckpoint(levelId: number) {
    loadLevel(levelId);
    onStart();
  }

  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_53%_51%,rgba(242,195,107,0.18),transparent_14rem),radial-gradient(circle_at_22%_50%,rgba(141,255,122,0.1),transparent_22rem),linear-gradient(90deg,rgba(3,6,5,0.66),rgba(3,6,5,0.22)_46%,rgba(3,6,5,0.72))]" />
      <FloatingParticles />

      <AnimatePresence mode="wait">
        {phase === "splash" ? (
          <SplashScreen key="splash" onStart={() => setPhase("menu")} />
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 flex min-h-screen flex-col p-5 text-bone sm:p-8"
          >
            <MenuHeader onOpenSection={setSection} />

            <div className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_470px]">
              <div className="hidden max-w-xl lg:block">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                  className="hud-panel-muted rounded-xl p-5"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={iconUrl}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-[#6e5630]/35 bg-black/35 object-cover"
                    />
                    <div>
                      <p className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-venom">
                        HATCHLING_42
                      </p>
                      <p className="mt-1 text-sm text-bone/58">Apprentice Survivor</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <ProfileRow label="Progress" value={`${progress}%`} />
                    <ProfileRow label="Current Level" value={currentLevel.title} />
                    <ProfileRow label="Attempts" value={String(totalAttempts)} />
                    <ProfileRow label="Play Time" value="00h 00m" />
                  </div>
                </motion.div>
              </div>

              <motion.section
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
                className="hud-panel w-full max-w-[470px] justify-self-end rounded-2xl p-4"
              >
                {section === "main" ? (
                  <MainOptions
                    currentLevel={currentLevel}
                    onContinue={continueGame}
                    onNewGame={startNewGame}
                    onOpenSection={setSection}
                  />
                ) : (
                  <SectionPanel
                    section={section}
                    currentLevelId={currentLevelId}
                    unlockedLevelId={unlockedLevelId}
                    onBack={() => setSection("main")}
                    onLoadCheckpoint={loadCheckpoint}
                  />
                )}
              </motion.section>
            </div>

            <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center justify-center gap-4 font-mono text-xs uppercase tracking-[0.18em] text-bone/46 lg:flex">
              <span>Press</span>
              <span className="text-venom">Enter</span>
              <span>to Start</span>
            </div>

            <SurvivalTip tip={activeTip} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onStart}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center"
    >
      <motion.img
        src={iconUrl}
        alt=""
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="h-24 w-24 rounded-2xl border border-[#6e5630]/40 bg-black/35 object-cover shadow-2xl shadow-black/45"
      />
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
        className="mt-6 font-mono text-4xl font-semibold uppercase tracking-[0.32em] text-venom drop-shadow-[0_0_24px_rgba(141,255,122,0.35)] sm:text-6xl"
      >
        INSTINCT()
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut", delay: 0.2 }}
        className="mt-4 text-lg text-bone/72"
      >
        Survival Compiler
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.36, 1, 0.36] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
        className="mt-12 rounded-lg border border-[#6e5630]/36 bg-black/30 px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] text-bone/72 backdrop-blur-xl"
      >
        Press Enter / Click to Start
      </motion.div>
    </motion.button>
  );
}

function MenuHeader({
  onOpenSection
}: {
  onOpenSection: (section: MenuSection) => void;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <img
          src={iconUrl}
          alt=""
          className="h-16 w-16 rounded-xl border border-[#6e5630]/40 bg-black/35 object-cover shadow-2xl shadow-black/35"
        />
        <div>
          <p className="font-mono text-3xl font-semibold uppercase tracking-[0.28em] text-venom drop-shadow-[0_0_16px_rgba(141,255,122,0.32)] sm:text-5xl">
            INSTINCT()
          </p>
          <p className="mt-2 text-base text-bone/66 sm:text-lg">Survival Compiler</p>
        </div>
      </div>
      <div className="hidden gap-3 sm:flex">
        <IconButton label="Settings" icon={Settings} onClick={() => onOpenSection("settings")} />
        <IconButton label="Help" icon={HelpCircle} onClick={() => onOpenSection("help")} />
        <IconButton label="Credits" icon={Star} onClick={() => onOpenSection("credits")} />
      </div>
    </header>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick
}: {
  label: string;
  icon: typeof Settings;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/24 text-[#d8b574] shadow-[inset_0_0_0_1px_rgba(58,45,25,0.42),0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:bg-venom/10 hover:text-venom hover:shadow-[inset_0_0_0_1px_rgba(141,255,122,0.18),0_14px_34px_rgba(0,0,0,0.28)]"
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function MainOptions({
  currentLevel,
  onContinue,
  onNewGame,
  onOpenSection
}: {
  currentLevel: (typeof levels)[number];
  onContinue: () => void;
  onNewGame: () => void;
  onOpenSection: (section: MenuSection) => void;
}) {
  const options = [
    {
      label: "Continue",
      description: `Resume — Level ${String(currentLevel.id).padStart(2, "0")}: ${currentLevel.title}`,
      icon: Play,
      action: onContinue,
      primary: true
    },
    {
      label: "New Game",
      description: "Begin a new survival",
      icon: Leaf,
      action: onNewGame
    },
    {
      label: "Load Checkpoint",
      description: "Pick up where you left off",
      icon: Download,
      action: () => onOpenSection("checkpoints")
    },
    {
      label: "Roadmap",
      description: "See the whole bloodline path",
      icon: Map,
      action: () => onOpenSection("roadmap")
    },
    {
      label: "Help",
      description: "Learn the basics",
      icon: HelpCircle,
      action: () => onOpenSection("help")
    },
    {
      label: "Settings",
      description: "Adjust your experience",
      icon: Settings,
      action: () => onOpenSection("settings")
    },
    {
      label: "Credits",
      description: "Meet the creators",
      icon: Star,
      action: () => onOpenSection("credits")
    }
  ];

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.action}
          className={`group grid w-full grid-cols-[44px_1fr_20px] items-center gap-4 rounded-xl px-4 py-3 text-left transition ${
            option.primary
              ? "bg-venom/[0.14] shadow-[inset_0_0_0_1px_rgba(141,255,122,0.34),0_0_24px_rgba(141,255,122,0.14)]"
              : "hud-control hover:text-bone"
          }`}
        >
          <option.icon
            className={`h-6 w-6 ${option.primary ? "text-venom" : "text-[#d8b574]"}`}
          />
          <span className="min-w-0">
            <span className="block text-xl font-semibold text-bone">{option.label}</span>
            <span className="mt-0.5 block truncate text-sm text-bone/52">
              {option.description}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-[#d8b574]/72 transition group-hover:translate-x-0.5 group-hover:text-venom" />
        </button>
      ))}
      <p className="pt-2 text-right font-mono text-[11px] uppercase tracking-[0.18em] text-bone/34">
        Version 0.1 Alpha
      </p>
    </div>
  );
}

function SurvivalTip({ tip }: { tip: string }) {
  return (
    <div className="hud-panel-muted pointer-events-auto absolute bottom-14 left-1/2 hidden w-[390px] -translate-x-1/2 rounded-xl p-4 xl:block">
      <div className="flex items-center gap-3">
        <div className="hud-icon-frame flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
          <Sparkles className="h-5 w-5 text-[#d8b574]" />
        </div>
        <p className="text-sm leading-6 text-bone/72">{tip}</p>
      </div>
    </div>
  );
}

function SectionPanel({
  section,
  currentLevelId,
  unlockedLevelId,
  onBack,
  onLoadCheckpoint
}: {
  section: MenuSection;
  currentLevelId: number;
  unlockedLevelId: number;
  onBack: () => void;
  onLoadCheckpoint: (levelId: number) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-[#d8b574] transition hover:text-venom"
        >
          Back
        </button>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#d8b574]/52">
          {section}
        </p>
      </div>

      {section === "checkpoints" ? (
        <CheckpointList
          currentLevelId={currentLevelId}
          unlockedLevelId={unlockedLevelId}
          onLoadCheckpoint={onLoadCheckpoint}
        />
      ) : null}
      {section === "roadmap" ? <MenuRoadmap /> : null}
      {section === "help" ? <HelpPanel /> : null}
      {section === "settings" ? <SettingsPanel /> : null}
      {section === "credits" ? <CreditsPanel /> : null}
    </div>
  );
}

function CheckpointList({
  currentLevelId,
  unlockedLevelId,
  onLoadCheckpoint
}: {
  currentLevelId: number;
  unlockedLevelId: number;
  onLoadCheckpoint: (levelId: number) => void;
}) {
  const availableLevels = levels.filter((level) => level.id <= unlockedLevelId);

  return (
    <div className="thin-scrollbar max-h-[520px] space-y-2 overflow-y-auto pr-1">
      {availableLevels.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onLoadCheckpoint(level.id)}
          className={`grid w-full grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
            level.id === currentLevelId
              ? "bg-venom/[0.12] shadow-[inset_0_0_0_1px_rgba(141,255,122,0.28)]"
              : "hud-control"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 text-venom" />
          <span>
            <span className="block text-sm font-semibold text-bone">{level.act}</span>
            <span className="mt-0.5 block text-sm text-bone/56">
              Level {String(level.id).padStart(2, "0")} · {level.title}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-[#d8b574]" />
        </button>
      ))}
    </div>
  );
}

function MenuRoadmap() {
  return (
    <div className="thin-scrollbar max-h-[520px] overflow-y-auto pr-1">
      <RoadmapProgress />
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="thin-scrollbar max-h-[520px] space-y-4 overflow-y-auto pr-1">
      <HelpSection
        title="Gameplay"
        items={[
          "Open the floating editor to write code.",
          "Run code to trigger survival actions.",
          "Checkpoints restore the level after a failed signal.",
          "Failing more than 3 times sends you back one level."
        ]}
      />
      <HelpSection
        title="Python Basics"
        items={["print()", "variables", "if / else", "loops", "functions"]}
      />
      <HelpSection
        title="UI Guide"
        items={[
          "Health is survival condition.",
          "Energy powers movement and hiding.",
          "Venom powers attacks.",
          "Roadmap shows the full learning path."
        ]}
      />
      <HelpSection
        title="Story"
        items={[
          "You are a serpent learning to survive, evolve, protect young, pass instinct forward, and die naturally with a legacy."
        ]}
      />
    </div>
  );
}

function HelpSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="hud-panel-muted rounded-lg p-4">
      <p className="mb-3 text-lg font-semibold text-bone">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-6 text-bone/62">
            <Code2 className="mt-1 h-4 w-4 shrink-0 text-venom" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel() {
  return (
    <div className="thin-scrollbar max-h-[520px] space-y-4 overflow-y-auto pr-1">
      <SettingsGroup
        icon={SlidersHorizontal}
        title="Visual"
        controls={["Brightness", "Shadows", "Glow", "Fog"]}
      />
      <SettingsGroup icon={Volume2} title="Audio" controls={["Master", "Music", "Effects", "UI Sounds"]} />
      <SettingsGroup icon={Gamepad2} title="Gameplay" controls={["Hints", "Autosave", "Code Assistance"]} />
      <SettingsGroup icon={Clock} title="Controls" controls={["Toggle Editor", "Run Code", "Reset Level"]} />
    </div>
  );
}

function SettingsGroup({
  icon: Icon,
  title,
  controls
}: {
  icon: typeof Settings;
  title: string;
  controls: string[];
}) {
  return (
    <section className="hud-panel-muted rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#d8b574]" />
        <p className="text-lg font-semibold text-bone">{title}</p>
      </div>
      <div className="space-y-3">
        {controls.map((control, index) => (
          <label
            key={control}
            className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm text-bone/62"
          >
            <span>{control}</span>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={index === 0 ? 78 : 58}
              className="accent-venom"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function CreditsPanel() {
  return (
    <div className="space-y-4">
      <section className="hud-panel-muted rounded-lg p-5">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt=""
            className="h-16 w-16 rounded-lg bg-black/35 object-cover shadow-[inset_0_0_0_1px_rgba(58,45,25,0.42)]"
          />
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-venom">
              Game Developer
            </p>
            <p className="mt-1 text-2xl font-semibold text-bone">INSTINCT()</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-bone/62">
          Survival compiler prototype, game design, programming, UI direction and
          learning system.
        </p>
      </section>
      {[
        "Design & Concept",
        "Game System",
        "Programming",
        "3D Art",
        "Built with React, Three.js, React Three Fiber, Monaco, Zustand"
      ].map((line) => (
        <div
          key={line}
          className="hud-control rounded-lg px-4 py-3 text-sm text-bone/68"
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
      <span className="text-bone/46">{label}</span>
      <span className="text-right font-mono text-venom">{value}</span>
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1.5 w-1.5 rounded-full bg-venom shadow-venom"
          initial={{
            opacity: 0,
            x: `${(index * 37) % 100}vw`,
            y: `${(index * 53) % 100}vh`
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [`${(index * 53) % 100}vh`, `${((index * 53) % 100) - 12}vh`]
          }}
          transition={{
            duration: 3.2 + (index % 5),
            repeat: Infinity,
            delay: index * 0.28,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
