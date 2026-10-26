import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/seo';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/auth/','/dashboard/','/employee','/applicant','/admin','/support-console','/billing','/help','/careers/*']},sitemap:new URL('/sitemap.xml',siteUrl).href}}
