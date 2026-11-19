import {readdirSync,readFileSync} from 'node:fs';
const files=readdirSync('database').filter(x=>/^\d{3}_.*\.sql$/.test(x));
const script=readFileSync('scripts/migrate.mjs','utf8');
// Existing independently managed migrations must not be replayed by the standard migration runner.
const separatelyManaged=new Set(['046_internal_demo_entitlement.sql','047_face_embeddings.sql']);
const unknown=files.filter(x=>!script.includes(JSON.stringify(x))&&!separatelyManaged.has(x));
if(unknown.length){console.error('Unregistered SQL migrations: '+unknown.join(', '));process.exitCode=1}
else console.log('All numbered SQL files are registered or explicitly separately managed.');
console.log('Separately managed migrations require independent verification: '+[...separatelyManaged].join(', '));
