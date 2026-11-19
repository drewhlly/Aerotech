import {NextResponse} from 'next/server';
import {currentEmployee} from '@/lib/employee-auth';
export const runtime='nodejs';
export async function POST(){if(!await currentEmployee())return NextResponse.json({error:'Employee sign-in required'},{status:401});return NextResponse.json({error:'Photo enrollment is retired. Use /employee/face-enroll for descriptor-only enrollment.'},{status:410})}
