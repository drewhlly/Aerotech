import Link from "next/link";
export default function CareersGate() {
 return <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 text-center">
  <h1 className="text-4xl font-black text-[#102A43]">Find your next opportunity on Aerotech</h1>
  <p className="mt-5 text-slate-600">Create a free applicant account or sign in to view available jobs. No applicant fees.</p>
  <Link href="/auth/signup/applicant" className="mt-8 rounded-xl bg-[#102A43] p-4 font-bold text-white">Create free account</Link>
  <Link href="/auth/login?role=applicant" className="mt-4 font-bold text-[#007F73]">Already registered? Sign in</Link>
 </main>;
}
