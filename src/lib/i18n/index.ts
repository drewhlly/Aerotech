import {enGB} from './en-GB';
export const defaultLocale='en-GB';
export const messages={'en-GB':enGB};
export const t=enGB;
export const formatMoney=(value:number,currency='NGN',locale=defaultLocale)=>new Intl.NumberFormat(locale,{style:'currency',currency}).format(value);
export const formatDate=(value:Date|string,locale=defaultLocale,timeZone='Africa/Lagos')=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone}).format(new Date(value));
