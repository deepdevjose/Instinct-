import { AlertTriangle, CheckCircle2, Terminal } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ConsoleLine } from "../game/entities";

interface ConsoleProps {
  lines: ConsoleLine[];
  compact?: boolean;
  className?: string;
}

const iconByType = {
  system: Terminal,
  output: Terminal,
  success: CheckCircle2,
  error: AlertTriangle,
  hint: Terminal
};

const colorByType = {
  system: "text-bone/58",
  output: "text-bone",
  success: "text-venom",
  error: "text-red-300",
  hint: "text-ember"
};

export default function Console({ lines, compact = false, className = "" }: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [lines]);

  return (
    <section
      className={`hud-panel-muted flex min-h-0 flex-col rounded-lg ${className}`}
    >
      <div
        className={`flex items-center gap-2 border-b border-[#6e5630]/35 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#d8b574]/60 ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <Terminal className="h-4 w-4 text-venom" />
        Console
      </div>
      <div
        ref={scrollRef}
        className={`thin-scrollbar flex-1 space-y-2 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed ${
          compact ? "max-h-28 min-h-[72px]" : "min-h-[140px]"
        }`}
      >
        {lines.map((line, index) => {
          const Icon = iconByType[line.type];
          const isImportant = line.type === "success" || line.type === "error" || line.type === "output";

          return (
            <div
              key={line.id}
              className={`flex gap-2 rounded-md px-1.5 py-1 ${colorByType[line.type]} ${
                compact && index === 0 ? "opacity-[0.58]" : ""
              } ${
                isImportant
                  ? line.type === "error"
                    ? "bg-red-400/[0.08]"
                    : line.type === "success"
                      ? "bg-venom/[0.08]"
                    : "bg-[#d8b574]/[0.035]"
                  : ""
              }`}
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold text-[#d8b574]/35">&gt;</span>
              <span className="break-words">{line.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
