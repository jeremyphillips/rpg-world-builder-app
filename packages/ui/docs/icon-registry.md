# Icon registry

Lucide remains the default glyph set. **One owner per semantic role** — character, spell, edit, and similar named roles each have a single registry entry. The same Lucide component may represent unrelated roles; alias only when the section _is_ that role.

## Layers

| Layer          | Owner                                                                          | Consumer API                                                                       |
| -------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Identity       | `CONTENT_DISPLAY_FALLBACK_ICONS` + contracts `ContentDisplayFallback` keys     | `contentIdentityIcon(key)`, `ContentDisplayFallbackIcon`                           |
| Surface policy | `resolveContentDisplayFallback`, `resolveContentDisplayFallbackForContentType` | Chooses which identity key (or `generic`) a surface uses                           |
| Section        | Feature-local maps (form tabs, connections, builder facts)                     | `contentIdentityIcon` for semantic aliases; direct Lucide for section-owned glyphs |
| Action         | `ACTION_ICONS`                                                                 | `ActionIcon`, `ActionButton`, remove/add wrappers                                  |

`campaign` and `generic` may share a component today but are separate map entries — do not alias one to the other.

## Actions

`ActionButton` accepts only `action` (closed verb) plus normal `Button` props. It does not accept custom glyphs, `icon`, or destructive styling for `remove`. Use `ArrayItemRemoveButton`, `ContentCardRemoveButton`, or explicit `variant` on the button.

Domain verbs (`invite`, `addMedia`, `compose`) are explicit keys, not overloads of `add`.

## Guards

`icon-registry-ban.test.ts` blocks direct Lucide imports for migrated action wrappers and identity alias consumers.

## Custom icons later

Maps store `AppIcon` components. Swap one registry entry (Lucide → custom) without changing call sites that use `contentIdentityIcon` or `ACTION_ICONS`.
