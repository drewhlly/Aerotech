import {NextRequest,NextResponse} from 'next/server';
import {hostPortal,pagePortal,portalHomes} from './lib/portal-routing';
import {loginUrl} from './lib/auth-navigation';
function forward(req:NextRequest){const h=new Headers(req.headers);h.set('x-aerotech-service-path',req.nextUrl.pathname);h.set('x-aerotech-return-path',req.nextUrl.pathname+req.nextUrl.search);return NextResponse.next({request:{headers:h}})}
// Optimistic cookie checks only; server layouts and every API still validate sessions.
export function proxy(req:NextRequest){
 const path=req.nextUrl.pathname,url=req.nextUrl.clone(),portal=hostPortal(url.hostname,process.env.PORTAL_ROOT_DOMAIN);
 const destination=pagePortal(path);
 if(path==='/pricing/checkout'&&!req.cookies.has('aerotech_employer_session')&&(req.cookies.has('aerotech_employee_session')||req.cookies.has('aerotech_applicant_session'))){url.pathname='/forbidden';url.search='';return NextResponse.rewrite(url,{status:403})}
 if(portal){if(path==='/'){url.pathname=portalHomes[portal];return NextResponse.redirect(url)}if(destination&&destination!==portal)return new NextResponse('This workspace is not available in this portal.',{status:404});if(path==='/auth/login'&&portal!=='admin'&&url.searchParams.get('role')!==portal){url.searchParams.set('role',portal);return NextResponse.redirect(url)}if(path.startsWith('/auth/signup/')&&path.split('/').pop()!==portal)return new NextResponse('Registration is not available in this portal.',{status:404})}
 if(destination&&destination!=='admin'){
  const roles=['employer','employee','applicant'] as const;
  if(!req.cookies.has('aerotech_'+destination+'_session')){
   if(roles.some(role=>role!==destination&&req.cookies.has('aerotech_'+role+'_session'))){url.pathname='/forbidden';url.search='';return NextResponse.rewrite(url,{status:403})}
   return NextResponse.redirect(new URL(loginUrl(destination,path+url.search),req.url));
  }
 }
 return forward(req)
}
export const config={matcher:['/api/:path*','/','/dashboard/:path*','/employee/:path*','/applicant/:path*','/admin/:path*','/auth/:path*','/pricing/checkout','/careers/:path*']};
