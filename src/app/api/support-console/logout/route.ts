import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {db,sessionDigest} from "@/lib/employer-session";
import {SUPPORT_COOKIE,sameOrigin} from "@/lib/support-session";
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:"Request origin not allowed"},{status:403});const jar=await cookies();const token=jar.get(SUPPORT_COOKIE)?.value;if(token){const pool=db();try{await pool.query("DELETE FROM support_sessions WHERE token_hash=$1",[sessionDigest(token)]);}finally{await pool.end();}}jar.delete(SUPPORT_COOKIE);return NextResponse.json({ok:true});}
