import {createRemoteJWKSet,jwtVerify} from 'jose';
const audience='https://backup-control.aerotechhr.app';
const jwks=createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'));
export function allowed(claims){return claims.repository_id==='1334327157'&&claims.repository_owner_id==='31317304'&&claims.repository==='drewhlly/Aerotech'&&claims.ref==='refs/heads/main'&&claims.workflow_ref==='drewhlly/Aerotech/.github/workflows/backups.yml@refs/heads/main'&&claims.sub==='repo:drewhlly@31317304/Aerotech@1334327157:ref:refs/heads/main'&&['push','schedule','workflow_dispatch'].includes(claims.event_name)}
const handler={async fetch(request,env){
 if(new URL(request.url).pathname!=='/credentials'||request.method!=='POST')return new Response('Not found',{status:404});
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return new Response('Unauthorized',{status:401});
 try{
  const {payload}=await jwtVerify(token,jwks,{issuer:'https://token.actions.githubusercontent.com',audience,algorithms:['RS256'],maxTokenAge:'10m',clockTolerance:10,requiredClaims:['exp','iat','jti','repository_id','repository_owner_id','ref','workflow_ref','event_name']});
  if(!allowed(payload)){await env.BACKUPS.put('monitor/authorization-failure.json',JSON.stringify(Object.fromEntries(['repository_id','repository_owner_id','repository','ref','workflow_ref','sub','event_name'].map(k=>[k,payload[k]]))));return new Response('Forbidden',{status:403})}
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload.jti));const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const first=await env.BACKUPS.put('monitor/oidc-used/'+id,'used',{onlyIf:new Headers({'If-None-Match':'*'})});if(!first)return new Response('Already used',{status:403});
  return Response.json({databaseUrl:env.BACKUP_DATABASE_URL,accessKeyId:env.R2_ACCESS_KEY_ID,secretAccessKey:env.R2_SECRET_ACCESS_KEY,encryptionKey:env.BACKUP_KEY},{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Unauthorized',{status:401})}
}};
export default handler;
