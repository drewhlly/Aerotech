import {payoutStages} from './payout-security.ts';
export function payoutReadiness(input:{connected:boolean;mode:string|null;encryptionReady:boolean;assignedStages:string[];employees:number;unverifiedRecipients:number}){
 const missingStages=payoutStages.filter(stage=>!input.assignedStages.includes(stage));
 const setupComplete=input.connected&&input.encryptionReady&&missingStages.length===0&&input.employees>0&&input.unverifiedRecipients===0;
 return {missingStages,employees:input.employees,unverifiedRecipients:input.unverifiedRecipients,setupComplete,readyForTest:setupComplete&&input.mode==='test',readyForLiveReview:setupComplete&&input.mode==='live',notice:'Setup checks do not authorize a transfer or prove provider activation. Every payroll still requires Head of HR, Finance and CEO approval, verified recipients, sufficient company funds and provider confirmation. Statutory remittances are separate from net salary transfers.'};
}
