"use client";

import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment } from "@react-three/drei";
import type { Group } from "three";

// ─── Global WebGL Context Slot Manager ───────────────────────────────
// Browsers limit simultaneous WebGL contexts to ~8-16.
// This manager ensures only MAX_CONTEXTS canvases are mounted at once
// and recycles slots as cards scroll in/out of the viewport.
const MAX_CONTEXTS = 8;
let activeCount = 0;
const waitQueue: Array<() => void> = [];

function requestSlot(): Promise<void> {
  if (activeCount < MAX_CONTEXTS) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waitQueue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  activeCount--;
  if (waitQueue.length > 0) {
    const next = waitQueue.shift();
    next?.();
  }
}
// ─────────────────────────────────────────────────────────────────────

interface Product3DViewProps {
  modelPath: string;
  className?: string;
}

function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<Group>(null);

  return (
    <Center>
      <primitive ref={groupRef} object={scene.clone()} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#a0a0a0" wireframe />
    </mesh>
  );
}

function Product3DCanvas({ modelPath }: { modelPath: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ powerPreference: "default", antialias: true }}
    >
      {/* Environment map for PBR material reflections */}
      <Environment preset="studio" />

      {/* Direct lights for fill and rim */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-3, 3, -5]} intensity={0.8} />
      <directionalLight position={[0, -3, 2]} intensity={0.4} />

      {/* Model */}
      <Suspense fallback={<LoadingFallback />}>
        <Model modelPath={modelPath} />
      </Suspense>

      {/* Horizontal rotation only, limited to ±90° */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

export function Product3DView({ modelPath, className }: Product3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canMount, setCanMount] = useState(false);
  const hasSlotRef = useRef(false);

  // Observe visibility: acquire slot when visible, release when hidden
  const acquireSlot = useCallback(async () => {
    if (hasSlotRef.current) return;
    await requestSlot();
    hasSlotRef.current = true;
    setCanMount(true);
  }, []);

  const freeSlot = useCallback(() => {
    if (!hasSlotRef.current) return;
    hasSlotRef.current = false;
    setCanMount(false);
    releaseSlot();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          acquireSlot();
        } else {
          freeSlot();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      freeSlot();
    };
  }, [acquireSlot, freeSlot]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      {canMount && <Product3DCanvas modelPath={modelPath} />}
    </div>
  );
}
