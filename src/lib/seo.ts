import type {Metadata} from 'next';
export const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://aerotech-psi.vercel.app';
export function pageMetadata(name:string,description:string,path:string,index=true):Metadata{
 const title=name+' | Aerotech';
 return {title,description,alternates:{canonical:new URL(path,siteUrl).href},robots:{index,follow:true},openGraph:{type:'website',locale:'en_GB',siteName:'Aerotech',title,description,url:new URL(path,siteUrl).href,images:[{url:'/brand/aerotech-logo.webp',width:1672,height:941,alt:'Aerotech'}]},twitter:{card:'summary',title,description,images:['/brand/aerotech-logo.webp']}};
}
