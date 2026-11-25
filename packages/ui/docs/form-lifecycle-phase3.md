# Form validation lifecycle — Phase 3

Phase 3 wires pilot validation **sources** into one canonical ingestion path:

- `runFormAction` stages for content commit (`form-evaluate` → `prepare` → optional `write-validate`)
- **Producer slot replacement** (`interactive`, `draft-action`, `publish-readiness`, `publish-action`, `serialization`, `api`)
- **Prepared-write provenance** (`ContentPreparedWrite` with sparse path / row-index maps)

## Ownership

| Concern                                                      | Package                                  |
| ------------------------------------------------------------ | ---------------------------------------- |
| `runFormAction`, evaluator, producer session                 | `@rpg/ui/form`                           |
| Content commit pipeline, serialize/prepare, provenance tests | Dashboard `content/lib/forms/submit`     |
| Boundary normalization (`normalizeContentFormIssues`)        | Dashboard `content/lib/forms/validation` |

Monster prepare stays on the existing tombstone/`normalizeMonsterFormValues` contract until overlay cutover — no overlay intent writer in this phase.

## Content submit

`useContentFormSubmit` runs `runContentFormCommitPipeline` before `persist`. Successful prepare returns `ContentPreparedWrite`; persist receives `prepared.payload` only. Optional `prepareWrite` and `writeSchema` validate the wire DTO once without a second prepare pass.
