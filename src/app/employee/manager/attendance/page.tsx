import { forbidden } from 'next/navigation';
import FaceReview from '@/components/face/face-review';
import { faceReviewActor } from '@/lib/face-service';
import { FaceError } from '@/lib/face-policy';
export default async function Page(){
 try { await faceReviewActor(); } catch(error) {
  if(error instanceof FaceError && (error.status===401||error.status===403))forbidden();
  throw error;
 }
 return <FaceReview/>;
}
