import {createHmac,createCipheriv,createDecipheriv,randomBytes,timingSafeEqual} from "node:crypto";
function decodeBase32(value:string){
 const input=value.toUpperCase().replace(/=+$/,"");if(!/^[A-Z2-7]{32,128}$/.test(input))throw Error("Invalid authenticator secret");
 let bits=0,buffer=0;const out:number[]=[];
 for(const c of input){buffer=(buffer<<5)|"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);bits+=5;if(bits>=8){bits-=8;out.push((buffer>>>bits)&255);}}
 return Buffer.from(out);
}
export function totp(secret:string,step:number,digits=6){const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));const hash=createHmac("sha1",decodeBase32(secret)).update(counter).digest();const offset=hash[19]&15;return ((hash.readUInt32BE(offset)&0x7fffffff)%10**digits).toString().padStart(digits,"0");}
export function validTotpStep(secret:string,code:string,lastStep:number,now=Date.now()){
 if(!/^\d{6}$/.test(code))return null;
 const step=Math.floor(now/30000);for(const candidate of [step,step-1,step+1]){if(candidate>lastStep&&timingSafeEqual(Buffer.from(totp(secret,candidate)),Buffer.from(code)))return candidate;}return null;
}
function encryptionKey(){const value=process.env.SUPPORT_MFA_ENCRYPTION_KEY;if(!value||!/^[a-f0-9]{64}$/i.test(value))throw Error("Support authentication is not configured");return Buffer.from(value,"hex");}
export function encryptTotp(secret:string){decodeBase32(secret);const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",encryptionKey(),iv);const data=Buffer.concat([cipher.update(secret.toUpperCase()),cipher.final()]);return [iv,cipher.getAuthTag(),data].map(x=>x.toString("base64url")).join(".");}
export function decryptTotp(value:string){const [iv,tag,data]=value.split(".").map(x=>Buffer.from(x,"base64url"));const cipher=createDecipheriv("aes-256-gcm",encryptionKey(),iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(data),cipher.final()]).toString();}
export const SUPPORT_SCOPES=["workforce","recruitment","meetings","payroll"] as const;
export type SupportScope=typeof SUPPORT_SCOPES[number];
export function validateGrant(scopes:unknown,minutes:unknown){return Array.isArray(scopes)&&scopes.length>0&&scopes.length<=4&&new Set(scopes).size===scopes.length&&scopes.every(s=>SUPPORT_SCOPES.includes(s))&&[15,30,60].includes(Number(minutes));}
