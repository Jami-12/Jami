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
            color="#0a0a0a"
            metalness={0.35}
            roughness={0.5}
            flatShading
          />
        </mesh>
        <mesh scale={1.012} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.28, 1]} />
          <meshBasicMaterial
            color="#fafafa"
            wireframe
            transparent
            opacity={0.24}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.2, 0.35]} position={[0, -0.05, 0]}>
          <torusGeometry args={[1.95, 0.022, 16, 160]} />
          <meshStandardMaterial
            color="#fafafa"
            metalness={0.55}
            roughness={0.35}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, 0.9, -0.4]} position={[0, 0, 0]}>
          <torusGeometry args={[2.18, 0.012, 12, 160]} />
          <meshStandardMaterial
            color="#a3a3a3"
            metalness={0.5}
            roughness={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[0.3, 0.4, 0.1]}>
          <ringGeometry args={[1.62, 1.66, 96]} />
          <meshBasicMaterial color="#fafafa" transparent opacity={0.18} side={2} />
        </mesh>
      </Float>

      <Float speed={paused ? 0 : 2} floatIntensity={paused ? 0 : 1.4}>
        <mesh position={[2.15, 0.95, 0.4]}>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial
            color="#fafafa"
            metalness={0.3}
            roughness={0.3}
          />
        </mesh>
      </Float>
      <Float speed={paused ? 0 : 1.7} floatIntensity={paused ? 0 : 1.1}>
        <mesh position={[-2.2, -0.75, 0.6]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#fafafa" metalness={0.2} roughness={0.4} />
        </mesh>
      </Float>
      <Float speed={paused ? 0 : 2.2} floatIntensity={paused ? 0 : 1.6}>
        <mesh position={[-1.75, 1.65, -0.5]}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color="#525252" metalness={0.4} roughness={0.35} />
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
      <pointLight position={[-4, -2, 4]} intensity={12} color="#fafafa" />
      <pointLight position={[2, 3, -4]} intensity={10} color="#a3a3a3" />
      <spotLight
        position={[0, 5, 2]}
        angle={0.46}
        penumbra={1}
        intensity={12}
        color="#fafafa"
      />

      <Sculpture paused={reducedMotion} />

      <ContactShadows
        position={[0, -1.78, 0]}
        opacity={0.42}
        scale={9}
        blur={2.6}
        far={4.2}
        color="#000000"
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
