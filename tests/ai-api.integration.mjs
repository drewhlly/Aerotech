import {mock} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const database=await PGlite.create();const query=async(sql,params=[])=>{const r=await database.query(sql,params);return {...r,rowCount:r.rows.length||r.affectedRows||0}};
class Pool{query=query;async end(){}}
let jar={},path='/api/ai/ask';
mock.module('pg',{namedExports:{Pool,types:{setTypeParser(){}}}});
mock.module('next/headers.js',{namedExports:{cookies:async()=>({get:k=>jar[k]?{value:jar[k]}:undefined}),headers:async()=>new Headers({'x-aerotech-service-path':path})}});
process.env.DATABASE_URL='postgres://isolated-test-only';process.env.CLOUDFLARE_AI_TOKEN='test-only';process.env.CLOUDFLARE_AI_ACCOUNT_ID='test-only';
await database.exec(`CREATE TABLE employer_accounts(id UUID PRIMARY KEY,subscription_required BOOLEAN NOT NULL);CREATE TABLE employer_sessions(token_hash TEXT,employer_id UUID,expires_at TIMESTAMPTZ);CREATE TABLE company_subscriptions(employer_id UUID,plan TEXT,status TEXT,paid_until TIMESTAMPTZ);CREATE TABLE workforce_employees(id UUID,employer_id UUID);CREATE TABLE employee_requests(id UUID,employer_id UUID,status TEXT);CREATE TABLE support_login_limits(email_hash TEXT PRIMARY KEY,attempts INT,reset_at TIMESTAMPTZ);`);
const owner=randomUUID(),other=randomUUID(),basic=randomUUID(),hash=s=>createHash('sha256').update(s).digest('hex');
await query('INSERT INTO employer_accounts VALUES($1,FALSE),($2,FALSE),($3,TRUE)',[owner,other,basic]);await query("INSERT INTO company_subscriptions VALUES($1,'basic','active',NOW()+INTERVAL '1 day')",[basic]);for(const [token,id] of [['owner',owner],['basic',basic]])await query("INSERT INTO employer_sessions VALUES($1,$2,NOW()+INTERVAL '1 day')",[hash(token),id]);await query('INSERT INTO workforce_employees VALUES($1,$2),($3,$4),($5,$4)',[randomUUID(),owner,randomUUID(),other,randomUUID()]);await query("INSERT INTO employee_requests VALUES($1,$2,'pending')",[randomUUID(),owner]);
const ai=await import('../src/app/api/ai/ask/route.ts');const req=(question)=>new Request('https://local.test/api/ai/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question})});
jar={aerotech_employer_session:'owner'};
for(const [mockResponse,expected] of [
 [()=>new Response(null,{status:429}),429],
 [()=>new Response(null,{status:503}),502],
 [()=>Response.json({success:false}),502],
 [()=>Response.json({success:true,result:{response:''}}),502],
 [()=>{throw new Error('Test network failure')},502],
]){
 globalThis.fetch=async()=>mockResponse();
 const response=await ai.POST(req('How can I improve onboarding?'));
 assert.equal(response.status,expected);
 const result=await response.json();assert.equal(typeof result.error,'string');
 assert(!JSON.stringify(result).includes('test-only'));
}
await database.close();console.log('PASS: AI provider quota, outage, invalid response, empty response and network failure are handled without exposing credentials.');
