export type Vector3Tuple = [number, number, number];

export type SnakeLifeStage =
  | "egg"
  | "hatchling"
  | "juvenile"
  | "adult"
  | "elder"
  | "dead";

export type SnakeVisualState =
  | "egg"
  | "newborn"
  | "idle"
  | "moving"
  | "hiding"
  | "attacking"
  | "shedding"
  | "protecting_children"
  | "old"
  | "dead";

export type SnakeCondition = SnakeVisualState;

export type HunterVisualState =
  | "idle"
  | "patrolling"
  | "searching"
  | "chasing"
  | "aiming"
  | "stunned"
  | "retreating";

export type PredatorKind = "bird" | "mongoose" | "hunter" | "drone";

export type PredatorBehavior = "patrol" | "stalk" | "circle" | "scan";

export type ConsoleLineType = "system" | "output" | "success" | "error" | "hint";

export type CommandName =
  | "print"
  | "move_forward"
  | "turn_left"
  | "turn_right"
  | "hide"
  | "bite"
  | "hunt"
  | "rest"
  | "sense_predator"
  | "protect_child"
  | "shed_skin";

export type GameAction =
  | {
      type: "print";
      value: string;
    }
  | {
      type: Exclude<CommandName, "print">;
      amount?: number;
    };

export type SuccessCondition =
  | "prints_hello_world"
  | "uses_string_and_print"
  | "moves_in_sequence"
  | "uses_variable_to_move"
  | "uses_numbers_to_hunt"
  | "roadmap_locked";

export interface PredatorEntity {
  id: string;
  kind: PredatorKind;
  position: Vector3Tuple;
  detectionRange: number;
  behavior: PredatorBehavior;
  visualState: HunterVisualState;
  active: boolean;
}

export interface ChildEntity {
  id: string;
  position: Vector3Tuple;
  protected: boolean;
}

export interface SnakeEntity {
  position: Vector3Tuple;
  rotation: number;
  health: number;
  energy: number;
  venom: number;
  age: number;
  state: SnakeCondition;
  lifeStage: SnakeLifeStage;
  skinVersion: number;
}

export interface CheckpointState {
  snakePosition: Vector3Tuple;
  snakeHealth: number;
  snakeEnergy: number;
  snakeVenom: number;
  predators: PredatorEntity[];
  children?: ChildEntity[];
}

export interface Level {
  id: number;
  title: string;
  act: string;
  narrative: string;
  pythonConcept: string;
  objective: string;
  starterCode: string;
  expectedPatterns: string[];
  successCondition: SuccessCondition;
  unlockedCommands: string[];
  checkpointState: CheckpointState;
  maxAttempts: number;
  failureNarrative: string;
  hints: {
    first: string;
    second: string;
    third: string;
  };
  isPlayable: boolean;
}

export interface EggState {
  visible: boolean;
  cracked: boolean;
}

export interface WorldState {
  snake: SnakeEntity;
  predators: PredatorEntity[];
  children: ChildEntity[];
  egg: EggState;
  lightLevel: number;
  lastAction: string;
  actionPulse: number;
}

export interface ConsoleLine {
  id: string;
  type: ConsoleLineType;
  text: string;
}

export const basePredators: PredatorEntity[] = [
  {
    id: "lantern-hunter",
    kind: "hunter",
    position: [3.2, 0.25, -2.5],
    detectionRange: 4,
    behavior: "patrol",
    visualState: "patrolling",
    active: true
  },
  {
    id: "ridge-hunter",
    kind: "hunter",
    position: [-3.4, 0.25, 2.2],
    detectionRange: 3,
    behavior: "scan",
    visualState: "searching",
    active: true
  }
];

export function createSnakeFromCheckpoint(
  checkpoint: CheckpointState,
  levelId: number
): SnakeEntity {
  const lifeStage = getLifeStageForLevel(levelId);

  return {
    position: checkpoint.snakePosition,
    rotation: 0,
    health: checkpoint.snakeHealth,
    energy: checkpoint.snakeEnergy,
    venom: checkpoint.snakeVenom,
    age: Math.max(0, levelId - 1),
    state: levelId === 1 ? "egg" : levelId >= 41 ? "old" : "idle",
    lifeStage,
    skinVersion: levelId >= 20 ? 1 : 0
  };
}

export function createWorldFromLevel(level: Level): WorldState {
  return {
    snake: createSnakeFromCheckpoint(level.checkpointState, level.id),
    predators: level.checkpointState.predators,
    children: level.checkpointState.children ?? [],
    egg: {
      visible: level.id === 1,
      cracked: false
    },
    lightLevel: level.id === 1 ? 0.58 : 0.82,
    lastAction: "checkpoint",
    actionPulse: 0
  };
}

export function getLifeStageForLevel(levelId: number): SnakeLifeStage {
  if (levelId === 1) {
    return "egg";
  }

  if (levelId < 11) {
    return "hatchling";
  }

  if (levelId < 31) {
    return "juvenile";
  }

  if (levelId < 41) {
    return "adult";
  }

  return "elder";
}

export function createConsoleLine(
  type: ConsoleLineType,
  text: string
): ConsoleLine {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    text
  };
}
