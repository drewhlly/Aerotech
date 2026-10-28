import {schedulerAuthorized} from "@/lib/scheduler-auth";
import {runCollaborationJobs} from "@/lib/collaboration-worker";
import {respond,errorResponse} from "@/lib/collaboration";
export const runtime="nodejs";export const maxDuration=60;
export async function GET(req:Request){if(!await schedulerAuthorized(req))return respond({error:"Unauthorized"},401);try{return respond(await runCollaborationJobs())}catch(e){return errorResponse(e)}}
