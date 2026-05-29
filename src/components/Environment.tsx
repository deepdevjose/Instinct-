import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useLayoutEffect, useMemo, useRef } from "react";
import { DoubleSide, Object3D, type Group, type InstancedMesh } from "three";
import type { ChildEntity, WorldState } from "../game/entities";

type ScatterItem = { x: number; z: number; scale: number; rotation: number };

const GRASS_BLADES = [
  { x: 0, z: 0, h: 0.44, w: 0.08, r: 0.02, c: "#6f9a4b", lean: 0.5 },
  { x: 0.12, z: 0.02, h: 0.36, w: 0.07, r: 0.76, c: "#8aa957", lean: -0.38 },
  { x: -0.1, z: -0.04, h: 0.34, w: 0.07, r: -0.68, c: "#4f7138", lean: 0.46 },
  { x: 0.04, z: -0.13, h: 0.3, w: 0.06, r: 1.18, c: "#788f47", lean: -0.5 },
  { x: -0.05, z: 0.13, h: 0.32, w: 0.065, r: -1.05, c: "#5e843d", lean: 0.42 },
  { x: 0.18, z: -0.08, h: 0.26, w: 0.055, r: 1.58, c: "#9a9b52", lean: -0.55 },
  { x: -0.18, z: 0.08, h: 0.28, w: 0.055, r: -1.48, c: "#3f6132", lean: 0.5 }
];

const TREE_PARTS = [
  {
    position: [0, 1.06, 0] as const,
    scale: [0.98, 0.98, 0.98] as const,
    geometry: [0.9, 0.95, 8] as const
  },
  {
    position: [0.05, 1.43, -0.02] as const,
    scale: [0.76, 0.82, 0.76] as const,
    geometry: [0.86, 0.9, 8] as const
  },
  {
    position: [-0.03, 1.76, 0.03] as const,
    scale: [0.56, 0.68, 0.56] as const,
    geometry: [0.82, 0.88, 8] as const
  },
  {
    position: [0.02, 2.02, -0.01] as const,
    scale: [0.36, 0.48, 0.36] as const,
    geometry: [0.78, 0.86, 8] as const
  }
];

export default function Environment({ world }: { world: WorldState }) {
  const grass = useScatter(190, 10.4, 0.18);
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

      <InstancedTrees items={backgroundTrees} background />

      {hideZones.map((item, index) => (
        <HideZone key={`hide-zone-${index}`} item={item} />
      ))}

      <InstancedGrass items={grass} />

      <InstancedStones items={stones} />

      <InstancedTrees items={trees} />

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

function InstancedGrass({ items }: { items: ScatterItem[] }) {
  return (
    <group>
      {GRASS_BLADES.map((blade, index) => (
        <GrassBladeInstances key={`grass-blade-layer-${index}`} blade={blade} items={items} />
      ))}
    </group>
  );
}

function GrassBladeInstances({
  blade,
  items
}: {
  blade: (typeof GRASS_BLADES)[number];
  items: ScatterItem[];
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach((item, index) => {
      const height = blade.h * item.scale;
      const width = blade.w * (0.95 + item.scale * 0.12);
      const offset = rotateOffset(blade.x, blade.z, item.rotation);

      dummy.position.set(item.x + offset.x, 0.025 + height * 0.44, item.z + offset.z);
      dummy.rotation.set(blade.lean, item.rotation + blade.r, blade.lean * 0.42);
      dummy.scale.set(width, height, 1);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  }, [blade, dummy, items]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshStandardMaterial
        color={blade.c}
        roughness={0.95}
        metalness={0}
        side={DoubleSide}
        transparent
        opacity={0.96}
      />
    </instancedMesh>
  );
}

function InstancedStones({ items }: { items: ScatterItem[] }) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach((item, index) => {
      dummy.position.set(item.x, 0.08, item.z);
      dummy.rotation.set(0, item.rotation, 0);
      dummy.scale.set(item.scale * 0.5, item.scale * 0.22, item.scale * 0.38);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  }, [dummy, items]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.48, 0]} />
      <meshStandardMaterial color="#6c7065" roughness={0.9} flatShading />
    </instancedMesh>
  );
}

function InstancedTrees({
  items,
  background = false
}: {
  items: ScatterItem[];
  background?: boolean;
}) {
  const trunkColor = background ? "#493622" : "#604128";
  const leafColors = background
    ? ["#152b1c", "#203a26", "#2c4a2b", "#3f6133"]
    : ["#23462d", "#315e38", "#47733e", "#668846"];
  const shadowOpacity = background ? 0.14 : 0.24;

  return (
    <group>
      <TreeTrunks items={items} background={background} color={trunkColor} />
      {TREE_PARTS.map((part, index) => (
        <TreeLeaves
          key={`tree-leaf-layer-${background ? "back" : "front"}-${index}`}
          items={items}
          background={background}
          color={leafColors[index]}
          part={part}
        />
      ))}
      <TreeShadows items={items} background={background} opacity={shadowOpacity} />
    </group>
  );
}

function TreeTrunks({
  items,
  background,
  color
}: {
  items: ScatterItem[];
  background: boolean;
  color: string;
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach((item, index) => {
      const scale = item.scale * (background ? 0.92 : 1.18);

      dummy.position.set(item.x, 0.46 * scale, item.z);
      dummy.rotation.set(0, item.rotation, 0);
      dummy.scale.set(0.16 * scale, 0.92 * scale, 0.16 * scale);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  }, [background, dummy, items]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={!background} receiveShadow>
      <cylinderGeometry args={[0.46, 0.64, 1, 7]} />
      <meshStandardMaterial color={color} roughness={0.95} flatShading />
    </instancedMesh>
  );
}

function TreeLeaves({
  items,
  background,
  color,
  part
}: {
  items: ScatterItem[];
  background: boolean;
  color: string;
  part: (typeof TREE_PARTS)[number];
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach((item, index) => {
      const scale = item.scale * (background ? 0.92 : 1.18);
      const offset = rotateOffset(part.position[0] * scale, part.position[2] * scale, item.rotation);

      dummy.position.set(item.x + offset.x, part.position[1] * scale, item.z + offset.z);
      dummy.rotation.set(0, item.rotation, 0);
      dummy.scale.set(part.scale[0] * scale, part.scale[1] * scale, part.scale[2] * scale);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  }, [background, dummy, items, part]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={!background} receiveShadow>
      <coneGeometry args={[part.geometry[0], part.geometry[1], part.geometry[2]]} />
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </instancedMesh>
  );
}

function TreeShadows({
  items,
  background,
  opacity
}: {
  items: ScatterItem[];
  background: boolean;
  opacity: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach((item, index) => {
      const scale = item.scale * (background ? 0.92 : 1.18);

      dummy.position.set(item.x, 0.025, item.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(0.68 * scale, 0.45 * scale, 0.68 * scale);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  }, [background, dummy, items]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} receiveShadow>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial color="#172015" transparent opacity={opacity} depthWrite={false} />
    </instancedMesh>
  );
}

function rotateOffset(x: number, z: number, rotation: number) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return {
    x: x * cos - z * sin,
    z: x * sin + z * cos
  };
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
  if (world.lastAction === "checkpoint") {
    return null;
  }

  return <WorldFeedbackPulse world={world} />;
}

function WorldFeedbackPulse({ world }: { world: WorldState }) {
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
