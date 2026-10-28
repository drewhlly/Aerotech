import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {
 id:'/',name:'Aerotech',short_name:'Aerotech',description:'Your recruitment and everyday work, together in Aerotech.',
 start_url:'/',scope:'/',display:'standalone',background_color:'#ffffff',theme_color:'#07152b',lang:'en-GB',
 icons:[{src:'/app-icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/app-icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}],
 shortcuts:[{name:'Sign in',url:'/auth/login'},{name:'Find jobs',url:'/careers'}]
}}
