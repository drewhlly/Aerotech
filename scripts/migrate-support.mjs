// Existing deployments already have core migrations. Apply only the support schema atomically.
import pg from 'pg';
import {readFileSync} from 'node:fs';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();
try{await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(721021)");await client.query(readFileSync(new URL('../database/021_support_console.sql',import.meta.url),'utf8'));await client.query('COMMIT');console.log('Applied 021_support_console.sql');}
catch(e){await client.query('ROLLBACK');throw e;}finally{await client.end();}
