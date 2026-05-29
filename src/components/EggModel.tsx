import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import type { EggState } from "../game/entities";

export default function EggModel({ egg }: { egg: EggState }) {
  if (!egg.visible) {
    return null;
  }

  return <VisibleEggModel egg={egg} />;
}

function VisibleEggModel({ egg }: { egg: EggState }) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const crackStartRef = useRef<number | null>(null);
  const leftShellRef = useRef<Group>(null);
  const rightShellRef = useRef<Group>(null);
  const crownShellRef = useRef<Group>(null);
  const burstRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    if (!egg.cracked) {
      crackStartRef.current = null;
    }

    if (egg.cracked && crackStartRef.current === null) {
      crackStartRef.current = clock.elapsedTime;
    }

    const hatchElapsed = crackStartRef.current === null ? 0 : clock.elapsedTime - crackStartRef.current;
    const hatchProgress = easeOut(Math.min(1, Math.max(0, hatchElapsed / 1.25)));
    const heartbeat = Math.sin(clock.elapsedTime * 3.2);
    const idle = Math.sin(clock.elapsedTime * 1.9) * 0.012;
    const crackShake = egg.cracked && hatchProgress < 1 ? Math.sin(clock.elapsedTime * 18) * 0.052 : 0;
    const pulse = 1 + heartbeat * 0.09;
    groupRef.current.position.y = 0.44 + Math.sin(clock.elapsedTime * 2.2) * 0.018;
    groupRef.current.rotation.z = idle + crackShake;

    if (glowRef.current) {
      glowRef.current.scale.setScalar(egg.cracked ? 1.42 : pulse);
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(egg.cracked ? 1.22 : 1 + heartbeat * 0.045);
    }

    if (leftShellRef.current) {
      leftShellRef.current.position.set(
        -0.18 - hatchProgress * 0.52,
        -0.08 - hatchProgress * 0.16,
        0.02 + hatchProgress * 0.1
      );
      leftShellRef.current.rotation.set(
        0.1,
        hatchProgress * -0.34,
        0.46 + hatchProgress * 0.54
      );
    }

    if (rightShellRef.current) {
      rightShellRef.current.position.set(
        0.18 + hatchProgress * 0.52,
        -0.1 - hatchProgress * 0.16,
        0.04 + hatchProgress * 0.16
      );
      rightShellRef.current.rotation.set(
        -0.2,
        0.2 + hatchProgress * 0.34,
        -0.64 - hatchProgress * 0.5
      );
    }

    if (crownShellRef.current) {
      crownShellRef.current.position.set(
        0.02 + hatchProgress * 0.08,
        0.28 + hatchProgress * 0.34,
        0.02 + hatchProgress * 0.2
      );
      crownShellRef.current.rotation.set(
        hatchProgress * -0.92,
        hatchProgress * 0.3,
        hatchProgress * 0.7
      );
      crownShellRef.current.scale.setScalar(1 - hatchProgress * 0.18);
    }

    if (burstRef.current) {
      burstRef.current.scale.setScalar(egg.cracked ? 1 + Math.sin(clock.elapsedTime * 8) * 0.08 : 0.001);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.42, 0]}>
      <pointLight color="#ffd27a" intensity={egg.cracked ? 2.25 : 1.58} distance={5.8} />
      <pointLight color="#8dff7a" intensity={egg.cracked ? 0.95 : 0.44} distance={3.4} />
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
        <ringGeometry args={[0.9, 1.34, 28]} />
        <meshBasicMaterial
          color={egg.cracked ? "#8dff7a" : "#ffd27a"}
          transparent
          opacity={egg.cracked ? 0.58 : 0.42}
        />
      </mesh>
      <mesh ref={haloRef} position={[0, 0.02, 0]} scale={[1.08, 1.28, 1.08]}>
        <sphereGeometry args={[0.78, 10, 8]} />
        <meshBasicMaterial
          color={egg.cracked ? "#a8ff8d" : "#ffd27a"}
          transparent
          opacity={egg.cracked ? 0.2 : 0.14}
          depthWrite={false}
        />
      </mesh>
      <EggParticles cracked={egg.cracked} />
      {!egg.cracked ? (
        <>
          <mesh castShadow receiveShadow scale={[0.58, 0.82, 0.58]}>
            <sphereGeometry args={[0.72, 12, 9]} />
            <meshStandardMaterial color="#e2d8bb" roughness={0.86} flatShading />
          </mesh>
          <HeartbeatSilhouette />
          <GlowingCracks cracked={false} />
        </>
      ) : (
        <>
          <group ref={leftShellRef}>
            <mesh castShadow receiveShadow scale={[0.44, 0.58, 0.42]}>
              <sphereGeometry args={[0.72, 8, 6]} />
              <meshStandardMaterial color="#d7d1b8" roughness={0.92} flatShading />
            </mesh>
          </group>
          <group ref={rightShellRef}>
            <mesh castShadow receiveShadow scale={[0.4, 0.48, 0.38]}>
              <sphereGeometry args={[0.72, 8, 6]} />
              <meshStandardMaterial color="#f1e9ca" roughness={0.92} flatShading />
            </mesh>
          </group>
          <group ref={crownShellRef}>
            <mesh castShadow receiveShadow scale={[0.32, 0.25, 0.3]}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#efe4c8" roughness={0.9} flatShading />
            </mesh>
          </group>
          <group ref={burstRef} position={[0.04, 0.28, 0.08]}>
            <mesh scale={[0.18, 0.64, 0.18]}>
              <coneGeometry args={[1, 1, 7]} />
              <meshBasicMaterial color="#8dff7a" transparent opacity={0.34} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0.08, 0]} scale={[0.28, 0.28, 0.28]}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#8dff7a" emissive="#25561b" flatShading />
            </mesh>
          </group>
          <GlowingCracks cracked />
          <ShellShard position={[-0.58, -0.42, 0.24]} rotation={[0.2, 0.3, 0.9]} />
          <ShellShard position={[0.52, -0.41, -0.16]} rotation={[-0.1, 0.8, -0.7]} />
          <ShellShard position={[0.04, -0.43, 0.62]} rotation={[0.7, 0, 0.2]} />
        </>
      )}
    </group>
  );
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function EggParticles({ cracked }: { cracked: boolean }) {
  const groupRef = useRef<Group>(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const angle = index * 2.399;
        const radius = 0.78 + ((index * 11) % 17) / 40;
        return {
          angle,
          radius,
          height: -0.12 + ((index * 7) % 19) / 18,
          size: 0.018 + ((index * 5) % 9) / 420,
          speed: 0.16 + ((index * 3) % 7) / 38,
          color: index % 3 === 0 ? "#8dff7a" : "#ffd27a"
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = clock.elapsedTime * (cracked ? 0.18 : 0.11);
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => {
        const bob = Math.sin(index + particle.speed * 9) * 0.05;

        return (
          <mesh
            key={`egg-particle-${index}`}
            position={[
              Math.cos(particle.angle) * particle.radius,
              particle.height + bob,
              Math.sin(particle.angle) * particle.radius
            ]}
            scale={particle.size * (cracked ? 1.35 : 1)}
          >
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial
              color={particle.color}
              transparent
              opacity={cracked ? 0.78 : 0.48}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function HeartbeatSilhouette() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const pulse = 1 + Math.max(0, Math.sin(clock.elapsedTime * 3.25)) * 0.08;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} position={[0.02, 0.02, 0.43]}>
      <mesh rotation={[Math.PI / 2, 0.05, 0.35]} scale={[0.28, 0.2, 0.28]}>
        <torusGeometry args={[0.62, 0.08, 7, 18]} />
        <meshBasicMaterial color="#7cff6d" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0.18, 0.1, 0.02]} scale={[0.14, 0.08, 0.11]}>
        <sphereGeometry args={[1, 7, 5]} />
        <meshBasicMaterial color="#dfff9b" transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <mesh position={[0.25, 0.1, 0.03]} rotation={[0, 0, -0.8]} scale={[0.08, 0.012, 0.012]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshBasicMaterial color="#8dff7a" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GlowingCracks({ cracked }: { cracked: boolean }) {
  const opacity = cracked ? 0.92 : 0.28;
  const color = cracked ? "#8dff7a" : "#ffd27a";

  return (
    <group position={[0.02, 0.08, 0.5]}>
      <CrackSegment position={[0, 0.26, 0]} rotation={[0, 0, 0.28]} length={0.36} opacity={opacity} color={color} />
      <CrackSegment position={[-0.08, 0.1, 0.01]} rotation={[0, 0, -0.58]} length={0.28} opacity={opacity} color={color} />
      <CrackSegment position={[0.1, 0.02, 0.01]} rotation={[0, 0, 0.64]} length={0.3} opacity={opacity} color={color} />
      <CrackSegment position={[-0.02, -0.16, 0.02]} rotation={[0, 0, -0.18]} length={0.26} opacity={opacity} color={color} />
    </group>
  );
}

function CrackSegment({
  position,
  rotation,
  length,
  opacity,
  color
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  opacity: number;
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={[0.018, length, 0.018]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function ShellShard({
  position,
  rotation
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation} scale={[0.18, 0.05, 0.13]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#efe4c8" roughness={0.9} flatShading />
    </mesh>
  );
}
