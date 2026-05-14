'use client';

import React, { useRef, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float } from '@react-three/drei';
import { SectionType } from './HeroSection';
import * as THREE from 'three';

const SECTION_ROTATION: Record<SectionType, number> = {
  intro: 0,
  features: Math.PI * 0.5,
  capabilities: Math.PI * 1.2,
  demos: Math.PI * 2,
};

function Scene({
  section,
  scrollProgress,
}: {
  section: SectionType;
  scrollProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera, size } = useThree();
  const targetRotationX = useRef(SECTION_ROTATION[section]);
  const currentRotationX = useRef(SECTION_ROTATION[section]);

  const stoneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2a2a2c';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const grey = Math.floor(Math.random() * 40) + 20;
      ctx.fillStyle = `rgb(${grey},${grey},${grey})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  useEffect(() => {
    targetRotationX.current = SECTION_ROTATION[section];
  }, [section]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    const target = targetRotationX.current;
    const current = currentRotationX.current;
    const diff = target - current;
    currentRotationX.current = current + diff * 0.08;

    meshRef.current.rotation.x = currentRotationX.current;
    meshRef.current.rotation.y = t * 0.18;
    meshRef.current.rotation.z = 0.15;
  });

  return (
    <mesh ref={meshRef} scale={1.9}>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial
        map={stoneTexture}
        bumpMap={stoneTexture}
        bumpScale={0.015}
        roughness={1}
        metalness={0.1}
        flatShading={false}
      />
    </mesh>
  );
}

export const HeroSphere = memo(function HeroSphere({
  section,
  scrollProgress,
}: {
  section: SectionType;
  scrollProgress: number;
}) {
  return (
    <div className="h-[350px] w-[350px] lg:h-[420px] lg:w-[420px]">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />

        <directionalLight position={[10, 5, 5]} intensity={3} color="#ffffff" />
        <ambientLight intensity={0.1} />

        <Float speed={0}>
          <Scene section={section} scrollProgress={scrollProgress} />
        </Float>
      </Canvas>
    </div>
  );
});