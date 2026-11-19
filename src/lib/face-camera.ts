// Browser-only module. The pinned browser ESM bundle and weights are served locally.
export type Point = { x: number; y: number };
export type DetectedFace = {
  descriptor: Float32Array;
  detection: { score: number; box: { width: number; height: number } };
  landmarks: { positions: Point[] };
  expressions: { happy: number };
};
export type FaceApi = {
  nets: Record<
    | "tinyFaceDetector"
    | "faceLandmark68Net"
    | "faceRecognitionNet"
    | "faceExpressionNet",
    { loadFromUri: (url: string) => Promise<void> }
  >;
  TinyFaceDetectorOptions: new (options: {
    inputSize: number;
    scoreThreshold: number;
  }) => unknown;
  detectAllFaces: (
    video: HTMLVideoElement,
    options: unknown,
  ) => {
    withFaceLandmarks: () => {
      withFaceDescriptors: () => {
        withFaceExpressions: () => Promise<DetectedFace[]>;
      };
    };
  };
};
let loading: Promise<FaceApi> | null = null;
export function loadFaceModels() {
  if (!loading)
    loading = (async () => {
      // Keep the on-device asset URL dynamic so Worker bundlers do not treat it as a server import.
      const url = new URL("/models/face-api.esm.js", window.location.origin)
        .href;
      const api = (await import(/* webpackIgnore: true */ url)) as FaceApi;
      await Promise.all(
        [
          api.nets.tinyFaceDetector,
          api.nets.faceLandmark68Net,
          api.nets.faceRecognitionNet,
          api.nets.faceExpressionNet,
        ].map((net) => net.loadFromUri("/models")),
      );
      return api;
    })().catch((e) => {
      loading = null;
      throw e;
    });
  return loading;
}
const length = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export function faceMotion(face: DetectedFace) {
  const p = face.landmarks.positions;
  const eye = (i: number) =>
    (length(p[i + 1], p[i + 5]) + length(p[i + 2], p[i + 4])) /
    (2 * length(p[i], p[i + 3]));
  const l = { x: (p[36].x + p[39].x) / 2, y: (p[36].y + p[39].y) / 2 },
    r = { x: (p[42].x + p[45].x) / 2, y: (p[42].y + p[45].y) / 2 };
  return {
    eye: (eye(36) + eye(42)) / 2,
    yaw: (p[30].x - (l.x + r.x) / 2) / Math.max(1, length(l, r)),
    smile: face.expressions.happy,
  };
}
export function faceQuality(face: DetectedFace, video: HTMLVideoElement) {
  if (face.detection.score < 0.8)
    return "Face is not clear. Move to better light.";
  if (Math.min(face.detection.box.width, face.detection.box.height) < 100)
    return "Move closer and keep your whole face in the guide.";
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 36;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "Camera quality check unavailable.";
  context.drawImage(video, 0, 0, 48, 36);
  const pixels = context.getImageData(0, 0, 48, 36).data;
  let light = 0,
    contrast = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const v = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    light += v;
    contrast += v * v;
  }
  const n = pixels.length / 4;
  light /= n;
  if (light < 45) return "Move to better light. Face a window or lamp.";
  if (light > 225) return "Avoid strong backlight or direct glare.";
  if (Math.sqrt(Math.max(0, contrast / n - light * light)) < 14)
    return "The image is too flat or blurred. Clean the lens and hold still.";
  return null;
}
