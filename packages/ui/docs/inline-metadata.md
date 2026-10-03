# Inline metadata

Compact inline labels (`Weapon · 1d6 Piercing`) share one spacing contract across strings and JSX.

## String SSOT (`@rpg/contracts`)

- `joinInlineMetadata(parts)` — drops null/undefined/false/blank strings; keeps numbers (including `0`); joins with `·` (word spaces around the middle dot).
- `formatInlineMetadataTail(parts)` — same predicate as `joinInlineMetadata`, but prefixes the joined tail with a leading `·` for copy rendered after separate primary text (for example field-group “Unsaved” suffix spans).
- `INLINE_METADATA_SEPARATOR` — the glyph only (`·`); do not hand-roll `·` in production code.

Import from `@rpg/contracts/primitives`.

## JSX SSOT (`@rpg/ui`)

- `<InlineMetadata role="…" density="…">` with required `<InlineMetadata.Item>` children.
- `role`: `heading` (foreground) or `supporting` (`text-muted-foreground`).
- `density`: `compact` or `comfortable` (separator spacing).
- `wrap`: default `true` for supporting (inline flow, no line-leading separators); `false` for nowrap flex rows (title + fixed tail).

Host components own font size, weight, and line-height; `InlineMetadata` only sets role tone and separator layout.

## String vs JSX

- Whole-line truncation, `title`, `aria-label`, tooltips, and API/search secondary text → `joinInlineMetadata`.
- Per-item styling, badges, links, responsive visibility, or truncating title with fixed tail → `InlineMetadata` (use `Item truncate` where needed).

## Exemptions (not metadata separators)

- Validation prose in spellcasting progression messages and class capacity progression.
- Action control-group dots (toolbar / bulk action chrome) — allowlisted files only.
- `in-page-section-nav.lib.ts` hierarchy labels (`Section · Leaf`).
- Design-token story helpers and dev harness readouts.

## Known architectural gap: surface density ownership

InlineMetadata currently requires an explicit `density` because density ownership
is not consistently modeled across dashboard surfaces.

During the initial migration, several card-like and summary surfaces had no
authoritative compact/comfortable density. This is treated as an architectural
gap rather than a responsibility of InlineMetadata.

Future direction:

- card/surface primitives should own density at their outer boundary;
- shared anatomy should inherit or receive that density;
- leaf presentation primitives such as InlineMetadata should consume the
  resolved density rather than independently infer it;
- feature components should not invent local density defaults.

Until that foundation exists, ambiguous consumers must choose density explicitly.
That is intentional for this migration: passing `density` at each leaf is
acceptable when the host surface has not yet adopted a shared density token.
Do not introduce a global InlineMetadata default to conceal missing surface
density ownership.

Candidate surfaces identified during the migration:

- CampaignMetaLine
- admin header/meta surfaces
- EquipmentBudgetHeader
- EmphasisDetailLine
- CatalogMetadataRenderer
- PreviewRail
- content-access metadata
- progression dock
