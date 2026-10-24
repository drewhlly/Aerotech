# Employer subscription activation

The subscription change must stay off production until the merchant has set PAYSTACK_SECRET_KEY as a Secret for Production in Vercel. Use the merchant's live key; do not paste it in chat, commit it or expose it to client code. Production rejects test keys. APP_BASE_URL is https://aerotech-psi.vercel.app.

Deploy after merging and run `npm run db:migrate && npm run build` for that deployment so migration 020 precedes the new access guard. Existing employer accounts must choose a paid plan; sign-in remains available for checkout. Applicants and employees are not charged. Employer API guards require an unexpired subscription, not merely a session.

Configure the Paystack webhook as https://aerotech-psi.vercel.app/api/subscription/webhook. Verify its HMAC-SHA512 signature against the raw body. Callback and webhook both verify the transaction through Paystack, match reference/amount/currency/domain against the server-created record, then activate idempotently in a database transaction. A repeated callback/webhook does not extend access twice.

This is a one-time annual payment, not an automatic recurring debit. Prices use the existing Basic/Professional/Business annual values and the company's stored country. Nigeria uses NGN; US uses USD only if the merchant supports USD. Other countries and Enterprise require sales pricing. No automatic currency conversion or invented regional price.

Validation: `npm test`; `npm run build`. Before production activation, exercise Paystack test checkout on an isolated preview database, verify signed webhook retries and a declined payment, then confirm a real merchant-authorized live transaction. No real charge has been performed during implementation.

Invitation email remains a separate dependency: RESEND_API_KEY plus a verified INVITATION_FROM_EMAIL are not configured. The payment key does not enable email or video calls.
