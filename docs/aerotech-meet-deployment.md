# Aerotech Meet — deployment configuration

Aerotech Meet stores schedules and company-scoped employee invitations in PostgreSQL and embeds a **privately hosted Jitsi Meet** service. No demo meetings or public anonymous rooms are used.

## Application environment (server-side secrets)
- `DATABASE_URL`: migrated PostgreSQL database (run `npm run db:migrate`).
- `JITSI_DOMAIN`: verified HTTPS meeting hostname, without scheme (example: `meet.your-domain.example`).
- `JITSI_APP_ID`: application identifier matched to the Jitsi server's JWT app ID.
- `JITSI_APP_SECRET`: cryptographically random shared JWT key, minimum 32 characters. Keep it on the server only.
- `JITSI_JWT_SUB`: Jitsi XMPP domain (usually `meet.jitsi` for Docker). Must match the server's JWT domain verification settings.

Never commit real credentials to Git. The Jitsi server, DNS name, TLS certificate, ports, and environment secrets must be provisioned by the hosting owner.

## Jitsi Docker service
Use the official docker-jitsi-meet project. Match the authentication configuration below in its private `.env`:
```
ENABLE_AUTH=1
AUTH_TYPE=jwt
ENABLE_GUESTS=0
JWT_ALLOW_EMPTY=0
JWT_APP_ID=<same as JITSI_APP_ID>
JWT_APP_SECRET=<same as JITSI_APP_SECRET>
JWT_ACCEPTED_ISSUERS=<same as JITSI_APP_ID>
JWT_ACCEPTED_AUDIENCES=<same as JITSI_APP_ID>
```
For embedded Jitsi, configure `frame-ancestors` on the video service to allow **only** the real Aerotech application origin. Enable HTTPS and TURN as appropriate for users behind restrictive networks.

## Acceptance test (must pass before marking live)
1. Apply migration 018 and create a genuine company with two active employees.
2. Schedule a meeting, inviting employee A but not employee B.
3. Confirm A can obtain a valid JWT and open a two-person audio/video meeting with employer host.
4. Confirm B receives HTTP 403 when requesting the room token, and no-token access is refused by Jitsi itself.
5. Confirm an employee of another company receives HTTP 403.
6. Test browser permissions, screen sharing, mobile, meeting end/disconnection, token expiry, and TURN connectivity.
7. Check that recordings and AI meeting summaries are **not** offered until separately implemented and consent controls exist.

The software currently supports scheduling, scoped invitations, and a JWT-powered video embed. The meeting server and live connection have **not** been independently verified.
Reference: https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker/
