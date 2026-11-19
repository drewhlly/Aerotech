# Daily meetings acceptance — physical devices not yet tested

Use an isolated staging database and a Daily test account/domain. Invite consenting testers using synthetic Aerotech employee/applicant accounts. Do not record media, screenshots of faces, in-call chat, provider tokens or API keys as evidence. Save only pass/fail, browser versions and non-sensitive meeting IDs.

| Scenario | Steps | Expected result | Physical result |
|---|---|---|---|
| Two-device video | Host on desktop; invited employee on iPhone Safari / Android Chrome. Check devices, confirm names, Join. Host admits the waiting participant. | Guest receives no call token before admission. Both see/hear each other; no Daily participant account. | Not run |
| Audio-only | Schedule audio-only; repeat with one phone. | No camera permission request; camera publishing blocked by token permissions. Microphone and mute work. | Not run |
| Permission denied | Deny microphone/camera; use permission guide and retry. | Clear iPhone/Android instructions; no stuck spinner; join with devices off remains possible. | Not run |
| Call controls | Test mute, camera toggle in video, chat, participant list, raise hand, desktop screen share, timer and Leave. | Accessible Prebuilt controls work; camera stops after leave. Mobile screen share is not promised. | Not run |
| Admission | Guest requests access while host has not joined; host admits/declines. | No participant token until server-recorded admission. Declined guests cannot join. | Not run |
| Wrong account / tenant | Use an uninvited employee, applicant and another employer. Try the room ID, lobby and calendar URLs and POST admission/cancel. | Denied server-side; no room token or participant data. | Not run |
| Mailbox proof | Invite a new applicant email; open calendar link without the personal invitation, then use the emailed invitation and sign in. | Email login alone cannot claim the invitation. Mailbox invitation + matching authenticated account required. | Not run |
| Expired link | Try before opening window and after duration + five-minute buffer. | Clear upcoming/expired state; no new token; provider ejects at room expiry. | Not run |
| Cancellation / reschedule | Cancel during a call; test rescheduling to a different time. | Joining denied immediately. Provider teardown attempted and durable retry queued. Old generation admission/tokens cannot open the replacement room. | Not run |
| Calendar / timezone | Schedule across a timezone offset and month/DST boundary. Open the Resend .ics attachment. | UTC storage; local display; calendar time correct; updated SEQUENCE after reschedule. | Not run |
| Reminder / notifications | Run one due staging reminder; check actual recipient inbox and portal. | One correctly scoped calendar email and in-app notice; no duplicates after worker retry. | Not run |
| Budget exhausted | Configure a deliberately tiny staging reservation budget. | Admission fails closed with allowance message; no provider call made. No claim that this limits other Daily apps/account billing. | Not run |
| Privacy | Inspect network payloads, logs and database rows; check recording/transcription UI. | No API key in browser. Tokens only in no-store join response and SDK memory. No recording/transcription controls or persisted call chat/media. | Not run |
| Responsive / keyboard | 360, 768, 1024, 1440px; Tab, Enter and visible focus, light/dark. | No horizontal overflow; form and lobby operable; AA contrast. | Not run |

Real SDK/media, Resend receipt, host admission between actual devices, screen share and provider quota behaviour require a configured Daily account; mocks do not establish these outcomes.
