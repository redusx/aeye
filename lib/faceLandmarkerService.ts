import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

class FaceLandmarkerService {
  private static instance: FaceLandmarker | null = null;
  private static initPromise: Promise<FaceLandmarker> | null = null;

  private constructor() {}

  public static async getInstance(): Promise<FaceLandmarker> {
    if (this.instance) {
      return this.instance;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // Use the CDN or public folder for WASM assets
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.instance = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          // Use the CDN path for the model asset
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "CPU" // Use CPU to prevent context overlap crash with R3F
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "IMAGE", // Safe fallback avoiding detectForVideo WASM crashes
        numFaces: 1
      });

      return this.instance;
    })();

    return this.initPromise;
  }
}

export default FaceLandmarkerService;
