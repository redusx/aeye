import * as THREE from 'three';

/**
 * glassesFitter.ts
 * 
 * Dynamically positions and scales a glasses model onto a head model
 * using pure 3D Bounding Box geometry — no ML or 2D vision required.
 * 
 * Algorithm:
 * 1. Compute the Bounding Box of the head model to find its center and dimensions.
 * 2. Estimate the "nose bridge" position from the head geometry.
 * 3. Compute the Bounding Box of the glasses model to find its center and dimensions.
 * 4. Calculate scale factor so the glasses width matches the head width at eye level.
 * 5. Position the glasses so their center sits at the estimated nose bridge.
 */

export interface FittingConfig {
  /** Ratio of glasses width to head width. 
   *  ~0.75 means glasses span 75% of head width. Adjust per aesthetic preference. */
  widthRatio?: number;

  /** Vertical offset from head center as a fraction of head height.
   *  Positive = up. The nose bridge is typically ~15-20% above center. */
  verticalOffsetRatio?: number;

  /** Forward offset from head center as a fraction of head depth.
   *  Positive = toward camera (front of face). */
  depthOffsetRatio?: number;
}

const DEFAULT_CONFIG: Required<FittingConfig> = {
  widthRatio: 0.47,           // Glasses span ~47% of head width (ear-to-ear)
  verticalOffsetRatio: 0.04,  // Eyes sit just above center, ~4% offset
  depthOffsetRatio: 0.45,     // Push glasses to front of face
};

/**
 * Computes world-space Bounding Box for an object, accounting for 
 * all nested children and their transforms.
 */
function getWorldBoundingBox(object: THREE.Object3D): THREE.Box3 {
  // Ensure world matrices are up to date
  object.updateWorldMatrix(true, true);
  
  const box = new THREE.Box3();
  
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geo = child.geometry;
      if (!geo.boundingBox) geo.computeBoundingBox();
      if (geo.boundingBox) {
        const cloned = geo.boundingBox.clone();
        cloned.applyMatrix4(child.matrixWorld);
        box.union(cloned);
      }
    }
  });

  return box;
}

/**
 * Core fitting function. Call this after both head and glasses scenes are loaded.
 * 
 * @param headObject - The root Object3D of the head model
 * @param glassesObject - The root Object3D/Group of the glasses model
 * @param config - Optional tuning parameters
 */
export function fitGlassesToHead(
  headObject: THREE.Object3D,
  glassesObject: THREE.Object3D,
  config: FittingConfig = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // ── Step 1: Analyze Head Geometry ──────────────────────────────────
  const headBox = getWorldBoundingBox(headObject);
  const headSize = new THREE.Vector3();
  headBox.getSize(headSize);
  const headCenter = new THREE.Vector3();
  headBox.getCenter(headCenter);

  if (headSize.length() === 0) {
    console.warn('[glassesFitter] Head bounding box is empty. Models may not be loaded yet.');
    return;
  }

  // Head dimensions (assuming Y-up, Z-forward model):
  //   headSize.x = width (ear to ear)
  //   headSize.y = height (chin to top)
  //   headSize.z = depth (back to front)
  const headWidth = headSize.x;
  const headHeight = headSize.y;
  const headDepth = headSize.z;

  // ── Step 2: Estimate Nose Bridge Position ──────────────────────────
  // The nose bridge sits:
  //   X: centered (headCenter.x)
  //   Y: slightly above center (~15% of height above center)
  //   Z: at the front face of the head
  const noseBridgePosition = new THREE.Vector3(
    headCenter.x,
    headCenter.y + headHeight * cfg.verticalOffsetRatio,
    headCenter.z + headDepth * cfg.depthOffsetRatio
  );

  // ── Step 3: Analyze Glasses Geometry ───────────────────────────────
  // Reset glasses transform to identity to measure intrinsic size
  glassesObject.position.set(0, 0, 0);
  glassesObject.rotation.set(0, 0, 0);
  glassesObject.scale.set(1, 1, 1);
  glassesObject.updateWorldMatrix(true, true);

  const glassesBox = getWorldBoundingBox(glassesObject);
  const glassesSize = new THREE.Vector3();
  glassesBox.getSize(glassesSize);
  const glassesCenter = new THREE.Vector3();
  glassesBox.getCenter(glassesCenter);

  if (glassesSize.length() === 0) {
    console.warn('[glassesFitter] Glasses bounding box is empty. Model may not be loaded yet.');
    return;
  }

  const glassesWidth = glassesSize.x;

  // ── Step 4: Calculate Scale Factor ─────────────────────────────────
  // We want glasses to span cfg.widthRatio of the head width
  const targetWidth = headWidth * cfg.widthRatio;
  const scaleFactor = targetWidth / glassesWidth;

  // ── Step 5: Apply Transform ────────────────────────────────────────
  // Scale first
  glassesObject.scale.set(scaleFactor, scaleFactor, scaleFactor);

  // After scaling, the glasses' center has moved. Recalculate:
  const scaledGlassesCenter = glassesCenter.clone().multiplyScalar(scaleFactor);

  // Position = noseBridgePosition - scaledGlassesCenter
  // This ensures the CENTER of the glasses sits at the nose bridge,
  // regardless of where the model's origin/pivot point is.
  glassesObject.position.set(
    noseBridgePosition.x - scaledGlassesCenter.x,
    noseBridgePosition.y - scaledGlassesCenter.y,
    noseBridgePosition.z - scaledGlassesCenter.z
  );

  // No rotation correction (assumes both models share the same up/forward convention)
  glassesObject.rotation.set(0, 0, 0);

  console.log('[glassesFitter] Fitting complete:', {
    headSize: { w: headWidth.toFixed(3), h: headHeight.toFixed(3), d: headDepth.toFixed(3) },
    headCenter: headCenter.toArray().map(v => v.toFixed(3)),
    glassesIntrinsicWidth: glassesWidth.toFixed(3),
    scaleFactor: scaleFactor.toFixed(4),
    finalPosition: glassesObject.position.toArray().map(v => v.toFixed(3)),
  });
}
