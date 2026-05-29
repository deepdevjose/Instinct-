import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { HunterVisualState, PredatorEntity } from "../game/entities";

export default function HunterModel({ hunter }: { hunter: PredatorEntity }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const lampRef = useRef<THREE.Group>(null);

  const baseYaw = useMemo(
    () => Math.atan2(-hunter.position[0], -hunter.position[2]),
    [hunter.position]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.elapsedTime;
    const isPatrolling = hunter.visualState === "patrolling";
    const isSearching = hunter.visualState === "searching";
    const isChasing = hunter.visualState === "chasing";
    const isAiming = hunter.visualState === "aiming";
    const isStunned = hunter.visualState === "stunned";
    const isRetreating = hunter.visualState === "retreating";

    const patrolStep = isPatrolling || isChasing ? Math.sin(time * (isChasing ? 8.2 : 5.1)) : 0;
    const searchSweep = isSearching ? Math.sin(time * 2.15) * 0.82 : 0;
    const stunnedWobble = isStunned ? Math.sin(time * 12) * 0.16 : 0;
    const retreatOffset = isRetreating ? Math.sin(time * 4.3) * 0.08 : 0;
    const bob = Math.abs(patrolStep) * (isChasing ? 0.075 : 0.038);

    groupRef.current.position.set(retreatOffset, bob, 0);
    groupRef.current.rotation.set(
      isChasing || isAiming ? -0.12 : stunnedWobble * 0.42,
      baseYaw + searchSweep * 0.28 + stunnedWobble * 0.25,
      stunnedWobble + (isRetreating ? 0.1 : 0)
    );

    if (headRef.current) {
      headRef.current.rotation.set(
        isStunned ? -0.24 : Math.sin(time * 1.7) * 0.025,
        searchSweep * 0.36,
        isStunned ? stunnedWobble * 1.2 : Math.sin(time * 2.1) * 0.025
      );
    }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = patrolStep * 0.24;
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -patrolStep * 0.24;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = isAiming || isChasing ? -0.08 : -0.24;
      rightArmRef.current.rotation.y = isAiming || isChasing ? -0.08 : -0.28;
      rightArmRef.current.rotation.z = isAiming || isChasing ? -0.18 : -0.5;
    }

    if (lampRef.current) {
      lampRef.current.rotation.y = searchSweep * 0.72;
      lampRef.current.rotation.x = isSearching ? Math.sin(time * 1.8) * 0.08 : 0;
    }
  });

  return (
    <RigidBody type="fixed" colliders="cuboid" position={hunter.position}>
      <group ref={groupRef}>
        <HunterDetectionRing hunter={hunter} />
        <HunterBody
          headRef={headRef}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          rightArmRef={rightArmRef}
          lampRef={lampRef}
          visualState={hunter.visualState}
        />
      </group>
    </RigidBody>
  );
}

function HunterDetectionRing({ hunter }: { hunter: PredatorEntity }) {
  const isAlert = hunter.visualState === "aiming" || hunter.visualState === "chasing";
  const color = isAlert ? "#ff6262" : "#d89a45";

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
      <ringGeometry args={[hunter.detectionRange - 0.035, hunter.detectionRange, 48]} />
      <meshBasicMaterial color={color} transparent opacity={isAlert ? 0.16 : 0.1} depthWrite={false} />
    </mesh>
  );
}

function HunterBody({
  headRef,
  leftLegRef,
  rightLegRef,
  rightArmRef,
  lampRef,
  visualState
}: {
  headRef: RefObject<THREE.Group>;
  leftLegRef: RefObject<THREE.Group>;
  rightLegRef: RefObject<THREE.Group>;
  rightArmRef: RefObject<THREE.Group>;
  lampRef: RefObject<THREE.Group>;
  visualState: HunterVisualState;
}) {
  const isSearching = visualState === "searching";
  const isAiming = visualState === "aiming" || visualState === "chasing";
  const isStunned = visualState === "stunned";
  const palette = getHunterPalette(visualState);

  return (
    <group scale={1.04}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[0.48, 0.34, 0.48]}>
        <circleGeometry args={[1, 18]} />
        <meshBasicMaterial color="#050805" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      <group ref={leftLegRef} position={[-0.13, 0.34, 0]}>
        <HunterLeg color={palette.pants} bootColor={palette.boots} side={-1} />
      </group>
      <group ref={rightLegRef} position={[0.13, 0.34, 0]}>
        <HunterLeg color={palette.pants} bootColor={palette.boots} side={1} />
      </group>

      <mesh castShadow receiveShadow position={[0, 0.72, 0]} scale={[0.34, 0.46, 0.25]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={palette.coat} roughness={0.88} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.54, 0.02]} scale={[0.4, 0.075, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#251711" roughness={0.82} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.83, 0.18]} scale={[0.16, 0.26, 0.055]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.shirt} roughness={0.84} flatShading />
      </mesh>

      <group position={[-0.34, 0.79, 0.03]} rotation={[-0.2, 0.25, 0.42]}>
        <HunterArm color={palette.coat} />
      </group>
      <group ref={rightArmRef} position={[0.35, 0.78, 0.04]}>
        <HunterArm color={palette.coat} />
      </group>

      <Rifle visualState={visualState} />
      <Lantern lampRef={lampRef} active={isSearching || isAiming} />

      <group ref={headRef} position={[0, 1.13, 0.03]}>
        <mesh castShadow receiveShadow scale={[0.19, 0.17, 0.17]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={palette.skin} roughness={0.78} flatShading />
        </mesh>
        <mesh position={[-0.07, 0.03, 0.145]} scale={[0.025, 0.018, 0.012]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#10130f" />
        </mesh>
        <mesh position={[0.07, 0.03, 0.145]} scale={[0.025, 0.018, 0.012]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#10130f" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.08, 0.05]} scale={[0.19, 0.035, 0.15]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={palette.scarf} roughness={0.78} flatShading />
        </mesh>
        <HunterHat hatColor={palette.hat} bandColor={palette.hatBand} />
      </group>

      {isStunned ? <StunnedStars /> : null}
      {isAiming ? <AimCone /> : null}
    </group>
  );
}

function HunterLeg({ color, bootColor, side }: { color: string; bootColor: string; side: -1 | 1 }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, -0.03, 0]} rotation={[0.05 * side, 0, 0.03 * side]} scale={[0.08, 0.34, 0.085]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.32, 0.08]} scale={[0.105, 0.055, 0.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={bootColor} roughness={0.92} flatShading />
      </mesh>
    </>
  );
}

function HunterArm({ color }: { color: string }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, -0.14, 0.02]} scale={[0.075, 0.28, 0.075]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.31, 0.05]} scale={[0.065, 0.075, 0.06]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#c4935f" roughness={0.82} flatShading />
      </mesh>
    </>
  );
}

function Rifle({ visualState }: { visualState: HunterVisualState }) {
  const isAiming = visualState === "aiming" || visualState === "chasing";

  return (
    <group
      position={[0.42, 0.74, 0.18]}
      rotation={[isAiming ? -0.05 : -0.28, isAiming ? -0.05 : -0.28, isAiming ? -0.16 : -0.56]}
    >
      <mesh castShadow receiveShadow position={[0, 0, 0.22]} scale={[0.055, 0.055, 0.45]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3a2418" roughness={0.82} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0.01, 0.006, 0.62]} rotation={[Math.PI / 2, 0, 0]} scale={[0.026, 0.026, 0.45]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#151815" roughness={0.74} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.03, -0.04, -0.2]} rotation={[0, 0, -0.28]} scale={[0.16, 0.07, 0.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#51321f" roughness={0.82} flatShading />
      </mesh>
    </group>
  );
}

function Lantern({ lampRef, active }: { lampRef: RefObject<THREE.Group>; active: boolean }) {
  return (
    <group ref={lampRef} position={[-0.47, 0.62, 0.2]} rotation={[-0.06, 0, 0.18]}>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]} scale={[0.06, 0.18, 0.06]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2a1c12" roughness={0.82} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.02, 0.08]} scale={[0.13, 0.16, 0.13]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#ffd574"
          emissive="#7a4f14"
          emissiveIntensity={active ? 1.35 : 0.65}
          roughness={0.68}
          flatShading
        />
      </mesh>
      <pointLight color="#ffd574" intensity={active ? 1.45 : 0.58} distance={4.7} />
      {active ? (
        <mesh position={[0, -0.04, 1.35]} rotation={[Math.PI / 2, 0, 0]} scale={[0.36, 1.9, 0.36]}>
          <coneGeometry args={[1, 1, 12, 1, true]} />
          <meshBasicMaterial color="#ffd574" transparent opacity={0.14} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
}

function HunterHat({ hatColor, bandColor }: { hatColor: string; bandColor: string }) {
  return (
    <group position={[0, 0.17, 0.01]} rotation={[0.03, 0, -0.05]}>
      <mesh castShadow receiveShadow scale={[0.32, 0.045, 0.24]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color={hatColor} roughness={0.86} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.075, 0]} scale={[0.18, 0.16, 0.17]}>
        <cylinderGeometry args={[1, 0.86, 1, 8]} />
        <meshStandardMaterial color={hatColor} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.13, 0]} scale={[0.18, 0.018, 0.17]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color={bandColor} roughness={0.72} emissive="#1a220d" flatShading />
      </mesh>
    </group>
  );
}

function AimCone() {
  return (
    <mesh position={[0.42, 0.74, 1.15]} rotation={[Math.PI / 2, 0, 0]} scale={[0.2, 1.3, 0.2]}>
      <coneGeometry args={[1, 1, 12, 1, true]} />
      <meshBasicMaterial color="#ff6262" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function StunnedStars() {
  return (
    <group position={[0, 1.55, 0]}>
      {[
        [-0.18, 0.02, 0.02],
        [0.08, 0.12, 0.04],
        [0.2, -0.02, -0.02]
      ].map((position, index) => (
        <mesh key={`hunter-stun-${index}`} position={position as [number, number, number]} scale={[0.045, 0.045, 0.045]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8dff7a" emissive="#315d21" emissiveIntensity={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function getHunterPalette(visualState: HunterVisualState) {
  if (visualState === "aiming" || visualState === "chasing") {
    return {
      coat: "#5e3f2a",
      shirt: "#9e7449",
      pants: "#3b3427",
      boots: "#17130e",
      hat: "#3b2518",
      hatBand: "#8dff7a",
      scarf: "#5b261d",
      skin: "#c99663"
    };
  }

  if (visualState === "stunned") {
    return {
      coat: "#4d5f45",
      shirt: "#8a9b6f",
      pants: "#354033",
      boots: "#151812",
      hat: "#2f3327",
      hatBand: "#8dff7a",
      scarf: "#766338",
      skin: "#b99566"
    };
  }

  if (visualState === "retreating") {
    return {
      coat: "#4d4430",
      shirt: "#9b7b51",
      pants: "#302c21",
      boots: "#17130f",
      hat: "#362616",
      hatBand: "#7ba763",
      scarf: "#624a2d",
      skin: "#bf8e5e"
    };
  }

  return {
    coat: "#65482f",
    shirt: "#c49a63",
    pants: "#332d22",
    boots: "#17120e",
    hat: "#3a2717",
    hatBand: "#8dff7a",
    scarf: "#70412a",
    skin: "#c99663"
  };
}
