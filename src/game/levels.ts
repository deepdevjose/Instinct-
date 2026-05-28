import { basePredators, type CheckpointState, type Level } from "./entities";

const MAX_ATTEMPTS = 3;

function checkpoint(
  snakePosition: CheckpointState["snakePosition"],
  options: Partial<CheckpointState> = {}
): CheckpointState {
  return {
    snakePosition,
    snakeHealth: options.snakeHealth ?? 100,
    snakeEnergy: options.snakeEnergy ?? 82,
    snakeVenom: options.snakeVenom ?? 28,
    predators: options.predators ?? basePredators,
    children: options.children
  };
}

const playableLevels: Level[] = [
  {
    id: 1,
    title: "The Egg",
    act: "ACT I - Birth",
    narrative:
      "Under cold soil, an egg waits for the first signal. Before movement, there is output.",
    pythonConcept:
      "print() sends text to the console. It is the first way code speaks back.",
    objective: 'Print "Hello World" to wake the shell.',
    starterCode: '# Wake the shell\nprint("Hello World")',
    expectedPatterns: ['print("Hello World")', "print('Hello World')"],
    successCondition: "prints_hello_world",
    unlockedCommands: ["print()"],
    checkpointState: checkpoint([0, 0.18, 0], {
      snakeEnergy: 50,
      snakeVenom: 0,
      predators: []
    }),
    maxAttempts: MAX_ATTEMPTS,
    failureNarrative:
      "The egg cools again. The signal was close, but not alive enough.",
    hints: {
      first: 'The shell reacts to exact text: "Hello World".',
      second: 'Use print() with the text inside quotes.',
      third: 'Write exactly: print("Hello World")'
    },
    isPlayable: true
  },
  {
    id: 2,
    title: "First Breath",
    act: "ACT I - Birth",
    narrative:
      "Air touches new scales. The hatchling needs a name for the first thing it feels.",
    pythonConcept:
      "Strings are text values. Store them in variables when the same signal matters again.",
    objective: 'Create a string called breath and print it.',
    starterCode: 'breath = ""\nprint(breath)',
    expectedPatterns: ['breath = "I am alive"', "print(breath)"],
    successCondition: "uses_string_and_print",
    unlockedCommands: ["print()"],
    checkpointState: checkpoint([0.4, 0.2, 0], {
      snakeEnergy: 62,
      snakeVenom: 4,
      predators: []
    }),
    maxAttempts: MAX_ATTEMPTS,
    failureNarrative:
      "The hatchling opens its mouth, but the breath has no shape yet.",
    hints: {
      first: "A string needs quotes around its text.",
      second: 'Set breath to "I am alive" before printing it.',
      third: 'Use:\nbreath = "I am alive"\nprint(breath)'
    },
    isPlayable: true
  },
  {
    id: 3,
    title: "First Movement",
    act: "ACT I - Birth",
    narrative:
      "The nest is no longer safe. Survival begins as a sequence of small decisions.",
    pythonConcept:
      "Programs run line by line. Order matters when each command changes the world.",
    objective: "Move twice, then turn right toward the grass.",
    starterCode: "# Move through the nest\nmove_forward()\n",
    expectedPatterns: ["move_forward()", "move_forward()", "turn_right()"],
    successCondition: "moves_in_sequence",
    unlockedCommands: ["print()", "move_forward()", "turn_right()"],
    checkpointState: checkpoint([0.4, 0.2, 0.2], {
      snakeEnergy: 72,
      snakeVenom: 8,
      predators: []
    }),
    maxAttempts: MAX_ATTEMPTS,
    failureNarrative:
      "The hatchling twitches in place. Movement without sequence is only panic.",
    hints: {
      first: "The first two action lines should both move forward.",
      second: "After two moves, add a right turn.",
      third: "Use:\nmove_forward()\nmove_forward()\nturn_right()"
    },
    isPlayable: true
  },
  {
    id: 4,
    title: "Grass Instinct",
    act: "ACT I - Birth",
    narrative:
      "Tall grass breaks the line of sight. The hatchling learns to remember a useful number.",
    pythonConcept:
      "Variables store values. A name like steps can hold a number that guides later code.",
    objective: "Store steps as a number, move twice, and print the stored value.",
    starterCode: "steps = 0\nmove_forward()\nprint(steps)",
    expectedPatterns: ["steps = 2", "move_forward()", "print(steps)"],
    successCondition: "uses_variable_to_move",
    unlockedCommands: ["print()", "move_forward()", "turn_left()", "turn_right()"],
    checkpointState: checkpoint([1.1, 0.2, 0.2], {
      snakeEnergy: 76,
      snakeVenom: 10,
      predators: [basePredators[0]]
    }),
    maxAttempts: MAX_ATTEMPTS,
    failureNarrative:
      "The grass rustles too loudly. The number was not useful enough to guide the body.",
    hints: {
      first: "A variable can remember how many steps you intend to take.",
      second: "Set steps to 2, then call move_forward twice.",
      third: "Use:\nsteps = 2\nmove_forward()\nmove_forward()\nprint(steps)"
    },
    isPlayable: true
  },
  {
    id: 5,
    title: "Tiny Hunter",
    act: "ACT I - Birth",
    narrative:
      "A beetle crosses the wet soil. Hunger becomes arithmetic, then action.",
    pythonConcept:
      "Numbers can describe energy, venom, distance, and risk before the body commits.",
    objective: "Define numeric energy and venom, then hunt and bite.",
    starterCode: "energy = 0\nvenom = 0\nhunt()\n",
    expectedPatterns: ["energy = 5", "venom = 2", "hunt()", "bite()"],
    successCondition: "uses_numbers_to_hunt",
    unlockedCommands: [
      "print()",
      "move_forward()",
      "turn_left()",
      "turn_right()",
      "hunt()",
      "bite()",
      "rest()"
    ],
    checkpointState: checkpoint([1.8, 0.2, -0.5], {
      snakeEnergy: 70,
      snakeVenom: 16,
      predators: [basePredators[0]]
    }),
    maxAttempts: MAX_ATTEMPTS,
    failureNarrative:
      "The strike misses. Hunger without numbers wastes more than it wins.",
    hints: {
      first: "Use number assignments before the hunting commands.",
      second: "Set energy to 5 and venom to 2, then call hunt() and bite().",
      third: "Use:\nenergy = 5\nvenom = 2\nhunt()\nbite()"
    },
    isPlayable: true
  }
];

type RoadmapSeed = {
  id: number;
  title: string;
  act: string;
  concept: string;
  objective: string;
  commands?: string[];
};

const roadmapSeeds: RoadmapSeed[] = [
  {
    id: 6,
    title: "Fixed Signal",
    act: "ACT I - Birth",
    concept: "Constants",
    objective: "Use an uppercase constant to store a safe signal.",
    commands: ["print()", "move_forward()"]
  },
  {
    id: 7,
    title: "Counting Steps",
    act: "ACT I - Birth",
    concept: "Arithmetic expressions",
    objective: "Add and subtract numbers to choose a movement distance."
  },
  {
    id: 8,
    title: "The River",
    act: "ACT I - Birth",
    concept: "Comparison operators",
    objective: "Compare depth and energy before crossing."
  },
  {
    id: 9,
    title: "Shadow Above",
    act: "ACT I - Birth",
    concept: "if / else",
    objective: "Choose hide or move from a predator signal.",
    commands: ["hide()", "sense_predator()"]
  },
  {
    id: 10,
    title: "The Tall Grass",
    act: "ACT I - Birth",
    concept: "Boolean logic",
    objective: "Combine true and false signals to enter cover."
  },
  {
    id: 11,
    title: "Endless Hunger",
    act: "ACT II - Survival",
    concept: "while loops",
    objective: "Repeat a hunt while hunger remains.",
    commands: ["hunt()", "bite()", "rest()"]
  },
  {
    id: 12,
    title: "Hunting Pattern",
    act: "ACT II - Survival",
    concept: "for loops and range()",
    objective: "Use range() to repeat a path a known number of times."
  },
  {
    id: 13,
    title: "Repeated Escape",
    act: "ACT II - Survival",
    concept: "break / continue",
    objective: "Stop or skip a loop when the route becomes dangerous.",
    commands: ["move_forward()", "turn_left()", "hide()"]
  },
  {
    id: 14,
    title: "The Burrow",
    act: "ACT II - Survival",
    concept: "Functions",
    objective: "Wrap a safe behavior inside a named function."
  },
  {
    id: 15,
    title: "Strike",
    act: "ACT II - Survival",
    concept: "Parameters",
    objective: "Send distance and force into a strike function.",
    commands: ["bite()"]
  },
  {
    id: 16,
    title: "Venom Efficiency",
    act: "ACT II - Survival",
    concept: "return values",
    objective: "Return the best venom cost for a target."
  },
  {
    id: 17,
    title: "Hidden Scope",
    act: "ACT II - Survival",
    concept: "Variable scope",
    objective: "Keep local decisions inside the function that owns them."
  },
  {
    id: 18,
    title: "Scent Marks",
    act: "ACT II - Survival",
    concept: "String methods",
    objective: "Clean and compare text signals before acting."
  },
  {
    id: 19,
    title: "Food Trail",
    act: "ACT II - Survival",
    concept: "Lists",
    objective: "Store several discovered food positions in order."
  },
  {
    id: 20,
    title: "Shed",
    act: "ACT II - Survival",
    concept: "List methods",
    objective: "Append, remove, and sort survival clues before the first shed.",
    commands: ["shed_skin()"]
  },
  {
    id: 21,
    title: "Fixed Tracks",
    act: "ACT III - Evolution",
    concept: "Tuples",
    objective: "Represent positions that should not change."
  },
  {
    id: 22,
    title: "Hunter Camps",
    act: "ACT III - Evolution",
    concept: "Dictionaries",
    objective: "Map danger zones to behavior."
  },
  {
    id: 23,
    title: "Toxic Marsh",
    act: "ACT III - Evolution",
    concept: "Sets",
    objective: "Keep unique safe tiles while ignoring duplicates."
  },
  {
    id: 24,
    title: "Memory Trails",
    act: "ACT III - Evolution",
    concept: "Iteration patterns",
    objective: "Loop through remembered positions and choose the safest one."
  },
  {
    id: 25,
    title: "Clean Route",
    act: "ACT III - Evolution",
    concept: "List comprehensions",
    objective: "Build a filtered path from many possible tiles."
  },
  {
    id: 26,
    title: "River Input",
    act: "ACT III - Evolution",
    concept: "Input parsing",
    objective: "Convert incoming text into numbers before deciding."
  },
  {
    id: 27,
    title: "Storm",
    act: "ACT III - Evolution",
    concept: "try / except",
    objective: "Recover when a sensed path fails."
  },
  {
    id: 28,
    title: "Borrowed Instinct",
    act: "ACT III - Evolution",
    concept: "Modules and imports",
    objective: "Import a helper instinct instead of rewriting it."
  },
  {
    id: 29,
    title: "Written Trail",
    act: "ACT III - Evolution",
    concept: "Files",
    objective: "Read and write a trail memory for later."
  },
  {
    id: 30,
    title: "Alpha Snake",
    act: "ACT III - Evolution",
    concept: "Debugging",
    objective: "Inspect the failing signal and repair the route."
  },
  {
    id: 31,
    title: "Nest",
    act: "ACT IV - Legacy",
    concept: "Classes",
    objective: "Create a Snake class for the next generation.",
    commands: ["protect_child()"]
  },
  {
    id: 32,
    title: "Eggs",
    act: "ACT IV - Legacy",
    concept: "Objects and instances",
    objective: "Create several egg instances."
  },
  {
    id: 33,
    title: "Protect The Young",
    act: "ACT IV - Legacy",
    concept: "Methods",
    objective: "Give each child object an action it can perform.",
    commands: ["protect_child()", "hide()"]
  },
  {
    id: 34,
    title: "Teaching Instinct",
    act: "ACT IV - Legacy",
    concept: "Inheritance",
    objective: "Pass survival behavior into a subclass."
  },
  {
    id: 35,
    title: "Family Pattern",
    act: "ACT IV - Legacy",
    concept: "Composition",
    objective: "Build a family system from smaller objects."
  },
  {
    id: 36,
    title: "Recursive Bloodline",
    act: "ACT IV - Legacy",
    concept: "Recursion",
    objective: "Model lineage as a recursive chain."
  },
  {
    id: 37,
    title: "Migration",
    act: "ACT IV - Legacy",
    concept: "Algorithms",
    objective: "Move a family through a mapped route."
  },
  {
    id: 38,
    title: "Hunter Drones",
    act: "ACT IV - Legacy",
    concept: "Pathfinding",
    objective: "Route around scanning machines.",
    commands: ["sense_predator()", "hide()"]
  },
  {
    id: 39,
    title: "The Last Shed",
    act: "ACT IV - Legacy",
    concept: "Optimization",
    objective: "Make an old instinct leaner.",
    commands: ["shed_skin()"]
  },
  {
    id: 40,
    title: "Aging",
    act: "ACT IV - Legacy",
    concept: "State machines",
    objective: "Update body state over time."
  },
  {
    id: 41,
    title: "Saved Memory",
    act: "ACT V - Death",
    concept: "Data persistence",
    objective: "Save the final route so the bloodline remembers it."
  },
  {
    id: 42,
    title: "Fading Vision",
    act: "ACT V - Death",
    concept: "Testing and assertions",
    objective: "Prove the old instinct still works before moving."
  },
  {
    id: 43,
    title: "Final Nest",
    act: "ACT V - Death",
    concept: "Refactoring",
    objective: "Simplify inherited behavior before passing it on.",
    commands: ["protect_child()"]
  },
  {
    id: 44,
    title: "The Last Hunt",
    act: "ACT V - Death",
    concept: "Integrated challenge",
    objective: "Use every learned instinct in one final route."
  },
  {
    id: 45,
    title: "Instinct()",
    act: "ACT V - Death",
    concept: "Capstone project",
    objective: "End the life cycle by shipping a complete survival program."
  }
];

const roadmapLevels: Level[] = roadmapSeeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  act: seed.act,
  narrative:
    "This memory waits in the roadmap. It is designed, but its full encounter is reserved for the next prototype pass.",
  pythonConcept: seed.concept,
  objective: seed.objective,
  starterCode: `# Roadmap node: ${seed.title}\n# Full logic arrives in the next build.`,
  expectedPatterns: [seed.concept],
  successCondition: "roadmap_locked",
  unlockedCommands: [
    "print()",
    "move_forward()",
    "turn_left()",
    "turn_right()",
    ...(seed.commands ?? [])
  ],
  checkpointState: checkpoint(
    [1 + seed.id * 0.08, 0.2, -0.8 + (seed.id % 5) * 0.35],
    {
      snakeHealth: seed.id > 40 ? 68 : 92,
      snakeEnergy: seed.id > 40 ? 42 : 78,
      snakeVenom: seed.id > 40 ? 18 : 34,
      predators: seed.id > 30 ? [...basePredators] : [basePredators[seed.id % 2]],
      children:
        seed.id >= 31
          ? [
              {
                id: `child-${seed.id}`,
                position: [0.8, 0.2, 0.9],
                protected: false
              }
            ]
          : undefined
    }
  ),
  maxAttempts: MAX_ATTEMPTS,
  failureNarrative:
    "The future lesson rejects the pattern for now. Return when this encounter is active.",
  hints: {
    first: "This node is present so the full learning path can be seen.",
    second: "The current prototype makes levels 1 through 5 fully playable.",
    third: "Advance through the playable arc, then use this as roadmap context."
  },
  isPlayable: false
}));

export const levels: Level[] = [...playableLevels, ...roadmapLevels];

export function getLevelById(levelId: number): Level {
  return levels.find((level) => level.id === levelId) ?? levels[0];
}

export function getNextLevel(levelId: number): Level | undefined {
  return levels.find((level) => level.id === levelId + 1);
}

export function getPreviousLevel(levelId: number): Level {
  return getLevelById(Math.max(1, levelId - 1));
}
