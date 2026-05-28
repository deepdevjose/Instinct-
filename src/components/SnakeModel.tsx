import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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
import type { SnakeEntity, SnakeVisualState } from "../game/entities";

const snakeModelUrl = new URL("../models/snake.glb", import.meta.url).href;

interface SnakeModelProps {
  snake: SnakeEntity;
  pulse: number;
}

export default function SnakeModel({ snake, pulse }: SnakeModelProps) {
  const groupRef = useRef<Group>(null);
  const gltf = useGLTF(snakeModelUrl);
  const visualState = snake.state;
  const model = useMemo(() => prepareModel(gltf.scene, 1.95), [gltf.scene]);

  useEffect(() => {
    applySnakeMaterialState(model.object, visualState);
  }, [model.object, visualState]);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.elapsedTime;
    const isMoving = visualState === "moving";
    const isAttacking = visualState === "attacking";
    const isDead = visualState === "dead";
    const isHiding = visualState === "hiding";
    const isNewborn = visualState === "newborn";
    const speed = isMoving ? 6.6 : isNewborn ? 4.8 : 1.8;
    const bodyWave = Math.sin(time * speed + pulse) * (isMoving ? 0.16 : 0.045);
    const attackLunge = isAttacking ? Math.sin(time * 12) * 0.18 : 0;
    const hideDrop = isHiding ? -0.05 : 0;
    const hatchRise = isNewborn ? 0.14 + Math.sin(time * 4.8) * 0.026 : 0;

    groupRef.current.position.set(
      snake.position[0] + Math.cos(snake.rotation) * attackLunge,
      snake.position[1] + 0.18 + hideDrop + hatchRise,
      snake.position[2] + Math.sin(snake.rotation) * attackLunge
    );
    groupRef.current.rotation.set(
      isDead ? 0.12 : 0,
      -snake.rotation + bodyWave * 0.22,
      isDead ? -0.78 : bodyWave * 0.12
    );

    const stateScale =
      visualState === "newborn"
        ? 0.84 + Math.sin(time * 5.2) * 0.015
        : visualState === "old"
          ? 0.94
          : visualState === "attacking"
            ? 1.05
            : 1;
    groupRef.current.scale.setScalar(stateScale);
  });

  if (visualState === "egg") {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={model.object} scale={model.scale} />
      <SnakeHat visualState={visualState} />
      <SnakeStateAura visualState={visualState} />
      <NewbornReveal visualState={visualState} />
    </group>
  );
}

function SnakeHat({ visualState }: { visualState: SnakeVisualState }) {
  const tilt = visualState === "dead" ? -0.55 : visualState === "attacking" ? 0.22 : 0;

  return (
    <group position={[0.38, 0.56, 0]} rotation={[0.02, 0, tilt]}>
      <mesh castShadow receiveShadow scale={[0.42, 0.055, 0.32]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#20241f" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]} scale={[0.22, 0.18, 0.22]}>
        <cylinderGeometry args={[1, 0.82, 1, 8]} />
        <meshStandardMaterial color="#34382f" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[0, 0.19, 0]} scale={[0.24, 0.018, 0.24]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#8dff7a" emissive="#24431c" flatShading />
      </mesh>
    </group>
  );
}

function SnakeStateAura({ visualState }: { visualState: SnakeVisualState }) {
  if (!["newborn", "attacking", "shedding", "protecting_children", "dead"].includes(visualState)) {
    return null;
  }

  const colorByState: Record<string, string> = {
    newborn: "#ffd27a",
    attacking: "#8dff7a",
    shedding: "#d7ffc1",
    protecting_children: "#7bd3ff",
    dead: "#ff5a5a"
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
      <ringGeometry args={[0.88, 0.96, 18]} />
      <meshBasicMaterial
        color={colorByState[visualState]}
        transparent
        opacity={visualState === "dead" ? 0.28 : visualState === "newborn" ? 0.52 : 0.46}
      />
    </mesh>
  );
}

function NewbornReveal({ visualState }: { visualState: SnakeVisualState }) {
  const groupRef = useRef<Group>(null);

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
    <group ref={groupRef} rotation={[0, 0.35, 0]}>
      <pointLight color="#8dff7a" intensity={1.4} distance={3.2} position={[0.12, 0.55, 0.04]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, 0.08, 0]}>
        <ringGeometry args={[0.72, 0.84, 28]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.48} depthWrite={false} />
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[0.02, 0.28, 0.02]}
        rotation={[Math.PI / 2, 0.02, 0.18]}
        scale={[0.52, 0.38, 0.52]}
      >
        <torusGeometry args={[1, 0.18, 8, 24]} />
        <meshStandardMaterial color="#5ca955" emissive="#12310f" roughness={0.84} flatShading />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[0.36, 0.46, 0.06]}
        rotation={[0.12, 0, -0.22]}
        scale={[0.42, 0.16, 0.2]}
      >
        <capsuleGeometry args={[0.28, 0.58, 4, 8]} />
        <meshStandardMaterial color="#6ccf63" emissive="#143c10" roughness={0.82} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0.74, 0.52, 0.08]} scale={[0.22, 0.16, 0.18]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#dfff9b" emissive="#1d4c12" roughness={0.82} flatShading />
      </mesh>
      <mesh position={[0.82, 0.56, 0.02]} rotation={[0, 0, -0.6]} scale={[0.16, 0.035, 0.035]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#8dff7a" emissive="#1d4c12" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0.82, 0.5, 0.12]} rotation={[0, 0, 0.6]} scale={[0.16, 0.035, 0.035]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#8dff7a" emissive="#1d4c12" roughness={0.7} flatShading />
      </mesh>
    </group>
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
        material.roughness = 0.92;
        material.metalness = 0.02;
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

function applySnakeMaterialState(object: Object3D, visualState: SnakeVisualState) {
  const tint = new Color(
    visualState === "dead"
      ? "#5b5051"
      : visualState === "hiding"
        ? "#40573c"
        : visualState === "old"
          ? "#9ba17b"
          : visualState === "shedding"
            ? "#d6ffc4"
            : visualState === "attacking"
              ? "#8dff7a"
              : "#71c663"
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
      material.color.copy(baseColor ?? new Color("#71c663")).lerp(tint, 0.42);
      material.transparent = visualState === "hiding" || visualState === "dead";
      material.opacity =
        visualState === "hiding" ? 0.38 : visualState === "dead" ? 0.72 : 1;
      material.emissive.set(visualState === "attacking" ? "#183b12" : "#000000");
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

useGLTF.preload(snakeModelUrl);
