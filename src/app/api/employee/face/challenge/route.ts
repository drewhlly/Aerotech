import { issueFaceChallenge, faceFailure } from "@/lib/face-service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    return await issueFaceChallenge(request);
  } catch (e) {
    return faceFailure(e);
  }
}
