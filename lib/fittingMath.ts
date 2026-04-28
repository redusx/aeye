import * as THREE from 'three';

export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export interface FittingResult {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

/**
 * Maps MediaPipe normalized landmarks to Three.js coordinates and extracts
 * the fitting transform for the 3D glasses.
 * 
 * @param landmarks MediaPipe landmarks array (468 points)
 * @param modelWidth Default width of the 3D glasses model (used for scaling ratio)
 * @param containerBounds Width and height of the Canvas/Container to map normalized values
 */
export function calculateFaceFitting(
  landmarks: FaceLandmark[],
  modelWidth: number = 0.15, // Default glasses model width in 3D units (e.g. 15cm)
  containerBounds: { width: number; height: number } = { width: 1, height: 1 }
): FittingResult {
  if (!landmarks || landmarks.length < 468) {
    return {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
    };
  }

  // Common Landmark Indices
  const NOSE_BRIDGE = 168; // Center between eyes
  const NOSE_TIP = 1;
  const CHIN = 152;
  const FOREHEAD = 10;
  const LEFT_EYE_OUTER = 33;
  const RIGHT_EYE_OUTER = 263;

  const getPoint = (index: number) => {
    const pt = landmarks[index];
    // Map normalized [0, 1] to centered coordinates
    // Convert Y to match Three.js coordinate system (Y goes up, so invert normalized Y)
    return new THREE.Vector3(
      (pt.x - 0.5) * containerBounds.width,
      -(pt.y - 0.5) * containerBounds.height,
      -pt.z * containerBounds.width // Z depth is roughly scaled by image width
    );
  };

  const noseBridge = getPoint(NOSE_BRIDGE);
  const leftEyeOuter = getPoint(LEFT_EYE_OUTER);
  const rightEyeOuter = getPoint(RIGHT_EYE_OUTER);
  const noseTip = getPoint(NOSE_TIP);
  const chin = getPoint(CHIN);
  const forehead = getPoint(FOREHEAD);

  // --- 1. POSITION ---
  // Set pivot to the nose bridge
  const position = noseBridge.clone();

  // --- 2. ROTATION ---
  // Z Rotation (Roll): Angle between the two outer eye corners
  const dy = rightEyeOuter.y - leftEyeOuter.y;
  const dx = rightEyeOuter.x - leftEyeOuter.x;
  const rollZ = Math.atan2(dy, dx); 

  // Y Rotation (Yaw): Left/Right turn of the head. 
  // We can measure this by comparing z-depth of the eyes
  const dzEye = rightEyeOuter.z - leftEyeOuter.z;
  const yawY = Math.asin(dzEye / leftEyeOuter.distanceTo(rightEyeOuter)); // Approximated yaw

  // X Rotation (Pitch): Up/Down tilt of the head.
  // Using Forehead and Chin vector.
  const faceVector = new THREE.Vector3().subVectors(chin, forehead);
  // Ideally, faceVector points straight down in Y (0, -1, 0)
  // Pitch is the angle away from the Y-axis in the Y-Z plane
  const pitchX = Math.atan2(faceVector.z, -faceVector.y);

  // Compile to an Euler angle (Order YXZ or ZYX depending on the rig)
  const rotation = new THREE.Euler(pitchX, -yawY, rollZ, 'YXZ');

  // --- 3. SCALING ---
  // Distance between eye corners in 3D space
  const faceWidthAtEyes = leftEyeOuter.distanceTo(rightEyeOuter);
  
  // Calculate the scale multiplier relative to the default 3DBoundingBox of the glasses
  // We multiply the base scale ensuring it looks realistic on the face
  // Adding a slight offset because the real head is wider than just eye corners
  const scaleFactor = (faceWidthAtEyes * 1.5) / modelWidth; 
  
  const scale = new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor);

  return { position, rotation, scale };
}
