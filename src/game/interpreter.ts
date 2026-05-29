import type { CommandName, GameAction, Level } from "./entities";

export interface InterpreterResult {
  ok: boolean;
  actions: GameAction[];
  output: string[];
  error?: string;
}

type RuntimeValue = string | number | boolean;

type Trace = {
  variables: Record<string, RuntimeValue>;
  stringAssignments: Set<string>;
  numberAssignments: Set<string>;
  printArguments: string[];
  expandedCommandOrder: CommandName[];
};

const COMMANDS: CommandName[] = [
  "print",
  "move_forward",
  "turn_left",
  "turn_right",
  "hide",
  "bite",
  "hunt",
  "rest",
  "sense_predator",
  "protect_child",
  "shed_skin"
];

const ASSIGNMENT_PATTERN = /^([a-zA-Z_]\w*)\s*=\s*(.+)$/;
const CALL_PATTERN = /^([a-zA-Z_]\w*)\s*\((.*)\)$/;
const STRING_PATTERN = /^(['"])(.*)\1$/;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
const IDENTIFIER_PATTERN = /\b[a-zA-Z_]\w*\b/g;

export function executePlayerCode(code: string, level: Level): InterpreterResult {
  if (!level.isPlayable) {
    return {
      ok: false,
      actions: [],
      output: [],
      error: "Este nivel de la ruta ya está definido, pero su encuentro todavía no es jugable en el prototipo."
    };
  }

  const trace: Trace = {
    variables: {},
    stringAssignments: new Set(),
    numberAssignments: new Set(),
    printArguments: [],
    expandedCommandOrder: []
  };
  const actions: GameAction[] = [];
  const output: string[] = [];
  const errors: string[] = [];
  const lines = getExecutableLines(code);

  for (const line of lines) {
    try {
      const assignment = line.match(ASSIGNMENT_PATTERN);

      if (assignment) {
        const [, name, rawExpression] = assignment;
        const value = evaluateExpression(rawExpression, trace.variables);
        trace.variables[name] = value;

        if (typeof value === "string") {
          trace.stringAssignments.add(name);
        }

        if (typeof value === "number") {
          trace.numberAssignments.add(name);
        }

        continue;
      }

      const call = line.match(CALL_PATTERN);

      if (!call) {
        errors.push(`No pude entender la línea: ${line}`);
        continue;
      }

      const [, rawName, rawArgs] = call;
      const commandName = rawName as CommandName;

      if (!COMMANDS.includes(commandName)) {
        errors.push(`Comando desconocido: ${rawName}()`);
        continue;
      }

      if (!isCommandUnlocked(commandName, level.unlockedCommands)) {
        errors.push(`${rawName}() no está desbloqueado en este nivel.`);
        continue;
      }

      if (commandName === "print") {
        const value = evaluateExpression(rawArgs, trace.variables);
        trace.printArguments.push(rawArgs.trim());
        output.push(String(value));
        actions.push({ type: "print", value: String(value) });
        trace.expandedCommandOrder.push(commandName);
        continue;
      }

      const amount = getCommandAmount(rawArgs, trace.variables);
      actions.push({ type: commandName, amount });

      for (let index = 0; index < amount; index += 1) {
        trace.expandedCommandOrder.push(commandName);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      actions,
      output,
      error: errors.join(" ")
    };
  }

  const success = validateSuccess(level, output, trace);

  return {
    ok: success,
    actions,
    output,
    error: success ? undefined : buildFailureMessage(level)
  };
}

function getExecutableLines(code: string): string[] {
  return code
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean);
}

function isCommandUnlocked(commandName: CommandName, unlockedCommands: string[]) {
  if (commandName === "print") {
    return true;
  }

  return unlockedCommands.some(
    (command) => command.replace(/\(\)$/, "") === commandName
  );
}

function getCommandAmount(
  rawArgs: string,
  variables: Record<string, RuntimeValue>
): number {
  if (!rawArgs.trim()) {
    return 1;
  }

  const value = evaluateExpression(rawArgs, variables);

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("La cantidad de un comando debe ser numérica.");
  }

  return Math.max(1, Math.min(8, Math.floor(value)));
}

function evaluateExpression(
  rawExpression: string,
  variables: Record<string, RuntimeValue>
): RuntimeValue {
  const expression = rawExpression.trim();

  if (!expression) {
    return "";
  }

  const stringMatch = expression.match(STRING_PATTERN);

  if (stringMatch) {
    return stringMatch[2];
  }

  if (NUMBER_PATTERN.test(expression)) {
    return Number(expression);
  }

  if (expression === "True") {
    return true;
  }

  if (expression === "False") {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(variables, expression)) {
    return variables[expression];
  }

  return evaluateNumericExpression(expression, variables);
}

function evaluateNumericExpression(
  expression: string,
  variables: Record<string, RuntimeValue>
): number {
  const replaced = expression.replace(IDENTIFIER_PATTERN, (name) => {
    const value = variables[name];

    if (typeof value !== "number") {
      throw new Error(`La variable ${name} no es numérica.`);
    }

    return String(value);
  });

  if (!/^[\d\s+\-*/().]+$/.test(replaced)) {
    throw new Error(`Expresión no soportada: ${expression}`);
  }

  const result = Function(`"use strict"; return (${replaced});`)() as unknown;

  if (typeof result !== "number" || Number.isNaN(result)) {
    throw new Error(`La expresión no regresó un número: ${expression}`);
  }

  return result;
}

function validateSuccess(
  level: Level,
  output: string[],
  trace: Trace
): boolean {
  switch (level.successCondition) {
    case "prints_hello_world":
      return output.includes("Hello World");

    case "uses_string_and_print":
      return (
        trace.stringAssignments.has("breath") &&
        output.includes("I am alive") &&
        trace.printArguments.includes("breath")
      );

    case "moves_in_sequence":
      return (
        trace.expandedCommandOrder[0] === "move_forward" &&
        trace.expandedCommandOrder[1] === "move_forward" &&
        trace.expandedCommandOrder[2] === "turn_right"
      );

    case "uses_variable_to_move":
      return (
        trace.numberAssignments.has("steps") &&
        trace.variables.steps === 2 &&
        countCommand(trace, "move_forward") >= 2 &&
        trace.printArguments.includes("steps")
      );

    case "uses_numbers_to_hunt":
      return (
        trace.numberAssignments.has("energy") &&
        trace.numberAssignments.has("venom") &&
        trace.variables.energy === 5 &&
        trace.variables.venom === 2 &&
        countCommand(trace, "hunt") >= 1 &&
        countCommand(trace, "bite") >= 1
      );

    case "roadmap_locked":
      return false;
  }
}

function countCommand(trace: Trace, commandName: CommandName): number {
  return trace.expandedCommandOrder.filter((command) => command === commandName)
    .length;
}

function buildFailureMessage(level: Level): string {
  const patterns = level.expectedPatterns.join(", ");
  return `Patrón incompleto en ${level.title}. Se esperaba: ${patterns}.`;
}
