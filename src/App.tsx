import { Suspense, lazy, useState } from "react";
import GameCanvas from "./components/GameCanvas";

const ImmersiveHUD = lazy(() => import("./components/ImmersiveHUD"));
const MainMenu = lazy(() => import("./components/MainMenu"));

export default function App() {
  const [screen, setScreen] = useState<"menu" | "game">(() =>
    new URLSearchParams(window.location.search).get("screen") === "game"
      ? "game"
      : "menu"
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-obsidian text-bone">
      <div className="absolute inset-0">
        <GameCanvas />
      </div>
      <Suspense fallback={null}>
        {screen === "game" ? (
          <ImmersiveHUD onSaveAndExit={() => setScreen("menu")} />
        ) : (
          <MainMenu onStart={() => setScreen("game")} />
        )}
      </Suspense>
    </main>
  );
}
