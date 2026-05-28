import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  Box3,
  Color,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3
} from "three";
import type { HunterVisualState, PredatorEntity } from "../game/entities";

const hunterModelUrl = new URL("../models/hunter.glb", import.meta.url).href;

export default function HunterModel({ hunter }: { hunter: PredatorEntity }) {
  const groupRef = useRef<Group>(null);
  const lampRef = useRef<Group>(null);
  const gltf = useGLTF(hunterModelUrl);
  const model = useMemo(() => prepareModel(gltf.scene, 1.72), [gltf.scene]);

  useEffect(() => {
    applyHunterMaterialState(model.object, hunter.visualState);
  }, [hunter.visualState, model.object]);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.elapsedTime;
    const patrolStep = hunter.visualState === "patrolling" ? Math.sin(time * 5.2) : 0;
    const searchSweep =
      hunter.visualState === "searching" ? Math.sin(time * 2.2) * 0.7 : 0;
    const chaseLean = hunter.visualState === "chasing" ? -0.2 : 0;
    const stunnedWobble =
      hunter.visualState === "stunned" ? Math.sin(time * 12) * 0.18 : 0;
    const retreatOffset = hunter.visualState === "retreating" ? Math.sin(time * 4) * 0.07 : 0;

    groupRef.current.position.y = hunter.position[1] + Math.abs(patrolStep) * 0.035;
    groupRef.current.rotation.set(
      stunnedWobble,
      searchSweep + stunnedWobble * 0.4,
      chaseLean + stunnedWobble
    );
    groupRef.current.position.x = retreatOffset;

    if (lampRef.current) {
      lampRef.current.rotation.y = searchSweep;
    }
  });

  return (
    <RigidBody type="fixed" colliders="cuboid" position={hunter.position}>
      <group ref={groupRef}>
        <HunterDetectionRing hunter={hunter} />
        <primitive object={model.object} scale={model.scale} />
        <HunterGear lampRef={lampRef} visualState={hunter.visualState} />
      </group>
    </RigidBody>
  );
}

function HunterDetectionRing({ hunter }: { hunter: PredatorEntity }) {
  const color = hunter.visualState === "aiming" ? "#ff6262" : "#d8903a";

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
      <ringGeometry args={[hunter.detectionRange - 0.03, hunter.detectionRange, 36]} />
      <meshBasicMaterial color={color} transparent opacity={0.13} />
    </mesh>
  );
}

function HunterGear({
  lampRef,
  visualState
}: {
  lampRef: RefObject<Group>;
  visualState: HunterVisualState;
}) {
  const isAiming = visualState === "aiming" || visualState === "chasing";

  return (
    <>
      <group position={[0.24, 0.94, 0]} rotation={[0, 0, -0.08]}>
        <mesh castShadow scale={[0.36, 0.045, 0.3]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color="#2a251f" roughness={0.86} flatShading />
        </mesh>
        <mesh castShadow position={[0, 0.08, 0]} scale={[0.2, 0.16, 0.2]}>
          <cylinderGeometry args={[1, 0.86, 1, 8]} />
          <meshStandardMaterial color="#5b452c" roughness={0.9} flatShading />
        </mesh>
      </group>

      <group
        position={[0.46, 0.56, 0.04]}
        rotation={[0.05, isAiming ? -0.36 : -0.82, isAiming ? -0.18 : -0.55]}
      >
        <mesh castShadow position={[0.12, 0, 0]} scale={[0.52, 0.045, 0.045]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#382b20" roughness={0.8} flatShading />
        </mesh>
        <mesh castShadow position={[0.54, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.035, 0.035, 0.68]}>
          <cylinderGeometry args={[1, 1, 1, 6]} />
          <meshStandardMaterial color="#181b19" roughness={0.7} flatShading />
        </mesh>
      </group>

      <group ref={lampRef} position={[-0.42, 0.52, 0.12]}>
        <mesh castShadow scale={[0.14, 0.18, 0.14]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#f7d66a" emissive="#7a4f14" flatShading />
        </mesh>
        <pointLight color="#f7d66a" intensity={visualState === "searching" ? 1.2 : 0.45} distance={4} />
      </group>

      {isAiming ? (
        <mesh position={[1.28, 0.54, 0.04]} rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.12, 1.4, 12, 1, true]} />
          <meshBasicMaterial color="#ff6262" transparent opacity={0.2} />
        </mesh>
      ) : null}
    </>
  );
}

function prepareModel(scene: Object3D, targetSize: number) {
  const object = scene.clone(true);

  object.traverse((child) => {
    if (!(child as Mesh).isMesh) {
      return;
    }

    const mesh = child as Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.material = cloneMaterials(mesh.material);

    getMaterials(mesh.material).forEach((material) => {
      if (material instanceof MeshStandardMaterial) {
        material.userData.baseColor = material.color.clone();
        material.flatShading = true;
        material.roughness = 0.88;
        material.needsUpdate = true;
      }
    });
  });

  const bounds = new Box3().setFromObject(object);
  const size = new Vector3();
  const center = new Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  object.position.sub(center);

  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);

  return {
    object,
    scale: targetSize / maxDimension
  };
}

function applyHunterMaterialState(object: Object3D, visualState: HunterVisualState) {
  const tint = new Color(
    visualState === "aiming"
      ? "#734238"
      : visualState === "stunned"
        ? "#6d8767"
        : visualState === "retreating"
          ? "#4f5d45"
          : "#6a543a"
  );

  object.traverse((child) => {
    if (!(child as Mesh).isMesh) {
      return;
    }

    const mesh = child as Mesh;
    getMaterials(mesh.material).forEach((material) => {
      if (!(material instanceof MeshStandardMaterial)) {
        return;
      }

      const baseColor = material.userData.baseColor as Color | undefined;
      material.color.copy(baseColor ?? new Color("#6a543a")).lerp(tint, 0.36);
      material.emissive.set(visualState === "aiming" ? "#2a0808" : "#000000");
      material.needsUpdate = true;
    });
  });
}

function cloneMaterials(material: Mesh["material"]) {
  const cloned = getMaterials(material).map((entry) => entry.clone());
  return Array.isArray(material) ? cloned : cloned[0];
}

function getMaterials(material: Mesh["material"]): Material[] {
  return Array.isArray(material) ? material : [material];
}

useGLTF.preload(hunterModelUrl);
