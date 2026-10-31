# content / equipment / magic-items

Magic items. Part of the [`equipment`](../README.md) group within the
[`content`](../../README.md) feature; see
[feature-conventions](../../../../../docs/feature-conventions.md) for layout.

## Composition

`baseEquipmentId` was an unused optional link from a magic-item definition to one mundane weapon, armor, or adventuring-gear row. The schema comment called it a content id. The combobox stored a slug. Inheritance was never built, and a single base record is the wrong long-term shape: a magic-item definition may apply to a category of mundane equipment, and some magic items have no mundane base.

Physical statistics stay on canonical equipment definitions. Reusable magical capabilities and applicability stay on magic-item definitions. Composition happens on the owned equipment instance when a mundane base is appropriate. A magic item may stand alone, with no mundane base. Reuse `magicProperties` and the shared effect path. Future activations and charges use the shared activation and limited-use contracts. Keep authored definitions, owned instances, and runtime state distinct.

Later named-item work should evaluate that model. It should not revive `baseEquipmentId`, and it should not add `magicItemId`, an applicability schema, a second modifier calculator, or a separate execution system in order to express these cases:

1. Longsword +1 — a numeric enchantment on a longsword instance.
2. Flame Tongue scimitar — a category-compatible magic item with activation, conditional damage, and attunement, composed onto a scimitar instance.
3. Wand of Wonder — a standalone magic item with charges and effects, and no mundane base.
