// Pinning and npm lockfile integrity protect the build input. Never download models at runtime.
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),root=dirname(require.resolve('@vladmandic/face-api/package.json'));
const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));if(pkg.version!=='1.7.15')throw Error('Expected audited face-api 1.7.15');
const out=new URL('../public/models/',import.meta.url);await mkdir(out,{recursive:true});const assets=[['dist/face-api.esm.js','face-api.esm.js'],['LICENSE','LICENSE.face-api']];
for(const name of ['tiny_face_detector','face_landmark_68','face_recognition','face_expression'])for(const suffix of ['_model.bin','_model-weights_manifest.json'])assets.push(['model/'+name+suffix,name+suffix]);
const hashes={};for(const [source,target] of assets){await copyFile(join(root,source),new URL(target,out));hashes[target]=createHash('sha256').update(await readFile(new URL(target,out))).digest('hex')}
await writeFile(new URL('asset-integrity.json',out),JSON.stringify({library:'@vladmandic/face-api',version:pkg.version,license:'MIT',hashes},null,2));console.log('Prepared local face models (no remote runtime dependencies).');
