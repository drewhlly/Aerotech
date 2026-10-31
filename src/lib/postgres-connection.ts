/** Preserve pg's current certificate verification when its SSL aliases change. */
export function strictDatabaseConnectionString(value:string):string {
 try {
  const url=new URL(value);
  if(!['postgres:','postgresql:'].includes(url.protocol)||url.searchParams.get('uselibpqcompat')==='true')return value;
  const mode=url.searchParams.get('sslmode');
  if(!mode||!['prefer','require','verify-ca'].includes(mode))return value;
  url.searchParams.set('sslmode','verify-full');
  return url.toString();
 }catch{return value;}
}
