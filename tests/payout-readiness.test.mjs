import test from 'node:test';
import assert from 'node:assert/strict';
import {payoutReadiness} from '../src/lib/payout-readiness.ts';
const ready={connected:true,mode:'live',encryptionReady:true,assignedStages:['hr','finance','ceo'],employees:3,unverifiedRecipients:0};
test('payout readiness fails closed for missing company connection, approval stages and bank verification',()=>{
 for(const patch of [{connected:false},{encryptionReady:false},{assignedStages:['finance']},{employees:0},{unverifiedRecipients:1}])assert.equal(payoutReadiness({...ready,...patch}).setupComplete,false);
 assert.deepEqual(payoutReadiness({...ready,assignedStages:['finance']}).missingStages,['hr','ceo']);
 assert.equal(payoutReadiness(ready).readyForLiveReview,true);
 assert.equal(payoutReadiness({...ready,mode:'test'}).readyForLiveReview,false);
 assert.equal(payoutReadiness({...ready,mode:'test'}).readyForTest,true);
 assert.equal(payoutReadiness({...ready,mode:'unknown'}).readyForLiveReview,false);
});
