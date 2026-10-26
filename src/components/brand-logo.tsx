import Link from 'next/link';
import Image from 'next/image';
export default function BrandLogo({light=false,compact=false,href='/'}:{light?:boolean;compact?:boolean;href?:string}){return <Link href={href} aria-label="Aerotech home" className={'inline-flex shrink-0 items-center overflow-hidden '+(light?'':'')}><Image src="/brand/aerotech-logo.webp" alt="Aerotech" width={204} height={56} priority style={{width:compact?112:204,height:compact?36:56,objectFit:'cover',objectPosition:'center',mixBlendMode:light?'screen':'multiply'}}/></Link>}
