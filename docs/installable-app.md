# Installable Aerotech web app

Visit `/install` or choose **Get the app** in public navigation.

- Android Chrome: use **Install Aerotech** when available, or browser menu → Install app / Add to Home screen.
- iPhone/iPad Safari: Share → Add to Home Screen → enable Open as Web App when shown → Add.
- Desktop Chrome/Edge: browser install icon/menu when available.

This release is a PWA, not a Google Play or Apple App Store listing. No developer-store account is required for home-screen installation. Native store releases and actual physical-device installation/review remain separate work.

All roles retain existing sign-in and plan/tenant access rules. The existing logo is padded to square PNG icon sizes without changing the source branding. An internet connection is required for sign-in, camera attendance and all private work records. The service worker caches only `/offline.html`; API requests and private HTML are never added to its cache. Online navigation always uses the network; connection failure shows a public offline screen. Push notifications, background clock-in and offline HR editing are not added by this release.

Validation: build, lint, TypeScript and existing smoke tests; `scripts/verify-pwa.mjs` exercises manifest/PNG sizes, service worker headers, install accepted/dismissed UI, app-mode state, 360/768/1024/1280 widths, offline navigation, reconnect and cache privacy on localhost. CI runs it against the production build after disposable signed-in fixtures.

## Manual device checks

- [ ] Install from Android Chrome; launch the icon and sign in to each assigned role.
- [ ] Install from iPhone Safari; confirm app-mode navigation and camera/location permission prompts.
- [ ] Disconnect internet and open a page; confirm connection guidance contains no private information.
- [ ] Reconnect, sign out and sign in as another permitted account; confirm fresh server data.
- [ ] Confirm a deployed update is received after reopening the app.
