import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createConsoleLine,
  createWorldFromLevel,
  type CheckpointState,
  type ConsoleLine,
  type GameAction,
  type WorldState
} from "../game/entities";
import { executePlayerCode, type InterpreterResult } from "../game/interpreter";
import { getLevelById, getNextLevel, getPreviousLevel, levels } from "../game/levels";

type RunStatus = "idle" | "running" | "success" | "failure" | "checkpoint";

interface GameStore {
  currentLevelId: number;
  unlockedLevelId: number;
  attemptsByLevel: Record<number, number>;
  checkpointsByLevel: Record<number, CheckpointState>;
  code: string;
  world: WorldState;
  consoleLines: ConsoleLine[];
  runStatus: RunStatus;
  setCode: (code: string) => void;
  loadLevel: (levelId: number) => void;
  runCode: () => void;
  handleSuccess: (result: InterpreterResult) => void;
  handleFailure: (message: string, output?: string[]) => void;
  resetToCheckpoint: () => void;
  goToPreviousLevel: () => void;
  incrementAttempts: (levelId?: number) => number;
  resetProgress: () => void;
}

const initialLevel = levels[0];

const initialConsole = [
  createConsoleLine("system", "Runtime de INSTINCT() listo."),
  createConsoleLine("hint", 'Primera señal cargada. Ejecuta print("Hello World").')
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentLevelId: initialLevel.id,
      unlockedLevelId: initialLevel.id,
      attemptsByLevel: {},
      checkpointsByLevel: {
        [initialLevel.id]: initialLevel.checkpointState
      },
      code: initialLevel.starterCode,
      world: createWorldFromLevel(initialLevel),
      consoleLines: initialConsole,
      runStatus: "idle",

      setCode: (code) =>
        set((state) => ({
          code,
          runStatus: state.runStatus === "checkpoint" ? "idle" : state.runStatus
        })),

      loadLevel: (levelId) => {
        const targetId = Math.min(Math.max(1, levelId), levels.length);
        const state = get();

        if (targetId > state.unlockedLevelId) {
          set({
            consoleLines: [
              ...state.consoleLines,
              createConsoleLine("hint", `El nivel ${targetId} todavía está bloqueado.`)
            ].slice(-28)
          });
          return;
        }

        const level = getLevelById(targetId);
        const world = createWorldFromSavedCheckpoint(
          level.id,
          state.checkpointsByLevel
        );

        set({
          currentLevelId: level.id,
          code: level.starterCode,
          world,
          runStatus: "idle",
          consoleLines: [
            createConsoleLine("system", `Nivel cargado: ${level.title}.`),
            createConsoleLine("hint", level.objective)
          ]
        });
      },

      runCode: () => {
        const state = get();
        const level = getLevelById(state.currentLevelId);
        set({
          runStatus: "running",
          consoleLines: [
            ...state.consoleLines,
            createConsoleLine("system", "Señal enviada.")
          ].slice(-28)
        });
        const result = executePlayerCode(state.code, level);

        if (result.ok) {
          get().handleSuccess(result);
          return;
        }

        get().handleFailure(result.error ?? level.failureNarrative, result.output);
      },

      handleSuccess: (result) => {
        const state = get();
        const level = getLevelById(state.currentLevelId);
        const nextLevel = getNextLevel(level.id);
        const updatedWorld = applyActionsToWorld(state.world, result.actions, level.id);
        const unlockedLevelId = nextLevel
          ? Math.max(state.unlockedLevelId, nextLevel.id)
          : state.unlockedLevelId;
        const consoleLines = getSuccessConsoleLines(
          state.consoleLines,
          result,
          level.id,
          level.title
        );

        set({
          world: updatedWorld,
          runStatus: "success",
          unlockedLevelId,
          attemptsByLevel: {
            ...state.attemptsByLevel,
            [level.id]: 0
          },
          checkpointsByLevel: {
            ...state.checkpointsByLevel,
            [level.id]: level.checkpointState,
            ...(nextLevel ? { [nextLevel.id]: nextLevel.checkpointState } : {})
          },
          consoleLines: nextLevel?.isPlayable
            ? consoleLines.slice(-28)
            : [
                ...consoleLines,
                createConsoleLine(
                  "hint",
                  "El siguiente nodo de la ruta está desbloqueado, pero solo los niveles 1 al 5 son totalmente jugables en este prototipo."
                )
              ].slice(-28)
        });

        if (nextLevel?.isPlayable) {
          window.setTimeout(() => {
            const latest = get();

            if (latest.currentLevelId === level.id) {
              latest.loadLevel(nextLevel.id);
            }
          }, level.id === 1 ? 9000 : 1600);
        }
      },

      handleFailure: (message, output = []) => {
        const state = get();
        const level = getLevelById(state.currentLevelId);
        const attempt = get().incrementAttempts(level.id);
        const outputLines = output.map((line) => createConsoleLine("output", line));
        const failedWorld: WorldState = {
          ...state.world,
          predators: state.world.predators.map((predator) => ({
            ...predator,
            visualState: "aiming"
          })),
          snake: {
            ...state.world.snake,
            health: 0,
            state: "dead",
            lifeStage: "dead"
          },
          lastAction: "failure",
          actionPulse: state.world.actionPulse + 1
        };

        if (attempt > level.maxAttempts) {
          const fallbackMessage =
            level.id === 1
              ? "El nivel 1 no tiene un checkpoint anterior. Se cargó una guía más clara."
              : "El instinto aún no está listo. Regresa, aprende y vuelve más fuerte.";

          set({
            world: failedWorld,
            runStatus: "failure",
            consoleLines: [
              ...state.consoleLines,
              ...outputLines,
              createConsoleLine("error", "Señal rechazada."),
              createConsoleLine("error", formatFailureMessage(level.id, message)),
              createConsoleLine("hint", fallbackMessage)
            ].slice(-28)
          });

          window.setTimeout(() => {
            if (level.id === 1) {
              const firstLevel = getLevelById(1);
              set({
                currentLevelId: 1,
                code: '# Exact guide\nprint("Hello World")',
                attemptsByLevel: {
                  ...get().attemptsByLevel,
                  [level.id]: 0
                },
                world: createWorldFromLevel(firstLevel),
                runStatus: "idle"
              });
              return;
            }

            get().goToPreviousLevel();
          }, 900);

          return;
        }

        set({
          world: failedWorld,
          runStatus: "failure",
          consoleLines: [
            ...state.consoleLines,
            ...outputLines,
            createConsoleLine("system", `Regresaste a ${level.title}.`),
            createConsoleLine("error", "Señal rechazada."),
            createConsoleLine("error", formatFailureMessage(level.id, message)),
            createConsoleLine("hint", `Pista: ${getHintForAttempt(level, attempt)}`),
            createConsoleLine("system", "Restaurando checkpoint...")
          ].slice(-28)
        });

        window.setTimeout(() => {
          if (get().currentLevelId === level.id) {
            set({
              world: createWorldFromSavedCheckpoint(level.id, get().checkpointsByLevel),
              runStatus: "checkpoint"
            });

            window.setTimeout(() => {
              if (get().currentLevelId === level.id && get().runStatus === "checkpoint") {
                set({ runStatus: "idle" });
              }
            }, 1350);
          }
        }, 850);
      },

      resetToCheckpoint: () => {
        const state = get();
        const level = getLevelById(state.currentLevelId);

        set({
          world: createWorldFromSavedCheckpoint(level.id, state.checkpointsByLevel),
          runStatus: "checkpoint",
          consoleLines: [
            ...state.consoleLines,
            createConsoleLine("system", `Restaurando checkpoint: ${level.title}.`)
          ].slice(-28)
        });
      },

      goToPreviousLevel: () => {
        const currentLevel = getLevelById(get().currentLevelId);
        const previousLevel = getPreviousLevel(currentLevel.id);
        const checkpointsByLevel = get().checkpointsByLevel;

        set({
          currentLevelId: previousLevel.id,
          code: previousLevel.starterCode,
          attemptsByLevel: {
            ...get().attemptsByLevel,
            [currentLevel.id]: 0
          },
          world: createWorldFromSavedCheckpoint(previousLevel.id, checkpointsByLevel),
          runStatus: "idle",
          consoleLines: [
            createConsoleLine("system", `Regresaste a ${previousLevel.title}.`),
            createConsoleLine(
              "hint",
              "El instinto aún no está listo. Regresa, aprende y vuelve más fuerte."
            )
          ]
        });
      },

      incrementAttempts: (levelId = get().currentLevelId) => {
        const state = get();
        const nextAttempt = (state.attemptsByLevel[levelId] ?? 0) + 1;

        set({
          attemptsByLevel: {
            ...state.attemptsByLevel,
            [levelId]: nextAttempt
          }
        });

        return nextAttempt;
      },

      resetProgress: () => {
        set({
          currentLevelId: initialLevel.id,
          unlockedLevelId: initialLevel.id,
          attemptsByLevel: {},
          checkpointsByLevel: {
            [initialLevel.id]: initialLevel.checkpointState
          },
          code: initialLevel.starterCode,
          world: createWorldFromLevel(initialLevel),
          consoleLines: initialConsole,
          runStatus: "idle"
        });
      }
    }),
    {
      name: "instinct-progress",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentLevelId: state.currentLevelId,
        unlockedLevelId: state.unlockedLevelId,
        attemptsByLevel: state.attemptsByLevel,
        checkpointsByLevel: state.checkpointsByLevel
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<GameStore>;
        const currentLevelId = saved.currentLevelId ?? current.currentLevelId;
        const level = getLevelById(currentLevelId);
        const checkpointsByLevel = {
          ...current.checkpointsByLevel,
          ...saved.checkpointsByLevel
        };

        return {
          ...current,
          ...saved,
          code: level.starterCode,
          world: createWorldFromSavedCheckpoint(level.id, checkpointsByLevel),
          consoleLines: [
            createConsoleLine("system", `Nivel cargado: ${level.title}.`),
            createConsoleLine("hint", level.objective)
          ],
          runStatus: "idle"
        };
      }
    }
  )
);

function createWorldFromSavedCheckpoint(
  levelId: number,
  checkpoints: Record<number, CheckpointState>
): WorldState {
  const level = getLevelById(levelId);
  const checkpoint = checkpoints[levelId] ?? level.checkpointState;
  const checkpointLevel = {
    ...level,
    checkpointState: {
      ...checkpoint,
      predators: checkpoint.predators.map((predator, index) => ({
        ...predator,
        kind: "hunter" as const,
        visualState:
          predator.visualState ?? (index % 2 === 0 ? "patrolling" : "searching")
      }))
    }
  };

  return createWorldFromLevel(checkpointLevel);
}

function getHintForAttempt(level: ReturnType<typeof getLevelById>, attempt: number) {
  if (attempt <= 1) {
    return level.hints.first;
  }

  if (attempt === 2) {
    return level.hints.second;
  }

  return level.hints.third;
}

function getSuccessConsoleLines(
  existingLines: ConsoleLine[],
  result: InterpreterResult,
  levelId: number,
  levelTitle: string
) {
  if (levelId === 1) {
    return [
      ...existingLines,
      createConsoleLine("success", "Señal aceptada."),
      ...result.output.map((line) => createConsoleLine("output", line)),
      createConsoleLine("success", "El cascarón empieza a romperse..."),
      createConsoleLine("success", "La cría logra salir."),
      createConsoleLine("system", `Checkpoint guardado: ${levelTitle}.`)
    ];
  }

  return [
    ...existingLines,
    createConsoleLine("success", "Señal aceptada."),
    ...result.output.map((line) => createConsoleLine("output", line)),
    createConsoleLine("success", getSuccessNarrative(levelId)),
    createConsoleLine("system", `Checkpoint guardado: ${levelTitle}.`)
  ];
}

function getSuccessNarrative(levelId: number) {
  if (levelId === 1) {
    return "El cascarón empieza a romperse...";
  }

  return "El instinto responde. La acción se completa.";
}

function formatFailureMessage(levelId: number, fallback: string) {
  if (levelId === 1) {
    return "El cascarón no reconoció la señal. Intenta imprimir exactamente \"Hello World\".";
  }

  return fallback;
}

function applyActionsToWorld(
  world: WorldState,
  actions: GameAction[],
  levelId: number
): WorldState {
  const nextWorld: WorldState = {
    ...world,
    snake: {
      ...world.snake
    },
    predators: [...world.predators],
    children: world.children.map((child) => ({ ...child })),
    egg: { ...world.egg },
    actionPulse: world.actionPulse + 1
  };

  for (const action of actions) {
    if (action.type === "print") {
      nextWorld.lastAction = "print";
      continue;
    }

    const amount = action.amount ?? 1;

    switch (action.type) {
      case "move_forward": {
        const distance = 0.56 * amount;
        nextWorld.snake.position = [
          nextWorld.snake.position[0] + Math.cos(nextWorld.snake.rotation) * distance,
          nextWorld.snake.position[1],
          nextWorld.snake.position[2] + Math.sin(nextWorld.snake.rotation) * distance
        ];
        nextWorld.snake.energy = clamp(nextWorld.snake.energy - 3 * amount, 0, 100);
        nextWorld.snake.state = "moving";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "patrolling");
        break;
      }

      case "turn_left":
        nextWorld.snake.rotation += Math.PI / 2;
        nextWorld.snake.state = "moving";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "patrolling");
        break;

      case "turn_right":
        nextWorld.snake.rotation -= Math.PI / 2;
        nextWorld.snake.state = "moving";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "patrolling");
        break;

      case "hide":
        nextWorld.snake.energy = clamp(nextWorld.snake.energy - 2, 0, 100);
        nextWorld.snake.state = "hiding";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "searching");
        break;

      case "bite":
        nextWorld.snake.venom = clamp(nextWorld.snake.venom - 2, 0, 100);
        nextWorld.snake.state = "attacking";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "stunned");
        break;

      case "hunt":
        nextWorld.snake.energy = clamp(nextWorld.snake.energy - 8, 0, 100);
        nextWorld.snake.venom = clamp(nextWorld.snake.venom + 1, 0, 100);
        nextWorld.snake.state = "attacking";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "chasing");
        break;

      case "rest":
        nextWorld.snake.energy = clamp(nextWorld.snake.energy + 12, 0, 100);
        nextWorld.snake.state = "idle";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "idle");
        break;

      case "sense_predator":
        nextWorld.snake.state = "hiding";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "searching");
        break;

      case "protect_child":
        nextWorld.children = nextWorld.children.map((child) => ({
          ...child,
          protected: true
        }));
        nextWorld.snake.state = "protecting_children";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "retreating");
        break;

      case "shed_skin":
        nextWorld.snake.skinVersion += 1;
        nextWorld.snake.state = "shedding";
        nextWorld.predators = setHunterVisualState(nextWorld.predators, "searching");
        break;
    }

    nextWorld.lastAction = action.type;
  }

  if (levelId === 1) {
    nextWorld.egg.cracked = true;
    nextWorld.egg.visible = true;
    nextWorld.lightLevel = 0.94;
    nextWorld.snake.lifeStage = "hatchling";
    nextWorld.snake.state = "newborn";
    nextWorld.snake.position = [0.56, 0.28, 0.72];
    nextWorld.snake.rotation = -0.72;
    nextWorld.snake.health = 100;
    nextWorld.snake.energy = 62;
    nextWorld.snake.venom = 4;
  }

  return nextWorld;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function setHunterVisualState(
  predators: WorldState["predators"],
  visualState: WorldState["predators"][number]["visualState"]
) {
  return predators.map((predator) => ({
    ...predator,
    visualState
  }));
}
