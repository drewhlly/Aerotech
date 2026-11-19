import {readdirSync,readFileSync} from 'node:fs';
const files=readdirSync('database').filter(x=>/^\d{3}_.*\.sql$/.test(x));
const script=readFileSync('scripts/migrate.mjs','utf8');
const missing=files.filter(x=>!script.includes(JSON.stringify(x)));
if(missing.length){console.error('Unregistered migrations: '+missing.join(', '));process.exitCode=1}
else console.log('All numbered SQL migrations are referenced in the migration runner.');
