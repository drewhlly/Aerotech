import {cookies} from 'next/headers';
export async function selectPortal(role:'employer'|'employee'|'applicant'){const jar=await cookies();for(const r of ['employer','employee','applicant'])if(r!==role)jar.delete('aerotech_'+r+'_session');jar.set('aerotech_portal_role',role,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800})}
