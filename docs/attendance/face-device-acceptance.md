# Physical-device acceptance script — not yet executed

Run on an isolated HTTPS deployment with migration 047 applied and the feature enabled. Use consenting test participants and synthetic employee accounts. Do not record, screenshot, save or upload faces, videos or descriptors as evidence. Record only pass/fail, device/browser versions, coarse lighting description and non-biometric request references. Delete test templates afterward.

| Scenario | Steps | Required outcome | Result |
|---|---|---|---|
| iPhone Safari | Open `/employee/face-enroll` in Safari at 390px portrait. Read consent, check the box, tap camera. Capture 3–5 angles, perform prompt. | Inline muted autoplay preview; no full-screen video takeover; enrollment pending supervisor approval. No image/video request payloads. | Not run |
| Android Chrome | Repeat at 360px portrait; approve supervised identity, tap Check In, complete randomized prompt. | Camera opens from user tap, descriptor-only POST, request needs review, manager approval preserves recorded time. | Not run |
| Check-out | Submit Check Out after approved or pending check-in; approve in chronological order. | Correct workday including overnight shift; canonical record only after approval. | Not run |
| Permission denied | Deny camera, retry from site/OS permissions on both devices. | Clear iPhone/Android instructions; manual request works without camera. | Not run |
| Low light / glare | Dim lighting or stand against bright window. | Clear better-light message; no usable sample accepted when quality gates fail. | Not run |
| No face / multiple faces | Point away, then have two people enter frame. | No capture; clear one-face instruction. | Not run |
| Wrong person | Use an approved account but another consenting person's live face. | No match beyond threshold; retry then five-minute lock after three attempts; manual alternative remains. | Not run |
| Static printed photo | Present a printed photo and try the randomized prompt. | Static image cannot satisfy neutral-change-neutral challenge. No automatic accepted attendance in any case. | Not run |
| Photo displayed on screen | Present a still photo on another phone. | Challenge fails; no automatic accepted attendance. | Not run |
| Recorded screen replay | Present a recorded video; try replaying a previous challenge ID/body. | Used/expired/session-mismatched challenge rejected. A suitably manipulated video may satisfy browser heuristics, so any accepted request still needs manager review. This is not certified replay resistance. | Not run |
| Double check-in | Double-tap / send concurrent requests and repeat after approval. | One pending/canonical event only; duplicates return conflict; never duplicate payroll events. | Not run |
| Missed checkout | Leave an open test shift older than 24h, then try check-in/out. | Flagged for HR correction and shown in review queue; never silently closed. | Not run |
| Geofence | Enable test office fence, share location outside it, then decline permission. | Outside/missing location marked for manager review; existing location-only rules unaffected. | Not run |
| Review boundaries | Try another employer's employee/request ID; try self-review as an employee manager. | Denied server-side; direct reports only; no descriptor returned. | Not run |
| Withdraw consent | Delete face data as employee; repeat scoped reset as HR. | Templates and legacy reference removed; no future face match; audit retains non-biometric deletion metadata. | Not run |
| Camera cleanup | Complete, cancel, press Escape, navigate away, background phone / lock screen. | All camera tracks end; OS camera indicator disappears; no audio requested. | Not run |

Before go-live: obtain HR/privacy approval, measure false accepts/rejects across representative devices and users, document retention/backups, confirm the manual alternative is genuinely available, and separately verify the actual Cloudflare runtime if used.
