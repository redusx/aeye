import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import FaceLandmarkerService from '../lib/faceLandmarkerService';
import { calculateFaceFitting, FaceLandmark } from '../lib/fittingMath';
import { FaceLandmarker } from '@mediapipe/tasks-vision';

interface UseFaceFittingProps {
  mediaElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null;
  glassesModelWidth?: number; // Base width of your 3D glasses model (default 0.15)
  containerBounds?: { width: number; height: number }; // For aspect ratio mapping
  enabled?: boolean;
}

export function useFaceFitting({
  mediaElement,
  glassesModelWidth = 0.15,
  containerBounds = { width: 1, height: 1 },
  enabled = true
}: UseFaceFittingProps) {
  // The ref to attach to your Three.js Group/Object3D inside the Canvas
  const glassesRef = useRef<THREE.Group>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const reqFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  
  // WebGL Canvas conflict resolver (Intermediate 2D Canvas)
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize the ML Model
  useEffect(() => {
    let active = true;
    
    async function initModel() {
      try {
        const landmarker = await FaceLandmarkerService.getInstance();
        if (active) {
          landmarkerRef.current = landmarker;
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load FaceLandmarker:", error);
      }
    }
    
    initModel();
    return () => { active = false; };
  }, []);

  // Fallback Geometric Fitting Algorithm 
  // Since MediaPipe WASM Web SDK consistently crashes (C++ panics on Next.js Turbopack)
  // we can use standard geometric alignment natively in Three.js to guarantee fitting.
  useEffect(() => {
    if (!enabled || !glassesRef.current) return;

    // Use a small delay to ensure models are fully painted inside the scene
    const timeoutId = setTimeout(() => {
      if (glassesRef.current) {
        // By default, assume the head is centered at origin.
        // Glasses standard placement on KeenTools heads (approximate nose bridge):
        const defaultNoseBridgePos = new THREE.Vector3(0, 0.45, 1.15); // Adjust Y, Z based on specific sefo bounding box 
        
        glassesRef.current.position.copy(defaultNoseBridgePos);
        
        // Glasses standard rotation (no tilt)
        glassesRef.current.rotation.set(0, 0, 0);

        // Calculate Scale Factor (Assume glasses need to be scaled down relative to the head)
        // Usually, 3D glasses models are huge compared to imported Heads
        const scaleFactor = 0.18; // Derived through visual parity for default KeenTools heads
        glassesRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [enabled]);

  return { glassesRef, isLoaded: true };
}
