// Server-only transactional invitation delivery. Configure RESEND_API_KEY and INVITATION_FROM_EMAIL on hosting.
export async function sendEmployeeInvitation(to:string,firstName:string,activationLink:string,idempotencyKey?:string){
 const apiKey=process.env.RESEND_API_KEY;
 const from=process.env.INVITATION_FROM_EMAIL;
 if(!apiKey||!from)throw new Error("Email delivery is not configured");
 const response=await fetch("https://api.resend.com/emails",{
  method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json",...(idempotencyKey?{"Idempotency-Key":idempotencyKey}:{})},
  body:JSON.stringify({from,to:[to],subject:"Activate your Aerotech employee account",
   text:`Hello ${firstName},\n\nYour employer has invited you to Aerotech. Activate your account and set a password using this link:\n${activationLink}\n\nThis link expires in 48 hours. If you did not expect this invitation, ignore this email.\n\nAerotech Team`}),
  signal:AbortSignal.timeout(12000)
 });
 if(!response.ok)throw new Error("Email provider rejected the invitation");
 return true;
}
