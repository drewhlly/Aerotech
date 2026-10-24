// Explicit opt-in test-mode connectivity check. Does not charge or activate accounts.
import {randomUUID} from "node:crypto";
const key=process.env.PAYSTACK_SECRET_KEY;
if(!key?.startsWith("sk_test_"))throw Error("A Paystack test key is required.");
const response=await fetch("https://api.paystack.co/transaction/initialize",{
 method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},
 body:JSON.stringify({email:"aerotech-check@example.com",amount:10000,currency:"NGN",reference:"aerotech-diagnostic-"+randomUUID()}),
 signal:AbortSignal.timeout(20000)
});
const data=await response.json();
console.log("PAYSTACK_TEST_CONNECTIVITY",JSON.stringify({http:response.status,status:data.status,message:data.message}));
if(!response.ok||!data.status)throw Error("Paystack test initialization failed.");
