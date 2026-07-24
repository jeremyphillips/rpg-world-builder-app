# Content duplication (API)

Manager-only workflow for copying homebrew/system catalog records within a campaign.

## Endpoint

`POST /api/campaigns/:campaignId/content/:contentType/:entityId/duplicate`

Body: `{ "name": string }` — trimmed, non-empty display name. Slug is resolved server-side with suffix collision policy.

Response: same envelope as ordinary create (`{ [responseKey]: entity }`).

## Authorization

- Owner/co-owner only
- Source re-read at submission time (latest persisted document)
- `CONTENT_TYPE_CAPABILITIES.canDuplicate` must be true for the route key

## Transform pipeline

1. Load source entity
2. Strip envelope/overlay/deny-list fields (including `campaignAccess`)
3. Resolve destination slug (`collisionPolicy: 'suffix'`)
4. Regenerate nested authored ids per type registry
5. Parse through create-input schema
6. Insert via `createHomebrewContent` with duplicate creation defaults (draft homebrew, default campaign access)

Spell duplication remaps resolution effect ids atomically. Subclass duplication is deferred.

## Idempotency

Clients may send `Idempotency-Key` (`CONTENT_DUPLICATION_IDEMPOTENCY_HEADER` in `@rpg/contracts`).
The API stores a campaign-scoped mapping and replays the created entity id for duplicate requests with the same key and source parameters.

Without a key, suffix collision policy allows two successful requests to create two records.

## Gaps / backlog

- `duplicatedFrom` provenance field (not modeled yet)
- Subclass duplication

## Related

- Dashboard dialog: `apps/dashboard/src/features/content/lib/duplication/`
- Capability registry: `packages/contracts/src/rpg/content/lib/content-type-capabilities.ts`
- Campaign access defaults: `resolveContentCreationDefaults({ mode: 'duplicate' })`
