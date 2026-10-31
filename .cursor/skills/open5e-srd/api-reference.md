# Open5e API v2 — `srd-2024` only

Condensed reference for agents in this repo. **Only document key `srd-2024` is in scope.**

Official docs: [open5e.com/api-docs](https://open5e.com/api-docs)

## Document

| Key | Name | Gamesystem |
| --- | ---- | ---------- |
| `srd-2024` | System Reference Document 5.2 | `5e-2024` |

Sanity check:

```text
GET https://api.open5e.com/v2/documents/srd-2024/
```

Do not query or cite other Open5e documents from this skill.

## Mandatory filter

Every **list** request on game content must include:

```text
document__key=srd-2024
```

Detail URLs use resource keys like `srd-2024_fireball`. Reject any result whose nested `document.key` is not `srd-2024`.

## Common query parameters

| Parameter | Use |
| --------- | --- |
| `document__key=srd-2024` | Required on lists |
| `name__iexact=` | Case-insensitive exact name |
| `name__icontains=` | Partial name match |
| `fields=` | Comma-separated allowlist of top-level fields |
| `document__fields=` | Trim nested document object (with `fields=` on parent) |
| `ordering=` | Sort (default is name descending; prefix `-` for reverse) |
| `limit=` / `page=` | Pagination (default page size 50) |

Example field trim:

```text
/v2/creatures/?document__key=srd-2024&fields=name,key,document&document__fields=key,name
```

## Resource → repo use

| Endpoint | Typical task |
| -------- | ------------ |
| `/v2/spells/` | Spell prose, level, school vs catalog seeds |
| `/v2/creatures/` | Monster stat blocks, actions, traits |
| `/v2/weapons/`, `/v2/armor/`, `/v2/items/`, `/v2/magicitems/` | Equipment authoring |
| `/v2/feats/`, `/v2/species/`, `/v2/classes/` | Character options |
| `/v2/conditions/`, `/v2/rules/` | Rules text |
| `/v2/search/` | Discovery only — always re-query typed endpoint with `document__key=srd-2024` |

## Pitfalls

- **Unfiltered lists** return Tome of Beasts, 2014 SRD, homebrew, etc. — never cite without `document__key=srd-2024`.
- **`/v2/search/`** mixes sources — never quote search hits until re-fetched under `srd-2024`.
- **API v1** (`/v1/monsters/`, unprefixed legacy root) is deprecated — use `/v2/…` only.
- **Memory** — SRD text changes between revisions; always fetch for authoritative wording.

## API root

```text
GET https://api.open5e.com/v2/
```

Returns hyperlinks to all v2 resource collections.
