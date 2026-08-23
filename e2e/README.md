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
- `customer-list.spec.ts` — customers table (stats, search, risk filter) driven by the ledger summary, add/edit/delete via the row menu, and the summary-load error state.
- `customer-detail.spec.ts` — customer profile (stats, credit score, details panel), transactions tab, reminders tab (log/SMS/WhatsApp, reminder detail drawer), edit/delete, and the customer-load error state.
- `udharo-list.spec.ts` — udharo entries table (status, search), add (customer combobox, item rows, required/credit-limit validation), edit/delete via the row menu, and the list-load error state.
- `udharo-detail.spec.ts` — entry items/total/details panel, edit/delete, and the entry-load error state.
- `payment-list.spec.ts` — payments table (search, payment-mode filter), record payment (customer combobox, amount validation), edit/delete via the row menu, and the list-load error state.
- `payment-detail.spec.ts` — payment record/details panel, edit/delete, and the payment-load error state.
- `fixtures/api-mock.ts` — `mockApi(page, overrides)` intercepts `**/api/v1/**` with sane defaults for the background queries the app shell fires (profile, shop, notifications, dashboard), plus `signInViaLocalStorage(page)` to seed an authenticated session without going through the login form.
- `tsconfig.json` — a standalone TS project for this folder so the editor resolves the app's ambient global types (`LedgerSummary`, `CustomerDetail`, ...) from `src/types/*.d.ts` without pulling `e2e/` into the app's own `tsc -b` build.
