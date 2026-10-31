import {mock} from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
const database=await PGlite.create(),company='11111111-1111-4111-8111-111111111111';let employer=company;
const query=async(sql,args=[])=>{const r=await database.query(sql,args);return {...r,rowCount:r.rows.length||r.affectedRows||0}};
mock.module(new URL('../src/lib/employer-session.ts',import.meta.url).href,{namedExports:{currentEmployer:async()=>employer,db:()=>({query,connect:async()=>({query,release(){}}),end:async()=>{}})}});
await database.exec('CREATE TABLE imported_candidates(id uuid,employer_id uuid,full_name text,email text,phone text,position_applied text,source_file text,UNIQUE(employer_id,email));');
const api=await import('../src/app/api/recruitment/import/route.ts');const upload=text=>{const body=new FormData();body.set('file',new File([text],'fixture.csv',{type:'text/csv'}));return new Request('https://local.test/api/recruitment/import',{method:'POST',body});};
try{
 assert.equal((await api.POST(new Request('https://local.test/api/recruitment/import',{method:'POST',headers:{'Content-Type':'application/json'},body:'null'}))).status,400);
 const response=await api.POST(upload('Full Name,Email\nFixture Candidate,candidate@example.test\n'));assert.equal(response.status,200);assert.equal((await response.json()).imported,1);
 const row=(await query('SELECT * FROM imported_candidates')).rows[0];assert.equal(row.phone,'');assert.equal(row.position_applied,'');
 assert.deepEqual(await (await api.POST(upload('Full Name,Email\nFixture Candidate,candidate@example.test\n'))).json(),{imported:0,skipped:1});
 employer=null;assert.equal((await api.POST(upload('Full Name,Email\nFixture Candidate,candidate@example.test\n'))).status,401);
 console.log('PASS basic recruitment CSV upload without optional columns, duplicate handling, malformed multipart and auth');
}finally{await database.close()}
