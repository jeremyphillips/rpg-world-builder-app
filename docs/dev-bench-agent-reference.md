# Dev Bench — Agent reference

Field conventions, ticket authoring detail, and surfaces. **Workflow playbook** → [`.cursor/skills/dev-bench/SKILL.md`](../.cursor/skills/dev-bench/SKILL.md). **CLI commands** → [`tools/bench/README.md`](../tools/bench/README.md).

Schemas are source of truth in `@rpg/contracts/dev-bench`.

---

## Prerequisites

1. **API on `:5001`** (CLI bypasses the `:8080` proxy):

   ```bash
   pnpm --filter @rpg/api dev
   ```

2. **Optional seed** (idempotent): `pnpm bench seed-epics`

3. **Env:** `BENCH_API_URL` defaults to `http://localhost:5001`.

See also [`docs/running.md`](running.md#dev-bench-cli).

---

## UI vs CLI

| Surface                                      | Use                                             |
| -------------------------------------------- | ----------------------------------------------- |
| **CLI** (`pnpm bench`)                       | Agent create/read/update/list; scriptable JSON  |
| **Browser** (`http://localhost:8080/bench/`) | Human review, filters, drawer edit, epic boards |

Same data, same API. Agents prefer CLI during implementation.

---

## Field guidance

### Type (`type`)

| Value      | Use when                               |
| ---------- | -------------------------------------- |
| `feature`  | New capability (default for most gaps) |
| `bug`      | Incorrect behavior                     |
| `test`     | Missing or broken tests                |
| `refactor` | Structure change, no behavior change   |
| `docs`     | Documentation only                     |
| `chore`    | Tooling, deps, CI                      |
| `research` | Spike / investigation                  |
| `design`   | UX or architecture exploration         |

### Priority (`priority`)

| Value      | Use when                    |
| ---------- | --------------------------- |
| `critical` | Blocks release or core loop |
| `high`     | Important soon              |
| `medium`   | Normal (safe default)       |
| `low`      | Nice-to-have                |

### Size (`size`)

| Value | Rough scope                                      |
| ----- | ------------------------------------------------ |
| `xs`  | Minutes–1 hour                                   |
| `s`   | Few hours                                        |
| `m`   | 1–2 days (common default)                        |
| `l`   | Several days                                     |
| `xl`  | Multi-day / epic-sized — split or research first |

### Area (`area`)

Lowercase slug: `^[a-z][a-z0-9_]*$`. Suggested values:

`character_builder`, `rules`, `campaigns`, `contracts`, `api`, `ui`, `combat`, `content`, `devops`

Match the epic or primary package touched when obvious.

### Epic

- Resolve by **`epicName`** (CLI) or **`epicId`** when known.
- `pnpm bench list-epics` to see titles.
- Seed epics: Character Builder, Rules Configuration, Campaign Builder, Content Library, Combat Simulator.
- Tickets may have **no epic** — do not force assignment.
- **`epicName` is CLI-only** — not in contracts.

### `createdBy`

CLI defaults to **`agent`**. Use `--created-by user` only when capturing on explicit user request.

---

## Code references (`codeRefs`)

Ground tickets in the repo. At least one `path` when the ticket is code-related.

```json
{
  "codeRefs": [
    { "path": "apps/api/src/features/dev-bench/bench.service.ts" },
    { "path": "packages/contracts/src/dev-bench/ticket.ts", "symbol": "ticketSchema" }
  ]
}
```

Optional: `lineStart` / `lineEnd`, `packageName`, `note`. Paths are **repo-relative strings** — not TypeScript imports.

---

## Acceptance criteria (`acceptanceCriteria`)

Short, verifiable bullets — what "done" means:

```json
{
  "acceptanceCriteria": [
    "pnpm bench add-ticket creates a ticket with server-assigned BENCH- key",
    "Invalid JSON exits 1 with VALIDATION_ERROR"
  ]
}
```

Prefer outcomes over implementation steps. UI multi-line paste → [`parseAcceptanceCriteria`](../packages/dev-bench-core/src/parsing/parse-acceptance-criteria.ts).

---

## Splitting large work

If a ticket would be **`xl`**, prefer:

- An epic plus smaller tickets
- A `research` ticket first
- Ask the user whether to split

Do not create many tickets without approval unless the user asked for a breakdown.

---

## Product context

Overview → [`.cursor/plans/dev-bench/00-product-scope.md`](../.cursor/plans/dev-bench/00-product-scope.md).
