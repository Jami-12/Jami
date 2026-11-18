"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls } from "@react-three/drei";
import type { Group } from "three";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";

function Sculpture({ paused }: { paused: boolean }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (paused || !group.current) return;
    group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <Float
        speed={paused ? 0 : 1.5}
        rotationIntensity={paused ? 0 : 0.35}
        floatIntensity={paused ? 0 : 0.85}
      >
        <mesh castShadow position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.28, 1]} />
          <meshStandardMaterial
            color="#2C4561"
            metalness={0.72}
            roughness={0.22}
            flatShading
          />
        </mesh>
        <mesh scale={1.012} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.28, 1]} />
          <meshBasicMaterial
            color="#5A83AB"
            wireframe
            transparent
            opacity={0.28}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.2, 0.35]} position={[0, -0.05, 0]}>
          <torusGeometry args={[1.95, 0.022, 16, 160]} />
          <meshStandardMaterial
            color="#5A83AB"
            metalness={0.9}
            roughness={0.2}
            emissive="#2C4561"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, 0.9, -0.4]} position={[0, 0, 0]}>
          <torusGeometry args={[2.18, 0.012, 12, 160]} />
          <meshStandardMaterial
            color="#97B3CE"
            metalness={0.8}
            roughness={0.3}
            transparent
            opacity={0.65}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[0.3, 0.4, 0.1]}>
          <ringGeometry args={[1.62, 1.66, 96]} />
          <meshBasicMaterial color="#5A83AB" transparent opacity={0.22} side={2} />
        </mesh>
      </Float>

      <Float speed={paused ? 0 : 2} floatIntensity={paused ? 0 : 1.4}>
        <mesh position={[2.15, 0.95, 0.4]}>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial
            color="#5A83AB"
            metalness={0.4}
            roughness={0.18}
            emissive="#2C4561"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
      <Float speed={paused ? 0 : 1.7} floatIntensity={paused ? 0 : 1.1}>
        <mesh position={[-2.2, -0.75, 0.6]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.2} roughness={0.4} />
        </mesh>
      </Float>
      <Float speed={paused ? 0 : 2.2} floatIntensity={paused ? 0 : 1.6}>
        <mesh position={[-1.75, 1.65, -0.5]}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color="#2C4561" metalness={0.7} roughness={0.2} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 6.2], fov: 38 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
      aria-label="Interactive 3D sculpture"
      role="img"
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, -2, 4]} intensity={22} color="#5A83AB" />
      <pointLight position={[2, 3, -4]} intensity={14} color="#F8FAFC" />
      <spotLight
        position={[0, 5, 2]}
        angle={0.46}
        penumbra={1}
        intensity={18}
        color="#97B3CE"
      />

      <Sculpture paused={reducedMotion} />

      <ContactShadows
        position={[0, -1.78, 0]}
        opacity={0.42}
        scale={9}
        blur={2.6}
        far={4.2}
        color="#0b1420"
      />

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.75}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.75}
        rotateSpeed={0.55}
      />
    </Canvas>
  );
}
