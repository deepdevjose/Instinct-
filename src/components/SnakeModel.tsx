import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import type { SnakeEntity, SnakeVisualState } from "../game/entities";

interface SnakeModelProps {
  snake: SnakeEntity;
  pulse: number;
}

const LIFE_STAGE_SCALE: Record<string, number> = {
  egg: 0,
  hatchling: 0.7,
  juvenile: 0.84,
  adult: 0.98,
  elder: 1.02,
  dead: 0.92
};

const SEGMENTS = [
  { position: [0, 0.19, 0.78], rotation: 0, scale: [0.32, 0.22, 0.46], kind: "head" },
  { position: [0.02, 0.17, 0.34], rotation: -0.08, scale: [0.27, 0.18, 0.5], kind: "body" },
  { position: [-0.08, 0.16, -0.08], rotation: -0.28, scale: [0.28, 0.18, 0.54], kind: "body" },
  { position: [-0.34, 0.15, -0.42], rotation: -0.72, scale: [0.29, 0.18, 0.56], kind: "body" },
  { position: [-0.74, 0.14, -0.5], rotation: -1.22, scale: [0.27, 0.17, 0.54], kind: "body" },
  { position: [-1.1, 0.13, -0.34], rotation: -1.88, scale: [0.24, 0.16, 0.48], kind: "body" },
  { position: [-1.3, 0.11, -0.02], rotation: -2.48, scale: [0.18, 0.13, 0.4], kind: "tail" }
] as const;

function getPalette(state: SnakeVisualState) {
  if (state === "dead") {
    return {
      base: "#62584d",
      dark: "#3d352f",
      gold: "#8b7a5a",
      belly: "#b9ac90",
      glow: "#ff5a5a"
    };
  }

  if (state === "hiding") {
    return {
      base: "#6d7442",
      dark: "#3f4a2d",
      gold: "#9ca35d",
      belly: "#d7d3a8",
      glow: "#8dff7a"
    };
  }

  if (state === "shedding") {
    return {
      base: "#c9d9a5",
      dark: "#8ca177",
      gold: "#eef2c8",
      belly: "#f5f1dd",
      glow: "#d7ffc1"
    };
  }

  if (state === "attacking") {
    return {
      base: "#b98645",
      dark: "#5a3b25",
      gold: "#f0ce76",
      belly: "#fff0be",
      glow: "#8dff7a"
    };
  }

  return {
    base: state === "newborn" ? "#b9914e" : "#a97a3f",
    dark: "#60402b",
    gold: "#e0b967",
    belly: "#fff0c4",
    glow: state === "newborn" ? "#ffd27a" : "#8dff7a"
  };
}

export default function SnakeModel(props: SnakeModelProps) {
  if (props.snake.state === "egg") {
    return null;
  }

  return <VisibleSnakeModel {...props} />;
}

function VisibleSnakeModel({ snake, pulse }: SnakeModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Group>(null);
  const hatRef = useRef<THREE.Group>(null);

  const visualState = snake.state;
  const baseScale = LIFE_STAGE_SCALE[snake.lifeStage] ?? 1;

  useFrame(({ clock }) => {
    if (!groupRef.current || !bodyRef.current) {
      return;
    }

    const time = clock.elapsedTime;
    const isMoving = visualState === "moving";
    const isAttacking = visualState === "attacking";
    const isDead = visualState === "dead";
    const isHiding = visualState === "hiding";
    const isNewborn = visualState === "newborn";
    const speed = isMoving ? 7 : isNewborn ? 4.8 : 2.1;
    const wave = Math.sin(time * speed + pulse) * (isMoving ? 0.1 : 0.035);
    const lunge = isAttacking ? Math.sin(time * 12) * 0.2 : 0;
    const rise = isNewborn ? 0.12 + Math.sin(time * 4.6) * 0.03 : 0;

    groupRef.current.position.set(
      snake.position[0] + Math.cos(snake.rotation) * lunge,
      snake.position[1] + 0.08 + rise + (isHiding ? -0.03 : 0),
      snake.position[2] + Math.sin(snake.rotation) * lunge
    );

    groupRef.current.rotation.set(
      isDead ? 0.16 : 0,
      -snake.rotation + wave,
      isDead ? -0.82 : wave * 0.32
    );

    const stateScale =
      isNewborn ? 0.9 + Math.sin(time * 5) * 0.018 :
      isAttacking ? 1.06 :
      visualState === "old" ? 0.96 :
      1;

    groupRef.current.scale.setScalar(baseScale * stateScale);
    bodyRef.current.rotation.y = Math.sin(time * speed * 0.42 + pulse) * (isMoving ? 0.12 : 0.04);

    if (tongueRef.current) {
      tongueRef.current.visible = !isDead && !isHiding && Math.sin(time * 17) > 0.15;
      tongueRef.current.scale.z = Math.sin(time * 17) > 0.7 ? 1.35 : 1;
    }

    if (hatRef.current) {
      hatRef.current.rotation.z = isDead ? -0.65 : isAttacking ? 0.18 : Math.sin(time * 1.5) * 0.025;
    }
  });

  const palette = getPalette(visualState);
  const opacity = visualState === "hiding" ? 0.44 : visualState === "dead" ? 0.72 : 1;
  const transparent = visualState === "hiding" || visualState === "dead";

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.45, 0.035, -0.1]} scale={[1.42, 0.58, 1]}>
          <circleGeometry args={[1, 18]} />
          <meshBasicMaterial color="#050805" transparent opacity={0.24} depthWrite={false} />
        </mesh>

        {SEGMENTS.map((segment, index) => (
          <BlockSegment
            key={`snake-block-${index}`}
            index={index}
            position={segment.position}
            rotation={segment.rotation}
            scale={segment.scale}
            kind={segment.kind}
            palette={palette}
            transparent={transparent}
            opacity={opacity}
          />
        ))}

        <Tongue tongueRef={tongueRef} />
        <TinyHat hatRef={hatRef} />
      </group>

      <SnakeStateAura visualState={visualState} color={palette.glow} />
      <NewbornReveal visualState={visualState} color={palette.glow} />
    </group>
  );
}

function BlockSegment({
  index,
  position,
  rotation,
  scale,
  kind,
  palette,
  transparent,
  opacity
}: {
  index: number;
  position: readonly [number, number, number];
  rotation: number;
  scale: readonly [number, number, number];
  kind: "head" | "body" | "tail";
  palette: ReturnType<typeof getPalette>;
  transparent: boolean;
  opacity: number;
}) {
  const isHead = kind === "head";
  const isTail = kind === "tail";

  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.base} roughness={0.9} flatShading transparent={transparent} opacity={opacity} />
      </mesh>

      <mesh position={[0, -0.37, 0.16]} scale={[0.9, 0.22, 0.72]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.belly} roughness={0.86} flatShading transparent={transparent} opacity={opacity} />
      </mesh>

      <Patch x={-0.26} z={-0.18} color={index % 2 === 0 ? palette.dark : palette.gold} opacity={opacity} transparent={transparent} />
      <Patch x={0.18} z={0.12} color={index % 2 === 0 ? palette.gold : palette.dark} opacity={opacity} transparent={transparent} />
      {!isTail ? (
        <Patch x={0.34} z={-0.26} color={palette.dark} opacity={opacity * 0.9} transparent={transparent} small />
      ) : null}

      {isHead ? (
        <>
          <mesh castShadow receiveShadow position={[0, -0.02, 0.56]} scale={[0.82, 0.76, 0.22]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={palette.base} roughness={0.88} flatShading transparent={transparent} opacity={opacity} />
          </mesh>
          <mesh position={[0, -0.37, 0.68]} scale={[0.62, 0.16, 0.12]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={palette.belly} roughness={0.86} flatShading transparent={transparent} opacity={opacity} />
          </mesh>
          <mesh position={[-0.22, 0.08, 0.69]} scale={[0.08, 0.11, 0.045]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#17100b" roughness={0.5} flatShading />
          </mesh>
          <mesh position={[0.22, 0.08, 0.69]} scale={[0.08, 0.11, 0.045]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#17100b" roughness={0.5} flatShading />
          </mesh>
          <mesh position={[-0.19, 0.12, 0.72]} scale={[0.025, 0.025, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#fff4d6" />
          </mesh>
          <mesh position={[0.25, 0.12, 0.72]} scale={[0.025, 0.025, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#fff4d6" />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function Patch({
  x,
  z,
  color,
  opacity,
  transparent,
  small = false
}: {
  x: number;
  z: number;
  color: string;
  opacity: number;
  transparent: boolean;
  small?: boolean;
}) {
  return (
    <mesh position={[x, 0.515, z]} scale={small ? [0.26, 0.035, 0.22] : [0.34, 0.035, 0.28]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.82} flatShading transparent={transparent} opacity={opacity} />
    </mesh>
  );
}

function Tongue({ tongueRef }: { tongueRef: RefObject<THREE.Group> }) {
  return (
    <group ref={tongueRef} position={[0, 0.18, 1.1]}>
      <mesh position={[0, -0.03, 0.08]} scale={[0.025, 0.012, 0.22]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cc2c26" roughness={0.72} flatShading />
      </mesh>
      <mesh position={[-0.035, -0.03, 0.28]} rotation={[0, 0.22, 0]} scale={[0.018, 0.01, 0.09]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cc2c26" roughness={0.72} flatShading />
      </mesh>
      <mesh position={[0.035, -0.03, 0.28]} rotation={[0, -0.22, 0]} scale={[0.018, 0.01, 0.09]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cc2c26" roughness={0.72} flatShading />
      </mesh>
    </group>
  );
}

function TinyHat({ hatRef }: { hatRef: RefObject<THREE.Group> }) {
  return (
    <group ref={hatRef} position={[0, 0.45, 0.76]} rotation={[0.02, 0, 0]}>
      <mesh castShadow receiveShadow scale={[0.34, 0.04, 0.24]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b2618" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.075, 0]} scale={[0.19, 0.13, 0.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5a371f" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.025, 0]} scale={[0.21, 0.02, 0.19]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8dff7a" emissive="#203d18" roughness={0.72} flatShading />
      </mesh>
    </group>
  );
}

function SnakeStateAura({ visualState, color }: { visualState: SnakeVisualState; color: string }) {
  if (!["newborn", "attacking", "shedding", "protecting_children", "dead"].includes(visualState)) {
    return null;
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.45, 0.045, -0.02]}>
      <ringGeometry args={[1.18, 1.28, 22]} />
      <meshBasicMaterial
        color={visualState === "dead" ? "#ff5a5a" : color}
        transparent
        opacity={visualState === "dead" ? 0.26 : 0.42}
      />
    </mesh>
  );
}

function NewbornReveal({ visualState, color }: { visualState: SnakeVisualState; color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 2.4) * 0.08;
    groupRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4.4) * 0.04);
  });

  if (visualState !== "newborn") {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0.02, 0.1]}>
      <pointLight color={color} intensity={1.2} distance={3.2} position={[0, 0.72, 0.52]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.35, 0.08, 0]}>
        <ringGeometry args={[0.9, 1.02, 24]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {[-0.42, -0.16, 0.16, 0.42].map((x, index) => (
        <mesh
          key={`birth-spark-${index}`}
          position={[x, 0.48 + index * 0.035, 0.38 - index * 0.08]}
          scale={[0.045, 0.045, 0.045]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive="#315d21" emissiveIntensity={0.75} flatShading />
        </mesh>
      ))}
    </group>
  );
}
