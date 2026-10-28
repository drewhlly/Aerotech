import {cookies} from "next/headers";
import {db,SESSION_COOKIE,sessionDigest} from "@/lib/employer-session";
export const SUPPORT_COOKIE="aerotech_support_session";
// Support remains available to authenticated companies even if billing has expired.
export async function supportCompany(){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return null;const pool=db();try{return (await pool.query("SELECT employer_id FROM employer_sessions WHERE token_hash=$1 AND expires_at>NOW()",[sessionDigest(token)])).rows[0]?.employer_id as string||null;}finally{await pool.end();}}
export async function supportAgent(){const token=(await cookies()).get(SUPPORT_COOKIE)?.value;if(!token)return null;const pool=db();try{return (await pool.query("SELECT a.id,a.display_name FROM support_sessions s JOIN support_agents a ON a.id=s.agent_id WHERE s.token_hash=$1 AND s.expires_at>NOW() AND a.disabled=FALSE",[sessionDigest(token)])).rows[0] as {id:string;display_name:string}|undefined||null;}finally{await pool.end();}}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");if(!origin)return false;try{const expected=process.env.APP_BASE_URL?new URL(process.env.APP_BASE_URL).origin:new URL(request.url).origin;return new URL(origin).origin===expected;}catch{return false;}}
