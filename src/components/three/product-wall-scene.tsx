"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Image } from "@react-three/drei";
import type { Group } from "three";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";

export interface WallItem {
  id: string;
  name: string;
  image: string;
  href: string;
}

const LAYOUT = [
  { position: [-2.25, 0.42, -0.55] as const, rotation: [0, 0.34, 0] as const, scale: [1.35, 1.68] as const },
  { position: [-0.78, -0.18, 0.06] as const, rotation: [0, 0.16, 0] as const, scale: [1.5, 1.88] as const },
  { position: [0.82, 0.3, 0.22] as const, rotation: [0, -0.14, 0] as const, scale: [1.5, 1.88] as const },
  { position: [2.3, -0.22, -0.4] as const, rotation: [0, -0.34, 0] as const, scale: [1.35, 1.68] as const },
  { position: [0.05, 0.95, -1.25] as const, rotation: [0, 0, 0] as const, scale: [1.15, 1.45] as const },
];

function Panel({ item, index }: { item: WallItem; index: number }) {
  const layout = LAYOUT[index % LAYOUT.length]!;
  const [hovered, setHovered] = useState(false);

  return (
    <group position={layout.position} rotation={layout.rotation}>
      <Float
        speed={1.15 + index * 0.12}
        rotationIntensity={0.08}
        floatIntensity={0.32}
      >
        <mesh position={[0, 0, -0.04]} scale={[layout.scale[0] + 0.1, layout.scale[1] + 0.1, 1]}>
          <planeGeometry />
          <meshStandardMaterial color="#0f766e" metalness={0.65} roughness={0.3} />
        </mesh>
        {/* drei's Image takes `url`, not an `alt`; the link list below carries accessible names. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          url={item.image}
          scale={[layout.scale[0], layout.scale[1]]}
          toneMapped={false}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
        <mesh position={[0, 0, 0.01]} scale={[layout.scale[0], layout.scale[1], 1]}>
          <planeGeometry />
          <meshBasicMaterial
            color="#5eead4"
            transparent
            opacity={hovered ? 0.16 : 0}
          />
        </mesh>
      </Float>
    </group>
  );
}

function WallGroup({ items }: { items: WallItem[] }) {
  const group = useRef<Group>(null);
  const paused = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!group.current || paused) return;
    const targetY = state.pointer.x * 0.1;
    const targetX = state.pointer.y * 0.04;
    group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(1, delta * 2.4);
    group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(1, delta * 2.4);
  });

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      {items.slice(0, LAYOUT.length).map((item, index) => (
        <Panel key={item.id} item={item} index={index} />
      ))}
    </group>
  );
}

export default function ProductWallScene({ items }: { items: WallItem[] }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.2, 6.4], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 6]} intensity={1.9} />
      <pointLight position={[-4, 1, 3]} intensity={14} color="#5eead4" />
      <spotLight position={[0, 5, 2]} angle={0.55} penumbra={1} intensity={16} color="#F8FAFC" />
      <WallGroup items={items} />
      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.35}
        scale={12}
        blur={2.8}
        far={5}
        color="#020617"
      />
    </Canvas>
  );
}
