import {workspaceLink} from './portal-policy';
import {portalHomes,type Portal} from './portal-routing';
export function safeReturnTo(value:string|null|undefined,role:Exclude<Portal,'admin'>){
 if(!value||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return portalHomes[role];
 try{const url=new URL(value,'https://aerotech.invalid');if(url.origin!=='https://aerotech.invalid')return portalHomes[role];const p=url.pathname;
 if(p==='/help'||p==='/meet'||p.startsWith('/meet/')||(p==='/aerochat'&&role!=='applicant')||p==='/billing'||p==='/support/tickets'||p==='/pricing/checkout'||p.startsWith('/careers/'))return workspaceLink(role,p==='/pricing/checkout'?'/billing'+url.search:url.pathname+url.search);
 const allowed=role==='employer'?(p==='/dashboard/employer'||p.startsWith('/dashboard/employer/')||p==='/billing'||p==='/support/tickets'||p==='/pricing/checkout'):role==='employee'?(p==='/employee'||p.startsWith('/employee/')):(p==='/applicant'||p.startsWith('/applicant/')||p.startsWith('/careers/'));
 return allowed?url.pathname+url.search:portalHomes[role];}catch{return portalHomes[role]}
}
export function loginUrl(role:Exclude<Portal,'admin'>,next?:string){return '/auth/login?'+new URLSearchParams({role,next:safeReturnTo(next,role)}).toString()}
