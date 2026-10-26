'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="mx-auto max-w-xl px-6 py-20"><p>500</p><h1 className="mt-3 text-3xl font-bold">We couldn’t load this page</h1><p className="my-5">Please try again or return home. Your saved records are unchanged.</p><button className="aero-button bg-blue-700 text-white" onClick={reset}>Try again</button> <Link className="aero-button text-blue-700" href="/">Back to home</Link></main>}
