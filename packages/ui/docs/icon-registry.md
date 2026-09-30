# Icon registry

Lucide remains the default glyph set. **One owner per semantic role** — character, spell, edit, and similar named roles each have a single registry entry. The same Lucide component may represent unrelated roles; alias only when the section _is_ that role.

## Layers

| Layer          | Owner                                                                          | Consumer API                                                                             |
| -------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Identity       | `CONTENT_DISPLAY_FALLBACK_ICONS` + contracts `ContentDisplayFallback` keys     | `contentIdentityIcon(key)`, `ContentDisplayFallbackIcon`                                 |
| Surface policy | `resolveContentDisplayFallback`, `resolveContentDisplayFallbackForContentType` | Chooses which identity key (or `generic`) a surface uses                                 |
| Section        | Feature-local maps (form tabs, connections, builder facts)                     | `contentIdentityIcon` for semantic aliases; direct Lucide for section-owned glyphs       |
| Granted choice | `GrantedChoiceLeadingIcon` (builder choice-section)                            | `BadgeCheck` leading affordance on granted `ContentEntityCard` rows — not an action verb |
| Action         | `ACTION_ICONS`                                                                 | `ActionIcon`, `ActionButton`, remove/add wrappers                                        |

`campaign` and `generic` may share a component today but are separate map entries — do not alias one to the other.

**Preview rail / form chrome:** `resolveContentDisplayFallbackForContentType` uses `resolveContentMediaDomainForContentType` for media-opted types (class/species stay on `generic` for `surface: 'field'`). Non-media catalog types (spells, feats, skill-proficiencies) use identity keys (`spell`, `feat`, `skill-proficiency`), not `generic`.

## Actions

`ActionButton` accepts only `action` (closed verb) plus normal `Button` props. It does not accept custom glyphs, `icon`, or destructive styling for `remove`. Use `ArrayItemRemoveButton`, `ContentCardRemoveButton`, or explicit `variant` on the button.

Domain verbs (`invite`, `addMedia`, `compose`) are explicit keys, not overloads of `add`.

**`remove`** vs **`delete`** — detach from a collection vs destructive record removal; may share `Trash2` but stay separate verb keys.

Overflow triggers: **`overflow`**, **`overflowVertical`**, **`overflowMenu`**.

## Guards

`icon-registry-ban.test.ts` (`@rpg/ui` action wrappers), `icon-registry-scope-ban.test.ts` and `icon-registry-identity-ban.test.ts` (dashboard) block raw Lucide verbs and direct identity imports in migrated paths.

## Custom icons later

Maps store `AppIcon` components. Swap one registry entry (Lucide → custom) without changing call sites that use `contentIdentityIcon` or `ACTION_ICONS`.
