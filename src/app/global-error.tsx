'use client';
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="en-GB"><body><main style={{maxWidth:640,margin:'80px auto',padding:24,fontFamily:'sans-serif'}}><h1>We couldn’t load Aerotech</h1><p>Please try again or return to your workspace.</p><button onClick={reset}>Try again</button></main></body></html>}
