# @rpg/content-types

Metadata-only integration index for **top-level** catalog content types. Supports
drift tests and future scaffolding — **not** imported by runtime apps.

## Contracts vs tooling split

| Layer       | Package                             | Owns                                                                   |
| ----------- | ----------------------------------- | ---------------------------------------------------------------------- |
| Semantic    | `@rpg/contracts`                    | `CONTENT_TYPE_KEYS`, `CONTENT_TYPE_TERMS`, `CONTENT_TYPE_CAPABILITIES` |
| Integration | `@rpg/content-types` (this package) | `CONTENT_TYPE_INTEGRATION_MANIFEST` — repo paths and flags only        |

## Non-authoritative rule

> `CONTENT_TYPE_INTEGRATION_MANIFEST` documents required integration surfaces
> and supports drift tests. **Runtime registries remain authoritative for
> behavior.**

Do not put schemas, loaders, route functions, or capability objects in the
manifest. Metadata strings and booleans only.

## Bundled catalog metadata

Every entry declares whether it ships system records:

```typescript
catalog: { bundledContent: 'bundled', packageName: '@rpg/catalog/spells' }
catalog: { bundledContent: 'none' }
```

`packageName` is required only for `bundledContent: 'bundled'`. Types whose
normal records are campaign-authored do not need fake empty seed packages;
catalog export and path drift checks skip `bundledContent: 'none'`.

## Nested resources

The manifest covers registered top-level `ContentTypeKey` values only. Nested
resources such as **subclasses** stay outside until a separate nested-resource
manifest exists.

## Drift-test ownership

| Layer             | Test location                                                        |
| ----------------- | -------------------------------------------------------------------- |
| Tooling           | `src/content-type-integration-manifest.test.ts` — path resolution    |
| Contracts         | `content-type-term-coverage.test.ts` — terms + capabilities keys     |
| API               | `apps/api/.../content-types.integration-manifest.test.ts`            |
| Dashboard routes  | `apps/dashboard/src/app/content-routes.integration-manifest.test.ts` |
| Dashboard sidebar | `content-registry.test.ts`                                           |
| Dashboard forms   | `content-form-registry.test.ts`                                      |
| Catalog           | `packages/catalog/src/content-type-integration-manifest.test.ts`     |

When adding a type, update `CONTENT_TYPE_INTEGRATION_MANIFEST` first, then wire
each layer. See [`docs/content-types.md`](../../docs/content-types.md).
