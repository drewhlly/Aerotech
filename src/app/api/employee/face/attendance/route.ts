import { submitFaceAttendance, faceFailure } from "@/lib/face-service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    return await submitFaceAttendance(request);
  } catch (e) {
    return faceFailure(e);
  }
}
