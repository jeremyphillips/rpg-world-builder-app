# Security

Known gaps and planned hardening for the authentication and account management
surfaces. These are tracked here rather than as inline `TODO` comments so they
stay visible during review and sprint planning.

---

## Account settings

### Email change — no verification step

`PATCH /api/users/me` accepts a new email and writes it immediately. A
malicious actor with brief session access can silently change the account email,
locking the real owner out.

**Planned fix:** send a confirmation link to the _new_ address before committing
the change (or require the current password). Until then, the `email` field hint
in the account form reads "Changing your email takes effect immediately" as an
explicit disclosure.

---

### Password change — no session invalidation

`PATCH /api/users/me/password` changes the password hash but does not revoke
other active sessions. If a session token is compromised, changing the password
does not force re-authentication on other devices.

**Planned fix:** add a `tokenVersion` (integer) field to the user document and
increment it on password change. `requireAuth` rejects tokens whose `iat`
predates the current `tokenVersion`. Alternatively, maintain a per-user
server-side session store and delete all entries on password change.

---

### Password change — no rate limiting

`PATCH /api/users/me/password` is not rate-limited. A compromised session could
brute-force the current password check (though bcrypt's cost factor mitigates
this significantly).

**Planned fix:** add an Express rate-limiter (e.g. `express-rate-limit`) scoped
to `POST`/`PATCH` auth endpoints, keyed by user ID for authenticated routes.

---

### Password change — no notification email

The account owner receives no out-of-band signal when their password changes,
making silent account takeover harder to detect.

**Planned fix:** send a transactional email to the account's _current_ address
whenever the password or email changes. Requires wiring up an email provider
(SES, Postmark, Resend, etc.) — tracked separately.

---

## Avatar upload

Account profile save uploads a selected avatar via the shared `uploadFile`
helper (`apps/dashboard/src/lib/api-client.ts`) before patching
`avatarKey` on `PATCH /api/users/me`. Reuse the same helper for any new image
upload fields.

---

## General

- **CSRF** is handled globally by the double-submit cookie pattern (`verifyCsrf`
  middleware). No action needed per-endpoint.
- **Input validation** uses Zod schemas from `@rpg/contracts` via the `validate`
  middleware. All mutation endpoints are covered.
- **Password hashing** uses bcrypt with 12 rounds (`bcryptjs`). Increase rounds
  when hardware allows without noticeably degrading login latency.
