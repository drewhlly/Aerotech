'use client';
import Link from 'next/link';
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="en-GB"><body><main style={{maxWidth:640,margin:'80px auto',padding:24,fontFamily:'sans-serif'}}><h1>We couldn’t load Aerotech</h1><p>Please try again or return home.</p><button onClick={reset}>Try again</button> <Link href="/">Back to home</Link></main></body></html>}
