import { reviewFaceStatus, reviewFace, faceFailure } from "@/lib/face-service";
export const runtime = "nodejs";
export async function GET() {
  try {
    return await reviewFaceStatus();
  } catch (e) {
    return faceFailure(e);
  }
}
export async function POST(request: Request) {
  try {
    return await reviewFace(request);
  } catch (e) {
    return faceFailure(e);
  }
}
