import {permanentRedirect} from 'next/navigation';
export default async function Page({params}:{params:Promise<{id:string}>}){permanentRedirect('/careers/'+(await params).id)}
