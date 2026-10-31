import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{const r=await pool.query("SELECT id,name,latitude,longitude,radius_m,active FROM attendance_sites WHERE employer_id=$1 ORDER BY name",[employer]);return NextResponse.json({sites:r.rows});}catch{return NextResponse.json({error:"Location service unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:Record<string,unknown>;try{b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Request body must be a JSON object.'},{status:400});
}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const lat=Number(b.latitude),lon=Number(b.longitude),radius=Number(b.radiusMeters);
 if(typeof b.name!=="string"||!b.name.trim()||b.name.length>150||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isInteger(radius)||radius<30||radius>5000)return NextResponse.json({error:"Provide site name, latitude, longitude and radius between 30 and 5000 metres"},{status:400});
 const pool=db();try{const id=randomUUID();await pool.query("INSERT INTO attendance_sites(id,employer_id,name,latitude,longitude,radius_m) VALUES($1,$2,$3,$4,$5,$6)",[id,employer,b.name.trim(),lat,lon,radius]);return NextResponse.json({id},{status:201});}catch{return NextResponse.json({error:"Unable to save workplace"},{status:503});}finally{await pool.end();}
}
