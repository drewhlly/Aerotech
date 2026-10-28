import {createPublicKey,timingSafeEqual,verify,type webcrypto} from "node:crypto";
const issuer="https://token.actions.githubusercontent.com",repository="drewhlly/Aerotech";
export const schedulerAudience="https://aerotech-psi.vercel.app/api/cron/collaboration";
let cache:{keys:(webcrypto.JsonWebKey&{kid:string;alg?:string;use?:string})[];until:number}|undefined;
export function validSchedulerClaims(c:Record<string,unknown>,now=Math.floor(Date.now()/1000)){
 return c.iss===issuer&&c.aud===schedulerAudience&&c.repository===repository&&c.repository_id==="1334327157"&&c.repository_owner_id==="31317304"&&c.ref==="refs/heads/main"&&c.workflow_ref===repository+"/.github/workflows/collaboration-scheduler.yml@refs/heads/main"&&["schedule","workflow_dispatch","push"].includes(String(c.event_name))&&typeof c.exp==="number"&&c.exp>now&&c.exp<=now+900&&typeof c.iat==="number"&&c.iat<=now+30&&c.iat>=now-600&&typeof c.nbf==="number"&&c.nbf<=now+30;
}
export async function schedulerAuthorized(req:Request){
 const token=req.headers.get("authorization")?.replace(/^Bearer /,"")||"",secret=process.env.CRON_SECRET||"";
 if(secret&&Buffer.byteLength(secret)===Buffer.byteLength(token)&&timingSafeEqual(Buffer.from(secret),Buffer.from(token)))return true;
 if(token.length>16000)return false;
 try{const parts=token.split(".");if(parts.length!==3)return false;const h=JSON.parse(Buffer.from(parts[0],"base64url").toString()),c=JSON.parse(Buffer.from(parts[1],"base64url").toString());if(h.alg!=="RS256"||typeof h.kid!=="string"||!validSchedulerClaims(c))return false;
 if(!cache||cache.until<Date.now()){const r=await fetch(issuer+"/.well-known/jwks",{cache:"no-store",signal:AbortSignal.timeout(5000)});if(!r.ok)return false;const data=await r.json();if(!Array.isArray(data.keys))return false;cache={keys:data.keys,until:Date.now()+300000}}
 const key=cache.keys.find(k=>k.kid===h.kid&&k.kty==="RSA"&&(!k.alg||k.alg==="RS256")&&(!k.use||k.use==="sig"));return !!key&&verify("RSA-SHA256",Buffer.from(parts[0]+"."+parts[1]),createPublicKey({key,format:"jwk"}),Buffer.from(parts[2],"base64url"));
 }catch{return false}
}
