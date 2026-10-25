import {db} from './employer-session';import {decryptPayoutKey} from './payout-security';
export async function payoutAccount(company:string){const p=db();try{const r=await p.query('SELECT encrypted_key,mode FROM payroll_payout_accounts WHERE employer_id=$1',[company]);if(!r.rowCount)throw Error('Connect your company Paystack account in Payroll payments first');return {key:decryptPayoutKey(r.rows[0].encrypted_key,process.env.PAYOUT_ENCRYPTION_KEY||'',company),mode:r.rows[0].mode as 'test'|'live'}}finally{await p.end()}}
export {paystackRequest,paystackBanks} from './paystack-client';
