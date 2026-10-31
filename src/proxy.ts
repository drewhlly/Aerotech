import {NextRequest,NextResponse} from 'next/server';
import {hostPortal,pagePortal,portalHomes} from './lib/portal-routing';
import {workspaceLink} from './lib/portal-policy';
import {employeeRequestCanApprove} from './lib/employee-approval-access';
import {requestRole} from './lib/request-role';
import {loginUrl} from './lib/auth-navigation';
import {sameOrigin} from './lib/collaboration-policy';
function forward(req:NextRequest){const h=new Headers(req.headers);h.set('x-aerotech-service-path',req.nextUrl.pathname);h.set('x-aerotech-return-path',req.nextUrl.pathname+req.nextUrl.search);return NextResponse.next({request:{headers:h}})}
export async function proxy(req:NextRequest){
 const path=req.nextUrl.pathname,url=req.nextUrl.clone();
 // Same-origin defence for browser mutations. Provider webhooks and bearer-authenticated crons verify independently.
 if(path.startsWith('/api/')){
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.has('origin')&&!sameOrigin(req.headers.get('origin')!,req.headers.get('host'),url.protocol))return NextResponse.json({error:'Invalid request origin'},{status:403});
  return forward(req);
 }
 if(path==='/forbidden'||path==='/auth/activate')return forward(req);
 let role;try{role=await requestRole(req)}catch{return new NextResponse('Workspace access is temporarily unavailable. Please retry.',{status:503})}
 const host=hostPortal(url.hostname,process.env.PORTAL_ROOT_DOMAIN),destination=pagePortal(path);
 const home=role==='support'?'/support-console':role?portalHomes[role]:null;
 const deny = () =>
    new NextResponse(
      '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workspace access restricted | Aerotech</title><body style="font-family:system-ui;background:#f5f8ff;color:#06163f;padding:40px"><main style="max-width:600px;margin:10vh auto;background:white;padding:32px;border-radius:20px"><h1>Workspace access restricted</h1><p>Your account does not have access to this workspace.</p>' +
        (home
          ? '<a href="' + home + '">Return to your workspace</a>'
          : "<p>Use your authorised workspace address to continue.</p>") +
        "</main></body></html>",
      {
        status: 403,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
        },
      },
    );
 if(host&&destination&&destination!==host)return deny();
 if(path==='/support'||path==='/help')return forward(req);
 if(role&&home){
  if(role==='employee'){
   if(path==='/employee/opportunities'||path.startsWith('/employee/opportunities/'))return deny();
   const approval=path==='/employee/approvals'||path.startsWith('/employee/approvals/')||path==='/employee/payroll/approvals'||path==='/employee/payroll/payments';
   if(approval){
    try{if(!await employeeRequestCanApprove(req.cookies.get('aerotech_employee_session')?.value,path.endsWith('/payments')))return deny();}
    catch{return new NextResponse('Approval access is temporarily unavailable. Please retry.',{status:503});}
   }
  }
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
