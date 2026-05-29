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
    title: "El Cascarón",
    act: "ACTO I - Nacimiento",
    narrative:
      "Bajo la tierra fría, algo vivo espera una señal. Antes de moverse, la cría debe aprender a responder.",
    pythonConcept:
      "print() envía texto a la consola. Es la primera forma en la que tu código te contesta.",
    studyNotes: [
      'Usa print() para mostrar texto en la consola.',
      'El texto debe ir entre comillas: "Hello World".',
      "Python distingue mayúsculas, minúsculas y espacios cuando validamos una señal exacta."
    ],
    objective: 'Imprime "Hello World" para abrir el cascarón.',
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
      "El cascarón se queda quieto. La señal estuvo cerca, pero todavía no despierta vida.",
    hints: {
      first: 'El cascarón reacciona al texto exacto: "Hello World".',
      second: "Usa print() y coloca el texto dentro de comillas.",
      third: 'Escribe exactamente: print("Hello World")'
    },
    isPlayable: true
  },
  {
    id: 2,
    title: "Primer Aliento",
    act: "ACTO I - Nacimiento",
    narrative:
      "El aire toca escamas nuevas. La cría necesita nombrar lo primero que siente.",
    pythonConcept:
      "Un string es texto. Puedes guardarlo en una variable para reutilizarlo después.",
    studyNotes: [
      "Una variable guarda un valor con un nombre.",
      'Un string siempre va entre comillas, por ejemplo: "I am alive".',
      "Después de guardar el valor, imprime la variable con print(breath)."
    ],
    objective: "Crea un string llamado breath e imprímelo.",
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
      "La cría abre la boca, pero el aliento todavía no tiene forma.",
    hints: {
      first: "Un string necesita comillas alrededor del texto.",
      second: 'Asigna breath = "I am alive" antes de imprimirlo.',
      third: 'Usa:\nbreath = "I am alive"\nprint(breath)'
    },
    isPlayable: true
  },
  {
    id: 3,
    title: "Salir del Nido",
    act: "ACTO I - Nacimiento",
    narrative:
      "El nido dejó de ser refugio. Sobrevivir empieza con una secuencia limpia de decisiones pequeñas.",
    pythonConcept:
      "Los programas se ejecutan línea por línea. El orden importa porque cada comando cambia el mundo.",
    studyNotes: [
      "Python ejecuta la primera línea, luego la segunda, luego la tercera.",
      "Si repites una función, la acción también se repite.",
      "Para este nivel necesitas dos move_forward() y después turn_right()."
    ],
    objective: "Avanza dos veces y luego gira a la derecha hacia la cobertura.",
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
      "La cría se mueve sin avanzar. Movimiento sin secuencia es puro pánico.",
    hints: {
      first: "Las dos primeras acciones deben avanzar.",
      second: "Después de dos avances, agrega un giro a la derecha.",
      third: "Usa:\nmove_forward()\nmove_forward()\nturn_right()"
    },
    isPlayable: true
  },
  {
    id: 4,
    title: "Entre la Maleza",
    act: "ACTO I - Nacimiento",
    narrative:
      "La maleza alta corta la mirada del cazador. La cría aprende a guardar un número antes de moverse.",
    pythonConcept:
      "Las variables guardan valores. Un nombre como steps puede guardar un número para usarlo después.",
    studyNotes: [
      "Una asignación se escribe como nombre = valor.",
      "Si steps vale 2, puedes usar ese número como memoria de tu plan.",
      "El juego espera que guardes 2, avances dos veces e imprimas steps."
    ],
    objective: "Guarda steps como número, avanza dos veces e imprime ese valor para cruzar la maleza.",
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
      "La maleza se mueve de más. El número no guió bien el cuerpo.",
    hints: {
      first: "Una variable puede recordar cuántos pasos planeas dar.",
      second: "Pon steps en 2 y llama move_forward dos veces.",
      third: "Usa:\nsteps = 2\nmove_forward()\nmove_forward()\nprint(steps)"
    },
    isPlayable: true
  },
  {
    id: 5,
    title: "Primer Bocado",
    act: "ACTO I - Nacimiento",
    narrative:
      "Algo se mueve entre la tierra húmeda. El hambre se vuelve aritmética, luego ataque.",
    pythonConcept:
      "Los números describen energía, veneno, distancia y riesgo antes de actuar.",
    studyNotes: [
      "Los enteros son números sin comillas, por ejemplo: energy = 5.",
      "Puedes preparar datos antes de ejecutar acciones.",
      "Este nivel valida energy, venom, hunt() y bite() en ese flujo."
    ],
    objective: "Define energy y venom como números; luego caza y muerde.",
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
      "El ataque falla. Hambre sin números gasta más de lo que gana.",
    hints: {
      first: "Usa asignaciones numéricas antes de los comandos de caza.",
      second: "Pon energy en 5 y venom en 2; luego llama hunt() y bite().",
      third: "Usa:\nenergy = 5\nvenom = 2\nhunt()\nbite()"
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
    title: "Señal Fija",
    act: "ACTO I - Nacimiento",
    concept: "Constantes",
    objective: "Usa una constante en mayúsculas para guardar una señal segura.",
    commands: ["print()", "move_forward()"]
  },
  {
    id: 7,
    title: "Cuenta de Pasos",
    act: "ACTO I - Nacimiento",
    concept: "Expresiones aritméticas",
    objective: "Suma y resta números para elegir una distancia de movimiento."
  },
  {
    id: 8,
    title: "Cruce del Río",
    act: "ACTO I - Nacimiento",
    concept: "Operadores de comparación",
    objective: "Compara profundidad y energía antes de cruzar."
  },
  {
    id: 9,
    title: "Sombra en el Cielo",
    act: "ACTO I - Nacimiento",
    concept: "if / else",
    objective: "Elige esconderte o moverte según la señal del depredador.",
    commands: ["hide()", "sense_predator()"]
  },
  {
    id: 10,
    title: "Cobertura Verde",
    act: "ACTO I - Nacimiento",
    concept: "Lógica booleana",
    objective: "Combina señales true y false para entrar en cobertura."
  },
  {
    id: 11,
    title: "Hambre Persistente",
    act: "ACTO II - Supervivencia",
    concept: "Ciclos while",
    objective: "Repite una caza mientras siga el hambre.",
    commands: ["hunt()", "bite()", "rest()"]
  },
  {
    id: 12,
    title: "Ruta de Caza",
    act: "ACTO II - Supervivencia",
    concept: "Ciclos for y range()",
    objective: "Usa range() para repetir una ruta un número conocido de veces."
  },
  {
    id: 13,
    title: "Escape en Bucle",
    act: "ACTO II - Supervivencia",
    concept: "break / continue",
    objective: "Detén o salta una vuelta del ciclo cuando la ruta se vuelva peligrosa.",
    commands: ["move_forward()", "turn_left()", "hide()"]
  },
  {
    id: 14,
    title: "Refugio Bajo Tierra",
    act: "ACTO II - Supervivencia",
    concept: "Funciones",
    objective: "Encapsula una conducta segura dentro de una función con nombre."
  },
  {
    id: 15,
    title: "La Mordida",
    act: "ACTO II - Supervivencia",
    concept: "Parámetros",
    objective: "Envía distancia y fuerza a una función de ataque.",
    commands: ["bite()"]
  },
  {
    id: 16,
    title: "Veneno Exacto",
    act: "ACTO II - Supervivencia",
    concept: "Valores return",
    objective: "Devuelve el mejor costo de veneno para un objetivo."
  },
  {
    id: 17,
    title: "Territorio Local",
    act: "ACTO II - Supervivencia",
    concept: "Scope de variables",
    objective: "Mantén decisiones locales dentro de la función que las controla."
  },
  {
    id: 18,
    title: "Rastro de Olor",
    act: "ACTO II - Supervivencia",
    concept: "Métodos de string",
    objective: "Limpia y compara señales de texto antes de actuar."
  },
  {
    id: 19,
    title: "Rastro de Comida",
    act: "ACTO II - Supervivencia",
    concept: "Listas",
    objective: "Guarda varias posiciones de comida en orden."
  },
  {
    id: 20,
    title: "Primera Muda",
    act: "ACTO II - Supervivencia",
    concept: "Métodos de lista",
    objective: "Agrega, elimina y ordena pistas antes de mudar piel.",
    commands: ["shed_skin()"]
  },
  {
    id: 21,
    title: "Huellas Fijas",
    act: "ACTO III - Evolución",
    concept: "Tuplas",
    objective: "Representa posiciones que no deberían cambiar."
  },
  {
    id: 22,
    title: "Campamentos de Cazadores",
    act: "ACTO III - Evolución",
    concept: "Diccionarios",
    objective: "Relaciona zonas de peligro con comportamientos."
  },
  {
    id: 23,
    title: "Pantano Tóxico",
    act: "ACTO III - Evolución",
    concept: "Sets",
    objective: "Conserva casillas seguras únicas e ignora duplicados."
  },
  {
    id: 24,
    title: "Mapa de Memoria",
    act: "ACTO III - Evolución",
    concept: "Patrones de iteración",
    objective: "Recorre posiciones recordadas y elige la más segura."
  },
  {
    id: 25,
    title: "Paso Seguro",
    act: "ACTO III - Evolución",
    concept: "List comprehensions",
    objective: "Construye una ruta filtrada desde muchas casillas posibles."
  },
  {
    id: 26,
    title: "Lectura del Río",
    act: "ACTO III - Evolución",
    concept: "Parseo de input",
    objective: "Convierte texto recibido en números antes de decidir."
  },
  {
    id: 27,
    title: "Tormenta",
    act: "ACTO III - Evolución",
    concept: "try / except",
    objective: "Recupérate cuando una ruta detectada falla."
  },
  {
    id: 28,
    title: "Herramienta Prestada",
    act: "ACTO III - Evolución",
    concept: "Módulos e imports",
    objective: "Importa un instinto auxiliar en vez de reescribirlo."
  },
  {
    id: 29,
    title: "Memoria Escrita",
    act: "ACTO III - Evolución",
    concept: "Archivos",
    objective: "Lee y escribe una memoria de ruta para después."
  },
  {
    id: 30,
    title: "Ruta Rota",
    act: "ACTO III - Evolución",
    concept: "Debugging",
    objective: "Inspecciona la señal fallida y repara la ruta."
  },
  {
    id: 31,
    title: "El Nuevo Nido",
    act: "ACTO IV - Legado",
    concept: "Clases",
    objective: "Crea una clase Snake para la siguiente generación.",
    commands: ["protect_child()"]
  },
  {
    id: 32,
    title: "Huevos",
    act: "ACTO IV - Legado",
    concept: "Objetos e instancias",
    objective: "Crea varias instancias de huevo."
  },
  {
    id: 33,
    title: "Guardia del Nido",
    act: "ACTO IV - Legado",
    concept: "Métodos",
    objective: "Dale a cada objeto cría una acción que pueda ejecutar.",
    commands: ["protect_child()", "hide()"]
  },
  {
    id: 34,
    title: "Herencia Viva",
    act: "ACTO IV - Legado",
    concept: "Herencia",
    objective: "Pasa comportamiento de supervivencia a una subclase."
  },
  {
    id: 35,
    title: "Patrón Familiar",
    act: "ACTO IV - Legado",
    concept: "Composición",
    objective: "Construye un sistema familiar con objetos pequeños."
  },
  {
    id: 36,
    title: "Linaje Infinito",
    act: "ACTO IV - Legado",
    concept: "Recursión",
    objective: "Modela el linaje como una cadena recursiva."
  },
  {
    id: 37,
    title: "Migración",
    act: "ACTO IV - Legado",
    concept: "Algoritmos",
    objective: "Mueve una familia a través de una ruta mapeada."
  },
  {
    id: 38,
    title: "Máquinas de Rastreo",
    act: "ACTO IV - Legado",
    concept: "Pathfinding",
    objective: "Rodea máquinas de escaneo con una ruta segura.",
    commands: ["sense_predator()", "hide()"]
  },
  {
    id: 39,
    title: "La Última Muda",
    act: "ACTO IV - Legado",
    concept: "Optimización",
    objective: "Haz más ligero un instinto viejo.",
    commands: ["shed_skin()"]
  },
  {
    id: 40,
    title: "Cuerpo Viejo",
    act: "ACTO IV - Legado",
    concept: "Máquinas de estado",
    objective: "Actualiza el estado del cuerpo con el tiempo."
  },
  {
    id: 41,
    title: "Memoria del Linaje",
    act: "ACTO V - Muerte",
    concept: "Persistencia de datos",
    objective: "Guarda la ruta final para que el linaje la recuerde."
  },
  {
    id: 42,
    title: "Vista Cansada",
    act: "ACTO V - Muerte",
    concept: "Testing y assertions",
    objective: "Demuestra que el instinto viejo aún funciona antes de moverte."
  },
  {
    id: 43,
    title: "Último Refugio",
    act: "ACTO V - Muerte",
    concept: "Refactoring",
    objective: "Simplifica comportamiento heredado antes de pasarlo.",
    commands: ["protect_child()"]
  },
  {
    id: 44,
    title: "La Última Caza",
    act: "ACTO V - Muerte",
    concept: "Reto integrado",
    objective: "Usa cada instinto aprendido en una ruta final."
  },
  {
    id: 45,
    title: "Legado Final",
    act: "ACTO V - Muerte",
    concept: "Proyecto final",
    objective: "Cierra el ciclo de vida entregando un programa completo de supervivencia."
  }
];

const roadmapLevels: Level[] = roadmapSeeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  act: seed.act,
  narrative:
    "Esta memoria espera en la ruta. Ya está planeada, pero su encuentro completo llegará en una siguiente versión.",
  pythonConcept: seed.concept,
  studyNotes: [
    `Tema principal: ${seed.concept}.`,
    "Lee el objetivo y ubica qué herramienta de Python necesitas practicar.",
    "Este nodo existe para que veas la ruta completa de aprendizaje."
  ],
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
    "La lección futura todavía no acepta este patrón. Vuelve cuando el encuentro esté activo.",
  hints: {
    first: "Este nodo está presente para mostrar la ruta completa de aprendizaje.",
    second: "Este prototipo hace jugables los niveles 1 al 5.",
    third: "Avanza por el arco jugable y usa esto como contexto de la ruta."
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
