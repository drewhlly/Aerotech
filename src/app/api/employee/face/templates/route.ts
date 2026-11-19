import {
  faceStatus,
  enrollFace,
  deleteOwnFace,
  faceFailure,
} from "@/lib/face-service";
export const runtime = "nodejs";
export async function GET() {
  try {
    return await faceStatus();
  } catch (e) {
    return faceFailure(e);
  }
}
export async function POST(request: Request) {
  try {
    return await enrollFace(request);
  } catch (e) {
    return faceFailure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    return await deleteOwnFace(request);
  } catch (e) {
    return faceFailure(e);
  }
}
