import JoinMeeting from "@/components/meeting-room";
export default function Page({params}:{params:Promise<{id:string}>}){return <JoinMeeting params={params}/>;}
