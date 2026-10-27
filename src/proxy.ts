import {NextRequest,NextResponse} from 'next/server';
import {hostPortal,pagePortal,portalHomes} from './lib/portal-routing';
import {workspaceLink} from './lib/portal-policy';
import {requestRole} from './lib/request-role';
import {loginUrl} from './lib/auth-navigation';
function forward(req:NextRequest){const h=new Headers(req.headers);h.set('x-aerotech-service-path',req.nextUrl.pathname);h.set('x-aerotech-return-path',req.nextUrl.pathname+req.nextUrl.search);return NextResponse.next({request:{headers:h}})}
export async function proxy(req:NextRequest){
 const path=req.nextUrl.pathname,url=req.nextUrl.clone();
 // Same-origin defence for browser mutations. Provider webhooks and bearer-authenticated crons verify independently.
 if(path.startsWith('/api/')){
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.has('origin')&&req.headers.get('origin')!==url.origin)return NextResponse.json({error:'Invalid request origin'},{status:403});
  return forward(req);
 }
 if(path==='/forbidden')return forward(req);
 let role;try{role=await requestRole(req)}catch{return new NextResponse('Workspace access is temporarily unavailable. Please retry.',{status:503})}
 const host=hostPortal(url.hostname,process.env.PORTAL_ROOT_DOMAIN),destination=pagePortal(path);
 const home=role==='support'?'/support-console':role?portalHomes[role]:null;
 const deny=()=>{url.pathname='/forbidden';url.search='';return NextResponse.rewrite(url,{status:403})};
 if(host&&destination&&destination!==host)return deny();
 if(path==='/support'||path==='/help')return forward(req);
 if(role&&home){
  if(path==='/billing'||path==='/pricing/checkout'||path==='/support/tickets'||path==='/meet'||path.startsWith('/meet/')||path==='/aerochat'){
   const target=role==='support'?home:path==='/support/tickets'&&role==='employer'?'/dashboard/employer/support-access':workspaceLink(role,path==='/pricing/checkout'?'/billing':path);
   url.pathname=target;return NextResponse.redirect(url);
  }
  if(destination&&destination!==role)return deny();
  if(path.startsWith('/support-console')&&role==='admin'){url.pathname='/admin';url.search='';return NextResponse.redirect(url)}
  if(path.startsWith('/support-console')&&role!=='support')return deny();
  const publicPage=path==='/'||['/pricing','/solutions','/careers','/about','/contact','/install','/privacy','/terms'].includes(path)||path.startsWith('/auth/')||path.startsWith('/careers/')||path==='/cookies';
  if(publicPage){url.pathname=home;url.search='';return NextResponse.redirect(url)}
 }else{
  if(destination==='admin'){url.pathname='/support-console/login';url.search='?next='+encodeURIComponent(path+url.search);return NextResponse.redirect(url)}
  if(destination)return NextResponse.redirect(new URL(loginUrl(destination,path+url.search),req.url));
  if(path==='/meet'||path.startsWith('/meet/')||path==='/aerochat')return NextResponse.redirect(new URL(loginUrl('employee',path+url.search),req.url));
 }
 return forward(req);
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html|manifest.webmanifest|app-icons/|brand/|sitemap.xml|robots.txt).*)']};
