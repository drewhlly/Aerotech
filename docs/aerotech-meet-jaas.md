# Aerotech Meet — Managed Jitsi (JaaS) Setup
Aerotech Meet integrates with 8x8 Jitsi as a Service. No dummy meetings: company meetings and invited participants are stored in Aerotech's tenant-scoped database.

## Account ownership
The company account owner signs up at https://developer.8x8.com/jaas/ and completes any required verification/billing. In the JaaS developer console create an RSA API key and **securely download and retain its private key** (the service may not provide it again). Do not send the private key or passwords through chat or commit them to GitHub.

## Server environment
Configure these values securely in the Aerotech hosting environment:
- `JAAS_APP_ID`: the assigned JaaS App ID, starting with `vpaas-magic-cookie-`.
- `JAAS_KEY_ID`: full JaaS key ID (the `kid`), typically `<AppID>/<key-identifier>`.
- `JAAS_PRIVATE_KEY`: matching RSA private key, in PEM format. A single-line environment variable may use escaped `\\n` newlines.
- `DATABASE_URL`: migrated database containing meet_rooms and meet_participants tables.
The application automatically selects managed JaaS when `JAAS_APP_ID` is present; otherwise it uses the previous self-hosted Jitsi configuration. Do not populate `JAAS_APP_ID` without its matching key.

## Activation checks
1. Deploy the latest code and apply migration 018.
2. Create a company meeting and invite one employee.
3. Confirm the invited employee receives a room JWT and joins a real video/audio call through the `8x8.vc` JaaS service.
4. Confirm non-invitees receive 403 from the Aerotech token endpoint.
5. Verify the JaaS room rejects direct access without a signed token, and confirm microphone/camera/screen sharing on desktop and mobile.
6. Verify subscription limits and JaaS usage before opening the service to customers.

Note: This repository does not provision the external JaaS account or run a live deployment. JaaS recordings and AI summarisation remain disabled until separately implemented and consent controls exist.

Docs: https://developer.8x8.com/jaas/docs/api-keys-jwt/ and https://developer.8x8.com/jaas/docs/iframe-api-integration/
