---
name: open5e-srd
description: >-
  Look up D&D SRD 5.2 spells, monsters, items, feats, species, and rules via
  Open5e API v2 with document srd-2024 only. Use when verifying SRD text or
  stats, comparing catalog seeds, authoring from SRD, or when the user mentions
  Open5e or SRD — fetch live data; never use srd-2014 or unfiltered Open5e data.
---

# Open5e SRD reference

External **SRD 5.2** text and stats via [Open5e API v2](https://open5e.com/api-docs).
**Fetch live JSON — do not quote SRD from memory.**

Repo ruleset [`srd-cc-5.2.1`](../../../packages/contracts/src/rpg/primitives/provenance/source-document-registry.ts)
maps to Open5e document key **`srd-2024`** (“System Reference Document 5.2”, gamesystem `5e-2024`).

Query cheat sheet → [api-reference.md](api-reference.md).

---

## SRD source lock

| Required | Forbidden |
| -------- | --------- |
| `document__key=srd-2024` on every list/filter | `srd-2014`, third-party document keys (`tob`, …) |
| Detail URLs with keys prefixed `srd-2024_` | Unfiltered resource lists |
| Re-fetch on typed endpoints after search | `document__key__in` mixing sources |

If the user asks for 2014 / 5.1 rules: this project targets **SRD 5.2.1** — stay on `srd-2024`; do not switch documents.

Before citing any row, confirm `document.key === 'srd-2024'` (or key prefix `srd-2024_`).

---

## Fast path

1. Pick a **v2** resource endpoint (`/v2/spells/`, `/v2/creatures/`, …) — not v1 (`/v1/monsters/`, etc.).
2. Add **`document__key=srd-2024`**.
3. Narrow with `name__iexact=` or `name__icontains=`.
4. Add `fields=` to trim the response.
5. Open the detail URL for the matching `key` when you need full prose or nested stats.

Prefer typed endpoints over `/v2/search/`. Search is discovery only — re-query with `document__key=srd-2024` before citing.

---

## When to use vs skip

| Use Open5e | Use something else |
| ---------- | ------------------ |
| Verify SRD wording, numbers, or stat blocks | [`spell-resolution`](../spell-resolution/SKILL.md) — resolution, promotion, effects modeling |
| Compare a catalog seed to official SRD | Catalog JSON — what the app ships |
| Paste or normalize SRD prose before structuring | Contracts / forms — authoring shape |

---

## Trigger phrases

| User says | Recipe |
| --------- | ------ |
| “check SRD …”, “what does the SRD say” | Typed endpoint + `document__key=srd-2024` + detail fetch |
| “goblin stat block”, “monster SRD” | `/v2/creatures/?document__key=srd-2024&…` |
| “compare seed to SRD”, “does our spell match SRD” | Open5e detail + matching catalog seed shard |
| “Open5e”, “look up on open5e” | Same lock; v2 only |
| “author from SRD text” | Open5e for source text; spell-resolution for structure |

---

## Core endpoints

Base: `https://api.open5e.com/v2/` — discover links with `GET /v2/`.

Common resources: `spells`, `creatures`, `feats`, `species`, `classes`, `conditions`, `rules`, `weapons`, `armor`, `magicitems`, `items`, `documents`.

---

## Worked examples

List spell:

```text
https://api.open5e.com/v2/spells/?document__key=srd-2024&name__iexact=Fireball&fields=name,key,level,school
```

Spell detail (pattern `{documentKey}_{slug}`):

```text
https://api.open5e.com/v2/spells/srd-2024_fireball/
```

List creatures:

```text
https://api.open5e.com/v2/creatures/?document__key=srd-2024&name__icontains=Goblin&fields=name,key,challenge_rating,type
```

Search (discovery only — then re-fetch with `document__key=srd-2024`):

```text
https://api.open5e.com/v2/search/?query=goblin
```

---

## Agent mechanics

- Use **WebFetch** or **curl** with network access; API is public (no API key).
- When pasting substantial SRD text into tickets or docs, include CC-BY attribution aligned with [`SOURCE_DOCUMENT_ENTRIES`](../../../packages/contracts/src/rpg/primitives/provenance/source-document-registry.ts) (`srd-5.2.1`).

---

## Additional resources

- Filters, pagination, field trimming → [api-reference.md](api-reference.md)
- Full Open5e filter reference → [open5e.com/api-docs](https://open5e.com/api-docs)
