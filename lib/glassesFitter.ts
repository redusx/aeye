import * as THREE from 'three';

/**
 * glassesFitter.ts
 * 
 * Dynamically positions and scales a glasses model onto a head model
 * using pure 3D Bounding Box geometry — no ML or 2D vision required.
 * 
 * Algorithm:
 * 1. Compute the world-space Bounding Box of the head model.
 * 2. Compute the intrinsic Bounding Box of the glasses model (at identity transform).
 * 3. Calculate scale so glasses width matches a fraction of head width.
 * 4. For DEPTH (Z): Align the glasses' FRONT face (max Z after scaling) with the
 *    head's front surface, then recess inward by a configurable ratio. This ensures
 *    the lenses sit flush against the face regardless of temple arm length.
 * 5. For VERTICAL (Y): Place at eye level (slightly above bbox center).
 * 6. For HORIZONTAL (X): Center on head.
 */

export interface FittingConfig {
  /** Ratio of glasses width to head width.
   *  0.47 = glasses span 47% of head width (ear-to-ear). */
  widthRatio?: number;

  /** Vertical offset from head center as a fraction of head height.
   *  Positive = up. ~0.04 means eyes sit 4% above bbox center. */
  verticalOffsetRatio?: number;

  /** How far the glasses front surface should be recessed FROM the head's 
   *  front surface (headBox.max.z), as a fraction of head depth.
   *  0 = flush with forehead/nose tip. 
   *  0.08 = recessed 8% of head depth behind the front surface.
   *  Higher values push the glasses further into/behind the face. */
  depthRecessRatio?: number;
}

const DEFAULT_CONFIG: Required<FittingConfig> = {
  widthRatio: 0.47,           // Glasses span ~47% of head width
  verticalOffsetRatio: 0.04,  // Eyes ~4% above bbox center
  depthRecessRatio: 0.16,     // Glasses front surface sits 16% of head depth behind forehead
};

/**
 * Computes world-space Bounding Box for an object, accounting for 
 * all nested children and their transforms.
 */
function getWorldBoundingBox(object: THREE.Object3D): THREE.Box3 {
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
    console.warn('[glassesFitter] Head bounding box is empty.');
    return;
  }

  const headWidth = headSize.x;   // ear to ear
  const headHeight = headSize.y;  // chin to top
  const headDepth = headSize.z;   // back to front
  const headFrontZ = headBox.max.z; // Z coordinate of the forehead/nose tip (front face)

  // ── Step 2: Measure Glasses at Identity ────────────────────────────
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
    console.warn('[glassesFitter] Glasses bounding box is empty.');
    return;
  }

  const glassesWidth = glassesSize.x;
  const glassesMaxZ = glassesBox.max.z; // front face of glasses (lens side)

  // ── Step 3: Scale ──────────────────────────────────────────────────
  const targetWidth = headWidth * cfg.widthRatio;
  const scaleFactor = targetWidth / glassesWidth;

  glassesObject.scale.set(scaleFactor, scaleFactor, scaleFactor);

  // After scaling, the glasses' bounding box values scale proportionally
  const scaledGlassesCenter = glassesCenter.clone().multiplyScalar(scaleFactor);
  const scaledGlassesMaxZ = glassesMaxZ * scaleFactor;

  // ── Step 4: Position ───────────────────────────────────────────────

  // X: Center on head
  const posX = headCenter.x - scaledGlassesCenter.x;

  // Y: Eye level = head center + vertical offset
  const posY = (headCenter.y + headHeight * cfg.verticalOffsetRatio) - scaledGlassesCenter.y;

  // Z: Align glasses FRONT FACE with head front face, then recess inward.
  //
  // We want: scaledGlassesMaxZ + offset = headFrontZ - recessDepth
  //   where offset is the position.z we're solving for,
  //   and recessDepth = headDepth * cfg.depthRecessRatio
  //
  // So: offset = (headFrontZ - headDepth * cfg.depthRecessRatio) - scaledGlassesMaxZ
  //
  // But wait — the glasses object's world max Z = glassesObject.position.z + scaledGlassesMaxZ
  // (since we reset position to 0 before measuring, the bounding box values are relative to origin)
  // So: position.z + scaledGlassesMaxZ = headFrontZ - headDepth * cfg.depthRecessRatio
  //     position.z = headFrontZ - headDepth * cfg.depthRecessRatio - scaledGlassesMaxZ
  const posZ = headFrontZ - (headDepth * cfg.depthRecessRatio) - scaledGlassesMaxZ;

  glassesObject.position.set(posX, posY, posZ);
  glassesObject.rotation.set(0, 0, 0);

  console.log('[glassesFitter] Fitting complete:', {
    headSize: { w: headWidth.toFixed(3), h: headHeight.toFixed(3), d: headDepth.toFixed(3) },
    headFrontZ: headFrontZ.toFixed(3),
    glassesIntrinsicWidth: glassesWidth.toFixed(3),
    glassesMaxZ: glassesMaxZ.toFixed(3),
    scaleFactor: scaleFactor.toFixed(4),
    depthRecess: (headDepth * cfg.depthRecessRatio).toFixed(3),
    finalPosition: [posX.toFixed(3), posY.toFixed(3), posZ.toFixed(3)],
  });
}
