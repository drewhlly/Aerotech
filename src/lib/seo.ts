import type {Metadata} from 'next';

// Use the public canonical domain regardless of the Vercel preview URL.
// An explicit production override is supported for controlled migrations.
export const siteUrl = (process.env.NEXT_PUBLIC_CANONICAL_URL || 'https://aerotechhr.app').replace(/\/$/, '');

export function pageMetadata(name:string,description:string,path:string,index=true):Metadata{
 const isHome=path==='/';
 const title=isHome?'Aerotech HR | Recruitment, Payroll & HR Management Software':name+' | Aerotech HR';
 const canonical=new URL(path,siteUrl).href;
 return {
  referrer:path.startsWith('/auth/')?'no-referrer':'strict-origin-when-cross-origin',
  title,description,
  alternates:{canonical},
  robots:{index,follow:index,googleBot:{index,follow:index}},
  openGraph:{type:'website',locale:'en_GB',siteName:'Aerotech HR',title,description,url:canonical,images:[{url:new URL('/brand/aerotech-logo.webp',siteUrl).href,width:1672,height:941,alt:'Aerotech HR platform logo'}]},
  twitter:{card:'summary_large_image',title,description,images:[new URL('/brand/aerotech-logo.webp',siteUrl).href]}
 };
}
