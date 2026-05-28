import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { ChildEntity, WorldState } from "../game/entities";

export default function Environment({ world }: { world: WorldState }) {
  const grass = useScatter(128, 10.4, 0.18);
  const stones = useScatter(34, 8.2, 0.52);
  const trees = useScatter(24, 6.8, 1.08, 5.0);
  const backgroundTrees = useScatter(38, 3.4, 2.87, 8.2);
  const hideZones = useScatter(7, 6.2, 2.41);

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[12, 18]} />
          <meshStandardMaterial color="#354e36" roughness={1} flatShading />
        </mesh>
        <CuboidCollider args={[12, 0.05, 12]} position={[0, -0.06, 0]} />
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[6.6, 11.8, 18]} />
        <meshBasicMaterial color="#7c9350" transparent opacity={0.27} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]}>
        <ringGeometry args={[1.32, 3.0, 28]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={world.egg.visible ? 0.16 : 0.07} />
      </mesh>

      <HunterPath />
      <Cave position={[-4.8, 0, -3.6]} rotation={0.25} />
      <Cave position={[4.9, 0, 3.2]} rotation={-0.7} />
      <Nest position={[0.8, 0.05, 1.05]} />

      {backgroundTrees.map((item, index) => (
        <LowTree key={`background-tree-${index}`} item={item} background />
      ))}

      {hideZones.map((item, index) => (
        <HideZone key={`hide-zone-${index}`} item={item} />
      ))}

      {grass.map((item, index) => (
        <GrassTuft key={`grass-${index}`} item={item} />
      ))}

      {stones.map((item, index) => (
        <mesh
          key={`stone-${index}`}
          castShadow
          receiveShadow
          position={[item.x, 0.08, item.z]}
          rotation={[0, item.rotation, 0]}
          scale={[item.scale * 0.5, item.scale * 0.22, item.scale * 0.38]}
        >
          <dodecahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial color="#6c7065" roughness={0.9} flatShading />
        </mesh>
      ))}

      {trees.map((item, index) => (
        <LowTree key={`tree-${index}`} item={item} />
      ))}

      {world.children.map((child) => (
        <ChildSnake key={child.id} child={child} />
      ))}

      <WorldFeedback world={world} />
    </group>
  );
}

function HunterPath() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.026, 0.2]}>
        <ringGeometry args={[3.7, 4.05, 20]} />
        <meshBasicMaterial color="#c18b46" transparent opacity={0.16} />
      </mesh>
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x, index) => (
        <mesh
          key={`path-stone-${index}`}
          castShadow
          receiveShadow
          position={[x, 0.035, -3.05 + Math.sin(index) * 0.35]}
          rotation={[0, index * 0.8, 0]}
          scale={[0.42, 0.06, 0.26]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8a6841" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function GrassTuft({
  item
}: {
  item: { x: number; z: number; scale: number; rotation: number };
}) {
  return (
    <group position={[item.x, 0.06, item.z]} rotation={[0, item.rotation, 0]}>
      <mesh castShadow position={[0, 0.04, 0]} rotation={[0.06, 0, 0.02]} scale={[0.046, 0.82 * item.scale, 0.046]}>
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#6fa552" roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow
        position={[0.11, 0.04, 0.03]}
        rotation={[0.28, 0.8, -0.28]}
        scale={[0.038, 0.64 * item.scale, 0.038]}
      >
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#91bf61" roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow
        position={[-0.11, 0.035, -0.03]}
        rotation={[-0.18, -0.6, 0.32]}
        scale={[0.04, 0.58 * item.scale, 0.04]}
      >
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#4c743d" roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow
        position={[0.03, 0.025, -0.12]}
        rotation={[-0.34, 1.15, 0.18]}
        scale={[0.032, 0.5 * item.scale, 0.032]}
      >
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#789a4b" roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow
        position={[-0.04, 0.02, 0.12]}
        rotation={[0.32, -1.05, -0.22]}
        scale={[0.034, 0.46 * item.scale, 0.034]}
      >
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#5e8a45" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function LowTree({
  item,
  background = false
}: {
  item: { x: number; z: number; scale: number; rotation: number };
  background?: boolean;
}) {
  const scale = item.scale * (background ? 0.92 : 1.18);
  const trunkColor = background ? "#493622" : "#604128";
  const leafColors = background
    ? ["#152b1c", "#203a26", "#2c4a2b", "#3f6133"]
    : ["#23462d", "#315e38", "#47733e", "#668846"];
  const shadowOpacity = background ? 0.14 : 0.24;

  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]}>
      <mesh
        castShadow={!background}
        receiveShadow
        position={[0, 0.46 * scale, 0]}
        scale={[0.16 * scale, 0.92 * scale, 0.16 * scale]}
      >
        <cylinderGeometry args={[0.46, 0.64, 1, 7]} />
        <meshStandardMaterial color={trunkColor} roughness={0.95} flatShading />
      </mesh>
      <mesh
        castShadow={!background}
        receiveShadow
        position={[0, 1.06 * scale, 0]}
        scale={[0.98 * scale, 0.98 * scale, 0.98 * scale]}
      >
        <coneGeometry args={[0.9, 0.95, 8]} />
        <meshStandardMaterial color={leafColors[0]} roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow={!background}
        receiveShadow
        position={[0.05 * scale, 1.43 * scale, -0.02 * scale]}
        scale={[0.76 * scale, 0.82 * scale, 0.76 * scale]}
      >
        <coneGeometry args={[0.86, 0.9, 8]} />
        <meshStandardMaterial color={leafColors[1]} roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow={!background}
        receiveShadow
        position={[-0.03 * scale, 1.76 * scale, 0.03 * scale]}
        scale={[0.56 * scale, 0.68 * scale, 0.56 * scale]}
      >
        <coneGeometry args={[0.82, 0.88, 8]} />
        <meshStandardMaterial color={leafColors[2]} roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow={!background}
        receiveShadow
        position={[0.02 * scale, 2.02 * scale, -0.01 * scale]}
        scale={[0.36 * scale, 0.48 * scale, 0.36 * scale]}
      >
        <coneGeometry args={[0.78, 0.86, 8]} />
        <meshStandardMaterial color={leafColors[3]} roughness={1} flatShading />
      </mesh>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, 0]}
        scale={[0.68 * scale, 0.45 * scale, 0.68 * scale]}
      >
        <circleGeometry args={[1, 8]} />
        <meshBasicMaterial color="#172015" transparent opacity={shadowOpacity} />
      </mesh>
    </group>
  );
}

function HideZone({
  item
}: {
  item: { x: number; z: number; scale: number; rotation: number };
}) {
  return (
    <group position={[item.x, 0.04, item.z]} rotation={[0, item.rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62 * item.scale, 8]} />
        <meshBasicMaterial color="#8dff7a" transparent opacity={0.16} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]} scale={[0.1, 0.58, 0.1]}>
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#557d43" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.16, 0.18, -0.08]} scale={[0.08, 0.44, 0.08]}>
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#6c9951" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Cave({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.28, 0]} scale={[0.95, 0.48, 0.58]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#4f5049" roughness={1} flatShading />
      </mesh>
      <mesh position={[0.08, 0.22, -0.02]} scale={[0.52, 0.25, 0.3]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#0b0d0b" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Nest({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.68, 0.68, 0.68]}>
        <torusGeometry args={[0.48, 0.08, 6, 18]} />
        <meshStandardMaterial color="#80623b" roughness={1} flatShading />
      </mesh>
      <mesh position={[0.08, 0.08, -0.03]} scale={[0.22, 0.14, 0.18]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#d7d1b8" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function ChildSnake({ child }: { child: ChildEntity }) {
  return (
    <group position={child.position}>
      <mesh castShadow scale={[0.28, 0.14, 0.22]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial
          color={child.protected ? "#8dff7a" : "#6cc35e"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      {child.protected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry args={[0.35, 0.38, 18]} />
          <meshBasicMaterial color="#8dff7a" transparent opacity={0.5} />
        </mesh>
      ) : null}
    </group>
  );
}

function WorldFeedback({ world }: { world: WorldState }) {
  const groupRef = useRef<Group>(null);
  const isFailure = world.lastAction === "failure";

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * (isFailure ? 7 : 4)) * 0.12;
    groupRef.current.scale.setScalar(pulse);
    groupRef.current.rotation.y += isFailure ? 0.035 : 0.018;
  });

  if (world.lastAction === "checkpoint") {
    return null;
  }

  const color = isFailure ? "#ff5a5a" : "#8dff7a";
  const position: [number, number, number] = [
    world.snake.position[0],
    0.04,
    world.snake.position[2]
  ];

  return (
    <group ref={groupRef} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 1.08, 18]} />
        <meshBasicMaterial color={color} transparent opacity={isFailure ? 0.5 : 0.38} />
      </mesh>
      <mesh position={[0, 0.55, 0]} scale={[0.11, isFailure ? 1.05 : 0.68, 0.11]}>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={isFailure ? "#5c1010" : "#1d4c12"}
          transparent
          opacity={0.56}
          flatShading
        />
      </mesh>
    </group>
  );
}

function useScatter(count: number, radius: number, seed: number, minDistance = 1.4) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = index * 2.399 + seed;
        const distance = minDistance + ((index * 37) % 100) * 0.01 * radius;
        return {
          x: Math.cos(angle) * distance,
          z: Math.sin(angle) * distance,
          scale: 0.72 + ((index * 17) % 31) / 48,
          rotation: angle + Math.PI * 0.25
        };
      }),
    [count, radius, seed, minDistance]
  );
}
