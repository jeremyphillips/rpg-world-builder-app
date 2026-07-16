# D&D Beyond character import — technical background

Experimental import support for D&D Beyond **character v5** payloads. This module
holds the external schema, fixtures, and adapter-facing types. Product UI and API
acquisition live outside this directory.

## Acquisition roadmap

All acquisition paths converge on the same versioned payload schema and pure
adapter. The adapter never performs HTTP and never handles credentials.

```text
Public character ID
        ↓
server-side public-id fetch (phase 1)

Private character
        ↓
browser bookmarklet or extension (future)
        ↓
authenticated request using existing browser session
        ↓
JSON payload or downloaded JSON file

Preferred private fallback before a custom extension:
        ↓
JSON file upload (phase 2 follow-up)

Both paths
        ↓
validate → adaptDndBeyondCharacter → preview + coverage report
```

Source metadata records how the payload was obtained:

```ts
type CharacterImportAcquisition = 'public-id-fetch' | 'json-upload' | 'browser-helper'
```

Phase 1 implements **`public-id-fetch`** only.

## Private-character authentication and browser export

D&D Beyond **private** characters may require an authenticated `CobaltSession`
cookie. Unofficial integrations use this credential to retrieve characters and
account-owned content that are unavailable through anonymous requests. Without it,
requests are generally restricted to public information.

### Credential policy (this project)

Treat `CobaltSession` as a password-equivalent credential:

- Do **not** add a token input to the hosted importer.
- Do **not** transmit, persist, log, or proxy the cookie.
- Do **not** ask users to manually extract or paste it.
- Do **not** include it in fixtures, errors, analytics, or support diagnostics.

Browser helpers and extensions can avoid exposing the token by running the
authenticated character request **within the user's existing D&D Beyond browser
session**. The helper should export or pass along the resulting character JSON,
never the session credential itself.

Some third-party importers use a server proxy to work around browser CORS and
attach a user-supplied `CobaltSession` to upstream requests. That increases
credential-handling responsibility and is **not appropriate** for this experiment.

### Unavailable characters (public ID fetch)

When an unauthenticated server fetch cannot retrieve character data, the API
returns normalized `character-unavailable` (HTTP 404). Do **not** claim with
certainty that privacy caused the failure — deleted characters, invalid IDs,
permissions, or provider changes may produce similar responses.

**Dashboard alert copy:**

> **This character may be private**
> D&D Beyond did not return character data without an authenticated session. Make
> the character public or upload a JSON export created while signed in.

## API version compatibility

Parse D&D Beyond **error envelopes** before treating a response as schema drift.
When upstream returns `error.code: "UnsupportedApiVersion"`, map to
`unsupported-api-version` (HTTP 502), not `invalid-upstream-payload`.

Include `requestedPayloadVersion` and `supportedPayloadVersion` in success
`source` metadata and error `details` / server logs.

## Unofficial and unstable upstream

D&D Beyond character service endpoints and authentication behaviors are
**unofficial** and may change without versioning or notice. The permissive
external schema uses `.passthrough()` at volatile boundaries so additive upstream
fields do not break the experiment; incompatible changes surface as
`unsupported-api-version` or `invalid-upstream-payload`.

## Schema policy (narrow comprehensive)

- **Adapter-critical** — explicit schemas for nodes the mapper reads (stats,
  modifiers, traits, HP inputs, `alignmentId`, `data.race` species node).
- **Roadmap-useful** — shallow named schemas for classes, inventory, spells,
  feats (ids/labels).
- **Volatile** — `.passthrough()`; documented in this README as unsupported
  capabilities, not local character fields.

## Unsupported source capabilities

See the parent experiment plan for category inventory (identity, runtime state,
derived values, presentation-only fields). Values in `availableSourceData` are
evidence for preview/debug only and must never flow into character persistence.

### Ambiguous props (follow-up)

| Source field                | Notes                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `adjustmentXp`              | Recorded in `availableSourceData`; not summed into mapped XP                                |
| `removedHitPoints`          | Runtime state; not mapped to local HP contract                                              |
| Saving-throw proficiencies  | Ignored in preview (`resolved-from-local-content`); resolved from local class               |
| `data.race`                 | D&D Beyond species — mapped to local `species` preview (`fullName`, `baseRaceName`, `slug`) |
| Background definition prose | Excluded from personal `narrative.backstory`                                                |

## Fixtures

[`fixtures/character-133058471.json`](fixtures/character-133058471.json) is a
sanitized public character response. Fixtures must never contain session cookies,
tokens, or private account metadata.
