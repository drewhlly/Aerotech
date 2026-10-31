import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const files=readdirSync(new URL('../tests/',import.meta.url)).filter(name=>name.endsWith('.integration.mjs')).sort();
const results=[];
for(const file of files){
 const result=spawnSync(process.execPath,['--experimental-test-module-mocks','--import','./tests/helpers/ts-loader.mjs','tests/'+file],{encoding:'utf8',maxBuffer:4*1024*1024,timeout:120000});
 const ok=result.status===0;
 results.push({file,ok});
 process.stdout.write(`\n${ok?'PASS':'FAIL'} ${file}\n`);
 if(!ok)process.stdout.write((result.stdout||'')+(result.stderr||'')+(result.error?.message||''));
}
console.log('\nIntegration suites:',results.filter(r=>r.ok).length,'passed;',results.filter(r=>!r.ok).length,'failed.');
if(results.some(r=>!r.ok))process.exitCode=1;
