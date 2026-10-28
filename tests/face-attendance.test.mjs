import test from 'node:test';import assert from 'node:assert/strict';
import {decodeFace,faceConfigured,compareEmployeeFace} from '../src/lib/face-attendance.ts';
test('camera verification rejects missing, non-JPEG and oversized input',()=>{
 for(const value of [undefined,null,true,'data:image/png;base64,AAAA','data:image/jpeg;base64,AAAA','data:image/jpeg;base64,'+'A'.repeat(500001)])assert.throws(()=>decodeFace(value));
});
test('face comparison fails closed when provider is not configured',async()=>{
 const keys=['AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY'];const saved=keys.map(k=>process.env[k]);try{keys.forEach(k=>delete process.env[k]);assert.equal(faceConfigured(),false);await assert.rejects(compareEmployeeFace(Buffer.alloc(0),Buffer.alloc(0)),/not been connected/)}finally{keys.forEach((k,i)=>{if(saved[i]===undefined)delete process.env[k];else process.env[k]=saved[i]})}
});
