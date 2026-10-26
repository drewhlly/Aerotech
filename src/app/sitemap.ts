import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/seo';
export default function sitemap():MetadataRoute.Sitemap{return ['/', '/careers','/pricing','/solutions','/support','/install'].map(path=>({url:new URL(path,siteUrl).href,changeFrequency:path==='/careers'?'daily':'monthly'}))}
