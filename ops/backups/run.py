import os,json,urllib.request,urllib.parse,subprocess,tempfile,pathlib,hashlib,secrets,datetime,tarfile,sys
import boto3
from botocore.config import Config
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
BUCKET='aerotech-private-backups'
def digest(data):return hashlib.sha256(data).hexdigest()
def request_json(url,headers,body=None):
 req=urllib.request.Request(url,headers=headers,data=body,method='POST' if body is not None else 'GET')
 with urllib.request.urlopen(req,timeout=60) as response:return json.load(response)
def credentials():
 url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']+'&audience='+urllib.parse.quote('https://backup-control.aerotechhr.app',safe='')
 token=request_json(url,{'Authorization':'Bearer '+os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})['value'];print('::add-mask::'+token,flush=True)
 value=request_json(os.environ['BACKUP_BROKER_URL'],{'Authorization':'Bearer '+token,'Content-Type':'application/json'},b'{}')
 for v in value.values():print('::add-mask::'+v,flush=True)
 return value
def archive_counts(sql):
 result={};table=None
 for line in sql.splitlines():
  if line.startswith('COPY '):table=line.split(' ')[1];result[table]=0
  elif table and line=='\\.':table=None
  elif table:result[table]+=1
 return result
def main():
 c=credentials();u=urllib.parse.urlsplit(c['databaseUrl']);assert u.username=='aerotech_backup_reader';container=os.environ['PG_CONTAINER'];env=os.environ.copy();env.update(PGHOST=u.hostname,PGPORT=u.port or '5432',PGDATABASE=u.path.lstrip('/'),PGUSER=urllib.parse.unquote(u.username),PGPASSWORD=urllib.parse.unquote(u.password),PGSSLMODE='require',PGCONNECT_TIMEOUT='30')
 s3=boto3.client('s3',endpoint_url='https://3144bf081a43f5ca5bc88b60e956a9ce.r2.cloudflarestorage.com',aws_access_key_id=c['accessKeyId'],aws_secret_access_key=c['secretAccessKey'],region_name='auto',config=Config(connect_timeout=15,read_timeout=120,retries={'max_attempts':3}))
 def store(key,data,content_type='application/octet-stream'):
  checksum=digest(data);s3.put_object(Bucket=BUCKET,Key=key,Body=data,ContentType=content_type,Metadata={'sha256':checksum});back=s3.get_object(Bucket=BUCKET,Key=key)['Body'].read();assert digest(back)==checksum,'R2 readback mismatch';return {'key':key,'bytes':len(data),'sha256':checksum}
 prefix='daily/'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H-%M-%SZ')+'-'+secrets.token_hex(3)+'/'
 try:
  args=['docker','exec']
  for name in ['PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSSLMODE','PGCONNECT_TIMEOUT']:args+=['--env',name]
  result=subprocess.run(args+[container,'pg_dump','--format=custom','--no-owner','--no-acl'],env=env,capture_output=True,timeout=600)
  if result.returncode:raise RuntimeError('Read-only database export failed')
  plain=result.stdout
  def pgtool(tool,args,input=None):
   r=subprocess.run(['docker','exec','-i',container,tool,*args],input=input,capture_output=True,timeout=600)
   if r.returncode:raise RuntimeError(tool+' failed during isolated verification')
   return r.stdout
  pgtool('pg_restore',['--list'],plain)
  pgtool('pg_restore',['--exit-on-error','--no-owner','--no-acl','--username=restore_verify','--dbname=restore_verify'],plain)
  expected=archive_counts(pgtool('pg_restore',['--data-only','--file=-'],plain).decode())
  unions=' UNION ALL '.join("SELECT '"+t+"' AS name,COUNT(*)::bigint AS n FROM "+t for t in expected)
  counts=json.loads(pgtool('psql',['--username=restore_verify','--dbname=restore_verify','-At','-c','SELECT json_object_agg(name,n) FROM ('+unions+') counts']))
  assert counts==expected,'Restored row counts do not match archive'
  print('PASS full isolated restore: '+str(len(expected))+' table data sets and '+str(sum(expected.values()))+' rows',flush=True)
  magic=b'AEROTECH-BACKUP-V1\n';nonce=secrets.token_bytes(12);key=bytes.fromhex(c['encryptionKey']);encrypted=magic+nonce+AESGCM(key).encrypt(nonce,plain,magic);assert AESGCM(key).decrypt(nonce,encrypted[len(magic)+12:],magic)==plain
  db=store(prefix+'database.dump.aes256gcm',encrypted)
  commit=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();files=subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD'],text=True).splitlines();files=[p for p in files if not any(part in ['node_modules','.next','.git'] or part.startswith('.env') for part in pathlib.PurePosixPath(p).parts)]
  source=subprocess.check_output(['git','archive','--format=tar.gz','HEAD','--',*files]);src=store(prefix+'source.tar.gz',source,'application/gzip')
  manifest={'version':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'prefix':prefix,'source':{'commit':commit,'files':len(files),**src},'database':{'format':'PostgreSQL custom archive','sha256':digest(plain),'bytes':len(plain),'encryptedSha256':db['sha256'],'encryptedBytes':db['bytes'],'recoveryKeyLocation':'Vercel Production AEROTECH_BACKUP_KEY_20261030'},'restoreTest':{'passed':True,'tableDataSets':len(expected),'rows':sum(expected.values()),'target':'disposable PostgreSQL 18 container; production read only'},'runtimeSecretsIncluded':False,'githubRun':os.environ.get('GITHUB_SERVER_URL','https://github.com')+'/'+os.environ.get('GITHUB_REPOSITORY','drewhlly/Aerotech')+'/actions/runs/'+os.environ.get('GITHUB_RUN_ID','')}
  for file in ['RESTORE.md','restore.py']:
   data=s3.get_object(Bucket=BUCKET,Key='2026-10-30/'+file)['Body'].read();store(prefix+file,data)
  store(prefix+'manifest.json',json.dumps(manifest,indent=2).encode(),'application/json');store('monitor/last-success.json',json.dumps({'status':'success','at':manifest['createdAt'],'prefix':prefix,'commit':commit,'restoreVerified':True,'githubRun':manifest['githubRun']}).encode(),'application/json')
  print('PASS encrypted database and source uploaded; SHA-256 download checks passed',flush=True)
  summary=os.environ.get('GITHUB_STEP_SUMMARY')
  if summary:pathlib.Path(summary).write_text('Encrypted Cloudflare backup completed.\n\nFull restore verified in an isolated PostgreSQL 18 container: '+str(len(expected))+' table data sets / '+str(sum(expected.values()))+' rows.\n\nPrivate R2 prefix: `'+prefix+'`\n\nProduction was read only. Runtime secrets are excluded.\n')
 except Exception:
  s3.put_object(Bucket=BUCKET,Key='monitor/last-failure.json',Body=json.dumps({'status':'failed','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'run':os.environ.get('GITHUB_RUN_ID'),'prefix':prefix}).encode(),ContentType='application/json');raise
if __name__=='__main__':main()
