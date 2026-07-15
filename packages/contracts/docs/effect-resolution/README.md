# Effect resolution docs

Normative documentation for the reusable effect-resolution framework and its
content-type adapters.

| Doc                                            | Audience                                                |
| ---------------------------------------------- | ------------------------------------------------------- |
| [base.md](./base.md)                           | Shared selection, method, outcomes, and recipient rules |
| [spells.md](./spells.md)                       | Spell `resolution` envelope adapter                     |
| [class-features.md](./class-features.md)       | Future — class feature attachment                       |
| [subclass-features.md](./subclass-features.md) | Future — subclass feature attachment                    |
| [monster-actions.md](./monster-actions.md)     | Future — monster action attachment                      |

**Code (spell consumer today):** [`src/rpg/content/spell/resolution/`](../src/rpg/content/spell/resolution/)

**Unrelated:** [runtime-resolution-boundaries.md](../runtime-resolution-boundaries.md) covers character-builder runtime layering.
