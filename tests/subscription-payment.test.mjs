import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function harness(override={}) {
 const state={paid:false,grants:0,queries:[]};
 const payment={reference:'aerotech-ref',employer_id:'company-a',plan:'basic',amount:'50000000',currency:'NGN'};
 const query=async(sql)=>{state.queries.push(sql);if(sql.startsWith('SELECT'))return {rows:[payment]};if(sql.startsWith('UPDATE')){const first=!state.paid;state.paid=true;return {rowCount:first?1:0};}if(sql.startsWith('INSERT'))state.grants++;return {rows:[]};};
 const client={query,release(){}};const pool={query,connect:async()=>client,end:async()=>{}};
 const module={exports:{}};
 const code=ts.transpileModule(readFileSync('src/lib/subscription-payment.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const fetch=async()=>({ok:true,json:async()=>({status:true,data:{status:'success',reference:payment.reference,amount:Number(payment.amount),currency:'NGN',domain:'live',...override}})});
 new Function('require','module','exports','fetch','process',code)(()=>({db:()=>pool}),module,module.exports,fetch,{env:{PAYSTACK_SECRET_KEY:'sk_live_fixture',VERCEL_ENV:'production'}});
 return {...module.exports,state};
}
test('a verified payment activates once even when callback and webhook both arrive',async()=>{const h=harness();await h.activatePayment('aerotech-ref','company-a');await h.activatePayment('aerotech-ref','company-a');assert.equal(h.state.grants,1);});
for(const override of [{amount:1},{currency:'USD'},{reference:'other'},{status:'pending'},{domain:'test'}])test('reject mismatched payment '+JSON.stringify(override),async()=>{const h=harness(override);await assert.rejects(h.activatePayment('aerotech-ref','company-a'));assert.equal(h.state.grants,0);});
test('another employer cannot claim a reference',async()=>{const h=harness();await assert.rejects(h.activatePayment('aerotech-ref','company-b'));assert.equal(h.state.grants,0);});
function sessionHarness(active){
 const module={exports:{}};const code=ts.transpileModule(readFileSync('src/lib/employer-session.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 class Pool{async query(sql){return sql.includes('employer_sessions')?{rows:[{employer_id:'company-a'}]}:{rowCount:active?1:0};}async end(){}}
 const require=(name)=>name==='pg'?{Pool}:name==='next/headers'?{cookies:async()=>({get:()=>({value:'session'})})}:{createHash:()=>({update:()=>({digest:()=> 'hash'})})};
 new Function('require','module','exports','process',code)(require,module,module.exports,{env:{DATABASE_URL:'fixture'}});return module.exports;
}
test('unpaid employer is blocked from protected APIs but can reach billing',async()=>{const h=sessionHarness(false);assert.equal(await h.currentEmployer(),null);assert.equal(await h.currentEmployer(true),'company-a');});
test('paid employer is admitted by the shared API guard',async()=>{assert.equal(await sessionHarness(true).currentEmployer(),'company-a');});
