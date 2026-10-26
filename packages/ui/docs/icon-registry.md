# Icon guide

Glyphs render through `<Icon name="…" size="…" />` in `@rpg/ui`. Lucide (and one custom glyph) live only in `icon-glyphs.lucide.ts` and `icon-glyphs.custom.tsx`.

## Size modes (required)

| `size`     | Who sets geometry                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `xs`…`3xl` | The icon — `.ui-icon--{step}` sets `--icon-size` from `--icon-glyph-*` tokens.                         |
| `inline`   | Typography owners (`body`, `.text-*`, `prose`, `.ui-semantic-text`) via `--icon-inline`.               |
| `owner`    | A BEM owner on the icon or an ancestor publishes `--icon-size` (and optionally `--icon-stroke-width`). |

There is no default: `owner` without a declaring owner fails the Storybook geometry census.

Precedence: explicit step beats `inline` and `owner`; `inline` reads only `--icon-inline`; `owner` reads `--icon-size` from the element class or the nearest ancestor owner.

## Semantic maps

Domain maps (`ACTION_ICONS`, `CONTENT_DISPLAY_FALLBACK_ICONS`, feature tab maps, etc.) store canonical `IconName` strings, not components. Wrappers (`ActionIcon`, `ActionButton`, `ContentDisplayFallbackIcon`, `contentIdentityIcon`, `resourceIcon`) render `Icon`.

| Layer          | Owner                                             | Consumer API                                                                    |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Identity       | `CONTENT_DISPLAY_FALLBACK_ICONS` + contracts keys | `contentIdentityIcon(key)`, `ContentDisplayFallbackIcon`                        |
| Surface policy | `resolveContentDisplayFallback*`                  | Chooses identity key per surface                                                |
| Section        | Feature-local maps                                | `IconName` in config; slot renders `Icon` with `size="owner"` where appropriate |
| Action         | `ACTION_ICONS`                                    | `ActionIcon`, `ActionButton`                                                    |
| Resource       | `RESOURCE_ICONS`                                  | `resourceIcon('currency' \| 'magicItem')`                                       |

`ActionButton` accepts only `action` (closed verb) plus normal `Button` props. Overflow triggers use `overflow`, `overflowVertical`, or `overflowMenu`.

| Verb      | Glyph  | Meaning                                        |
| --------- | ------ | ---------------------------------------------- |
| `details` | `info` | Reveal more information about the current item |
| `view`    | `eye`  | Open or navigate to a resource                 |

Icon-only `ActionButton` with `action="details"` uses the accessible name `View details` when `aria-label` is omitted. Callers that name a specific item still pass `aria-label`.

## Accessibility

`Icon` is always decorative (`aria-hidden="true"`). Names belong on interactive controls (`aria-label` on buttons, links, etc.). `Spinner` keeps `role="status"` on its wrapper span.

Callers cannot pass `aria-*`, `data-*`, `role`, `title`, or `style` on `Icon`. Tests assert glyph identity with `[data-icon="…"]`.

## Enforcement

- ESLint `rpg-icons/no-icon-provider-import` — provider imports only in the Lucide adapter (and its test).
- ESLint `rpg-icons/no-inline-svg` — raw `<svg>` only in `icon-glyphs.custom.tsx` and `overlay-arrow.client.tsx`.
- Vitest `icon-glyph-sizing-ban.test.ts` — no legacy `size-icon-glyph-*`, `size-icon-inline`, or `[&_svg]:size-*` in app/UI implementation files.
- Storybook test-runner geometry census — computed width, height, and stroke-width snapshots in both Storybooks.

## Naming

`IconName` is kebab-case, provider-neutral, one name per distinct glyph. Renames are typed refactors across the registry and maps.
