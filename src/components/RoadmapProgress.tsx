import { BookOpen, CheckCircle2, CircleDot, Code2, Lock, Map } from "lucide-react";
import type { Level } from "../game/entities";
import { levels } from "../game/levels";
import { useGameStore } from "../store/gameStore";

export default function RoadmapProgress() {
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const unlockedLevelId = useGameStore((state) => state.unlockedLevelId);
  const loadLevel = useGameStore((state) => state.loadLevel);
  const completedCount = Math.max(0, unlockedLevelId - 1);
  const progress = Math.round((completedCount / levels.length) * 100);
  const acts = groupLevelsByAct(levels);

  return (
    <section className="hud-panel-muted overflow-hidden rounded-lg">
      <div className="flex items-center justify-between gap-3 border-b border-[#d8b574]/15 px-3 py-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d8b574]/74">
            <Map className="h-4 w-4 text-venom" />
            Python Roadmap
          </div>
          <p className="mt-1 text-xs text-bone/48">
            Print, variables, constants, functions, loops, control flow, data and OOP.
          </p>
        </div>
        <span className="rounded-md border border-venom/20 bg-venom/10 px-2.5 py-1 font-mono text-xs text-venom">
          {progress}%
        </span>
      </div>

      <div className="px-3 pt-3.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#d8b574]/10">
          <div
            className="h-full rounded-full bg-venom shadow-venom transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="thin-scrollbar max-h-[min(62vh,560px)] space-y-4 overflow-y-auto p-3">
        {acts.map((act) => (
          <div key={act.name}>
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f3d491]">
                {formatActLabel(act.name)}
              </span>
              <span className="text-[11px] text-bone/38">{act.levels.length} nodes</span>
            </div>

            <div className="relative space-y-1.5 pl-3 before:absolute before:left-[9px] before:top-3 before:h-[calc(100%-1.5rem)] before:w-px before:bg-[#d8b574]/12">
              {act.levels.map((level) => {
                const isCurrent = level.id === currentLevelId;
                const isComplete = level.id < unlockedLevelId;
                const isUnlocked = level.id <= unlockedLevelId;
                const Icon = isComplete ? CheckCircle2 : isCurrent ? CircleDot : Lock;

                return (
                  <button
                    key={level.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => loadLevel(level.id)}
                    className={`relative grid w-full grid-cols-[26px_minmax(0,1fr)_auto] items-start gap-2 rounded-lg px-2.5 py-2.5 text-left transition ${
                      isCurrent
                        ? "bg-venom/[0.12] text-bone shadow-[inset_0_0_0_1px_rgba(141,255,122,0.28)]"
                        : isUnlocked
                          ? isComplete
                            ? "text-bone/82 hover:bg-[#d8b574]/[0.06]"
                            : "text-bone/66 hover:bg-[#d8b574]/[0.06]"
                          : "cursor-not-allowed text-bone/22"
                    }`}
                  >
                    <span className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#07100a]">
                      <Icon
                        className={`h-4 w-4 ${
                          isComplete || isCurrent ? "text-venom" : "text-[#d8b574]/26"
                        }`}
                      />
                    </span>

                    <span className="min-w-0">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold">{level.title}</span>
                        {level.isPlayable ? (
                          <span className="hidden rounded-full bg-venom/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-venom sm:inline">
                            playable
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-[#d8b574]/72">
                        <Code2 className="h-3 w-3" />
                        {level.pythonConcept}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-bone/46">
                        {level.objective}
                      </span>
                    </span>

                    <span className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[11px] text-bone/36">
                        {String(level.id).padStart(2, "0")}
                      </span>
                      <BookOpen className="h-3.5 w-3.5 text-[#d8b574]/34" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function groupLevelsByAct(items: Level[]) {
  return items.reduce<Array<{ name: string; levels: Level[] }>>((groups, level) => {
    const group = groups.find((entry) => entry.name === level.act);

    if (group) {
      group.levels.push(level);
      return groups;
    }

    groups.push({ name: level.act, levels: [level] });
    return groups;
  }, []);
}

function formatActLabel(act: string) {
  return act.replace(" - ", " · ");
}
