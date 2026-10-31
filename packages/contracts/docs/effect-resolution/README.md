# Effect resolution docs

Normative documentation for the reusable effect-resolution framework and its
content-type adapters.

| Doc                                                            | Audience                                                |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| [base.md](./base.md)                                           | Shared selection, method, outcomes, and recipient rules |
| [spells.md](./spells.md)                                       | Spell `resolution` envelope adapter                     |
| [effect-capability-roadmap.md](./effect-capability-roadmap.md) | Atomic effect build priority and capability links       |
| [class-features.md](./class-features.md)                       | Future — class feature attachment                       |
| [subclass-features.md](./subclass-features.md)                 | Future — subclass feature attachment                    |
| [monster-actions.md](./monster-actions.md)                     | Monster `save` attachment and multiattack sequence      |
| [action-architecture.md](../action-architecture.md)            | Layers, kinds, preset provenance, and what is not built |

**Envelope:** [`src/rpg/content/lib/resolution/`](../../src/rpg/content/lib/resolution/)

**Closed sets:** [`src/rpg/vocab/resolution/`](../../src/rpg/vocab/resolution/)

**Spell adapter:** [`src/rpg/content/spell/resolution/`](../../src/rpg/content/spell/resolution/)

**Unrelated:** [runtime-resolution-boundaries.md](../runtime-resolution-boundaries.md) covers character-builder runtime layering.
