# E2E tests

Playwright tests for the app. All backend calls are intercepted (see
`fixtures/api-mock.ts`), so these run fully offline against `npm run dev` —
no Django backend needs to be running.

## Run

```sh
npm run test:e2e          # headless, once
npm run test:e2e:ui       # interactive UI mode
npm run test:e2e:report   # open the HTML report from the last run
```

`playwright.config.ts` starts the dev server automatically if one isn't
already running on port 3000.

## Files

- `auth-login.spec.ts` — login form, valid/invalid credentials, already-authenticated redirect, resend-verification.
- `auth-signup.spec.ts` — signup step validation, register + auto-login, registration failure, already-authenticated redirect.
- `auth-protected-route.spec.ts` — anonymous redirect to `/login` (with return-to-original-page after signing in), logout, and session-expiry redirect.
- `fixtures/api-mock.ts` — `mockApi(page, overrides)` intercepts `**/api/v1/**` with sane defaults for the background queries the app shell fires (profile, shop, notifications, dashboard), plus `signInViaLocalStorage(page)` to seed an authenticated session without going through the login form.
