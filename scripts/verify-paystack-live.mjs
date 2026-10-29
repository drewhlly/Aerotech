// Production preflight. Read-only: never initializes a charge or creates a transfer.
const key=process.env.PAYSTACK_SECRET_KEY;
if(!key?.startsWith('sk_live_'))throw Error('A production live Paystack secret key is required');
const response=await fetch('https://api.paystack.co/balance',{headers:{Authorization:'Bearer '+key,Accept:'application/json'},signal:AbortSignal.timeout(20000)});
let body;try{body=await response.json()}catch{throw Error('Payment provider returned a non-JSON response (HTTP '+response.status+')')}
if(!response.ok||body.status!==true)throw Error('Live Paystack authentication failed (HTTP '+response.status+'). Check key validity and account IP restrictions.');
console.log('PASS live Paystack authentication; read-only check; no charge or transfer created.');
