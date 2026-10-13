# content / monsters

Monsters / stat block entries. Part of the [`content`](../README.md) feature; see
[feature-conventions](../../../../docs/feature-conventions.md) for layout.

## Key paths

| Area                             | Path                                                           |
| -------------------------------- | -------------------------------------------------------------- |
| Form registry                    | [`lib/monster-form-def.ts`](./lib/monster-form-def.ts)         |
| Form hub                         | `lib/monster-form-{fields,values,schema,labels,preview}.ts(x)` |
| Equipment tab lib                | [`lib/equipment/`](./lib/equipment/)                           |
| Actions tab lib                  | [`lib/actions/`](./lib/actions/)                               |
| Statistics tab lib               | [`lib/statistics/`](./lib/statistics/)                         |
| Creature details tab lib         | [`lib/creature-details/`](./lib/creature-details/)             |
| Detail read model                | [`lib/monster-display.ts`](./lib/monster-display.ts)           |
| Catalog validation / write gates | [`docs/catalog-validation.md`](./docs/catalog-validation.md)   |

Routes side-effect-import `monster-form-def.ts` in create/edit chunks — see
[code-splitting.md](../../../../docs/code-splitting.md).
