import Link from 'next/link';
import {redirect} from "next/navigation";
import {supportAgent} from "@/lib/support-session";
import SupportWorkspace from "@/components/support-workspace";
export const dynamic="force-dynamic";
export default async function Page(){if(!await supportAgent())redirect("/support-console/login");return <SupportWorkspace staff/>;}
