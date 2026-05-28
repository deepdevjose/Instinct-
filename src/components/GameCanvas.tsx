import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { MathUtils, Vector3 } from "three";
import type { WorldState } from "../game/entities";
import { useGameStore } from "../store/gameStore";
import EggModel from "./EggModel";
import Environment from "./Environment";
import HunterModel from "./HunterModel";
import SnakeModel from "./SnakeModel";

export default function GameCanvas() {
  const world = useGameStore((state) => state.world);

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [7.5, 6.1, 7.5], fov: 42 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );

  function Scene() {
    return (
      <>
        <color attach="background" args={["#182119"]} />
        <fog attach="fog" args={["#48563f", 8.2, 26]} />
        <PerspectiveCamera makeDefault position={[6.2, 4.8, 6.2]} fov={40} />
        <CinematicCamera world={world} />
        <ambientLight intensity={0.46 + world.lightLevel * 0.32} />
        <directionalLight
          castShadow
          position={[4.5, 8, 3.8]}
          intensity={1.08 * world.lightLevel}
          color="#f2c36b"
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
        <spotLight
          position={[-3.8, 5.5, -4.5]}
          angle={0.46}
          penumbra={0.78}
          intensity={1.38 * world.lightLevel}
          color="#8dff7a"
        />
        <spotLight
          position={[0.35, 5.4, 0.7]}
          angle={0.54}
          penumbra={0.86}
          intensity={world.egg.visible ? 2.45 : 0.9}
          color="#ffd27a"
          distance={9}
          castShadow={false}
        />
        <pointLight
          position={[0, 2.15, 0.2]}
          intensity={world.egg.visible ? 1.9 : 1.05}
          color="#ffd68c"
          distance={7}
        />
        <pointLight position={[-1.2, 1.1, 0.8]} intensity={0.66} color="#f2c36b" distance={5} />
        <pointLight
          position={[1.4, 1.05, -1.1]}
          intensity={world.egg.visible ? 0.72 : 0.42}
          color="#8dff7a"
          distance={5.2}
        />

        <Physics gravity={[0, -9.81, 0]}>
          <Environment world={world} />
          <EggModel egg={world.egg} />
          <SnakeModel snake={world.snake} pulse={world.actionPulse} />
          {world.predators.map((hunter) => (
            <HunterModel key={hunter.id} hunter={hunter} />
          ))}
        </Physics>

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.24}
          scale={14}
          blur={2.2}
          far={7}
        />
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={5}
          maxDistance={13}
          minPolarAngle={0.72}
          maxPolarAngle={1.18}
        />
      </>
    );
  }
}

function CinematicCamera({ world }: { world: WorldState }) {
  const { camera } = useThree();
  const defaultPosition = new Vector3(7.4, 5.8, 7.4);
  const eggPosition = new Vector3(5.65, 4.28, 5.85);
  const hatchPosition = new Vector3(3.9, 3.08, 4.25);
  const failurePosition = new Vector3(5.8, 4.4, 5.8);
  const target = new Vector3();

  useFrame(({ clock }) => {
    const isHatching = world.snake.state === "newborn";
    const isFailure = world.lastAction === "failure";
    const isEggScene = world.egg.visible;
    const desiredPosition = isFailure
      ? failurePosition
      : isHatching
        ? hatchPosition
        : isEggScene
          ? eggPosition
          : defaultPosition;

    camera.position.lerp(desiredPosition, isHatching || isFailure ? 0.045 : 0.025);

    target.set(world.snake.position[0], 0.28, world.snake.position[2]);

    if (isEggScene) {
      target.set(0.08, 0.5, 0.04);
    }

    if (isHatching) {
      target.set(0.56, 0.62, 0.62);
    }

    if (isFailure) {
      const shake = Math.sin(clock.elapsedTime * 32) * 0.025;
      camera.position.x += shake;
      camera.position.z -= shake;
    }

    camera.lookAt(target);
    camera.zoom = MathUtils.lerp(
      camera.zoom,
      isHatching ? 1.22 : isEggScene ? 1.12 : 1,
      0.035
    );
    camera.updateProjectionMatrix();
  });

  return null;
}
