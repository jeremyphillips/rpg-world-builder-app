# Catalog managed media (dashboard)

Content types in `CONTENT_TYPE_MEDIA_DOMAIN` expose a header `ManagedMediaField` bound to RHF `media`. Writes must go through `serializeContentFormInput` at mutation boundaries — not raw `def.toInput`.

Source availability, display resolution, and workspace behavior are layered in
[content-media.md](../../../docs/content-media.md#four-layers-source--surface). The dashboard
passes `contentContext` into `resolveAvailableContentMediaSources` (via
`resolveMediaContentAvailability`); edit flows block the manager when lookup context is
`incomplete`, while create flows may list uploads only until identity exists.

## Write semantics

| Payload                          | Meaning                                            |
| -------------------------------- | -------------------------------------------------- |
| `media` omitted                  | Leave stored/overlay media unchanged (update only) |
| `media` populated                | Persist campaign override                          |
| `media: emptyContentMediaSchema` | Explicitly clear override                          |

Create includes authored `media` when gallery or roles are present. Update includes `media` only when `hasDirtyFields(dirtyFields.media)`.

## API reconciliation (follow-up)

Persisting `media` on the content document restores dashboard display but does **not** call `reconcileContentMedia` today. That API path owns `MediaReference` rows, asset `referenceCount`, and server-side revision bumps. Until content write hooks reconciliation, uploaded assets may remain unreferenced and eligible for reclaim. Track wiring `reconcileContentMediaReferencesInSession` into content create/update for media-bearing types before treating upload lifecycle as fully closed.
