import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),refs=new Map(),dynamic=[];
const allowed=new Set(['.js','.mjs','.cjs','.ts','.tsx']);
function scan(dir){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(['node_modules','.next','.git','dist','build'].includes(entry.name))continue;
  const full=path.join(dir,entry.name),relative=path.relative(root,full).replaceAll(path.sep,'/');
  if(entry.isDirectory()){scan(full);continue}
  if(!entry.isFile()||!allowed.has(path.extname(full)))continue;
  const source=readFileSync(full,'utf8');
  for(const match of source.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Za-z_]\w*)/g)){
   const key=match[1],phase=key.startsWith('NEXT_PUBLIC_')||key.startsWith('VITE_')?'public/build':relative==='next.config.ts'?'build/config':'server/runtime';
   if(!refs.has(key))refs.set(key,{phase:new Set(),files:new Set()});
   refs.get(key).phase.add(phase);refs.get(key).files.add(relative);
  }
  if(/(?:process\.env|import\.meta\.env)\s*\[/.test(source))dynamic.push(relative);
 }
}
for(const dir of ['src','scripts','tests'])scan(path.join(root,dir));
for(const filename of ['next.config.ts','postcss.config.mjs','eslint.config.mjs']){const file=path.join(root,filename);if(!readdirSync(root).includes(filename))continue;const source=readFileSync(file,'utf8');for(const m of source.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Za-z_]\w*)/g)){const key=m[1];if(!refs.has(key))refs.set(key,{phase:new Set(),files:new Set()});refs.get(key).phase.add('build/config');refs.get(key).files.add(filename)}}
const example=readFileSync(path.join(root,'.env.example'),'utf8');
const names=new Set([...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(m=>m[1]));
console.log('ENVIRONMENT REFERENCE INVENTORY (names only; never secret values)');
console.log('Variable | Phase | Referencing files | Template');
for(const [key,ref] of [...refs].sort(([a],[b])=>a.localeCompare(b)))console.log(key+' | '+[...ref.phase].sort().join(',')+' | '+[...ref.files].sort().join(', ')+' | '+(names.has(key)?'yes':'MISSING'));
console.log('Dynamic bracket-access locations requiring manual review: '+(dynamic.join(', ')||'none'));
console.log('Total unique direct references: '+refs.size);
