import {routeMetadata} from '@/lib/route-metadata';
export const metadata=routeMetadata('/support/tickets');
import {redirect} from "next/navigation";
import {supportCompany} from "@/lib/support-session";
import SupportWorkspace from "@/components/support-workspace";
export const dynamic="force-dynamic";
export default async function Page(){if(!await supportCompany())redirect("/auth/login?role=employer&next=%2Fsupport%2Ftickets");return <SupportWorkspace/>;}
