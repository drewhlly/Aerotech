import {siteUrl} from './seo';
// Only established product facts. No invented customers, founding dates or certifications.
export const organisationSchema={'@context':'https://schema.org','@type':'Organization',name:'Aerotech',url:siteUrl,logo:new URL('/brand/aerotech-logo.webp',siteUrl).href,description:'A company and workforce platform connecting recruitment, people operations and employee self-service.'};
