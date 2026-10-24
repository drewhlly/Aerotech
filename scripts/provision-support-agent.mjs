// Run only by an authorised deployment operator. Never accepts credentials in argv.
import pg from "pg";
import {readFileSync,statSync} from "node:fs";
import {randomUUID,randomBytes,scrypt as rawScrypt} from "node:crypto";
import {promisify} from "node:util";
import {encryptTotp} from "../src/lib/support-security.ts";
const file=process.argv[2];if(!file)throw Error("Provide a private JSON file path containing email, displayName, password and totpSecret. No credentials in command arguments.");
if((statSync(file).mode&0o077)!==0)throw Error("Credential file must be readable only by its owner (chmod 600).");
const b=JSON.parse(readFileSync(file,"utf8"));
if(typeof b.email!=="string"||!/^\S+@\S+\.\S+$/.test(b.email)||typeof b.displayName!=="string"||!b.displayName.trim()||b.displayName.length>100||typeof b.password!=="string"||b.password.length<16||b.password.length>255||typeof b.totpSecret!=="string")throw Error("Invalid provisioning details. Use a unique staff password with at least 16 characters and a unique authenticator secret.");
const encrypted=encryptTotp(b.totpSecret);const salt=randomBytes(16).toString("hex");const hash=(await promisify(rawScrypt)(b.password,salt,64)).toString("hex");
if(!process.env.DATABASE_URL)throw Error("DATABASE_URL is required");
const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();try{
 await client.query("INSERT INTO support_agents(id,email,display_name,password_hash,totp_encrypted) VALUES($1,$2,$3,$4,$5)",[randomUUID(),b.email.trim().toLowerCase(),b.displayName.trim(),`scrypt:${salt}:${hash}`,encrypted]);
 console.log("Support staff account provisioned. Sign in at /support-console/login using the private credentials and your authenticator. No customer access is granted by provisioning.");
}finally{await client.end();}
