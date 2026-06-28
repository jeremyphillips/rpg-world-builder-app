---
name: dev-bench
description: >-
  Dev Bench agent workflow — when to create/update tickets, field conventions,
  status semantics, and pnpm bench CLI usage. Use when capturing gaps, planning
  work, updating ticket status, linking code refs, assigning epics, or any
  Dev Bench ticket/epic task in this repo.
---

# Dev Bench — Agent Workflow

Dev Bench is the local workbench for requirements, gaps, epics, and agent-assisted planning in this monorepo. **Use the CLI** (`pnpm bench`) — do not invent ticket keys, call the browser API with CSRF, or duplicate schemas outside `@rpg/contracts/dev-bench`.

Product overview → [`.cursor/plans/dev-bench/00-product-scope.md`](../../plans/dev-bench/00-product-scope.md). CLI detail → [`tools/bench/README.md`](../../../tools/bench/README.md).

---

## Prerequisites

1. **API running** (CLI talks directly to `:5001`, not the `:8080` proxy):

   ```bash
   pnpm --filter @rpg/api dev
   ```

2. **Optional first-time seed** (starter epics — idempotent):

   ```bash
   pnpm bench seed-epics
   ```

3. **Env:** `BENCH_API_URL` defaults to `http://localhost:5001`.

---

## When to create a ticket vs stay in chat

| Situation                                                                | Action                                                           |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| User asked to track a gap, bug, follow-up, or plan item                  | Create a ticket                                                  |
| Work spans multiple sessions or needs status/blockers                    | Create or update a ticket                                        |
| Pure explanation, one-off fix already done, or trivial typo fixed inline | No ticket                                                        |
| User said "don't create a ticket"                                        | No ticket                                                        |
| Unclear whether to persist                                               | Ask once; default to **backlog** capture if they want it tracked |

Always **search for duplicates** before creating (see [Duplicate check](#duplicate-check)).

---

## Status semantics

**Priority = importance. Status = workflow location.**

| Intent                | Status        | CLI example                                  |
| --------------------- | ------------- | -------------------------------------------- |
| Capture for later     | `backlog`     | default on `add-ticket`                      |
| Near-term / on Bench  | `up_next`     | `"status": "up_next"`                        |
| Actively implementing | `in_progress` | `update-ticket … '{"status":"in_progress"}'` |
| Blocked on dependency | `blocked`     | include `blockedByTicketIds` (Mongo ids)     |
| Done                  | `done`        | `"status": "done"`                           |
| Won't pursue          | `wont_do`     | `"status": "wont_do"`                        |

Bench UI shows `up_next`, `in_progress`, `blocked`, `done` only. `backlog` and `wont_do` live in Backlog / filters.

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

| Value | Rough scope                               |
| ----- | ----------------------------------------- |
| `xs`  | Minutes–1 hour                            |
| `s`   | Few hours                                 |
| `m`   | 1–2 days (common default)                 |
| `l`   | Several days                              |
| `xl`  | Multi-day / epic-sized (prefer splitting) |

### Area (`area`)

Lowercase slug: `^[a-z][a-z0-9_]*$`. Prefer existing values:

`character_builder`, `rules`, `campaigns`, `contracts`, `api`, `ui`, `combat`, `content`, `devops`

Match the epic or primary package touched when obvious.

### Epic

- Resolve by **`epicName`** (CLI) or **`epicId`** when known.
- `pnpm bench list-epics` to see titles.
- Seed epics: Character Builder, Rules Configuration, Campaign Builder, Content Library, Combat Simulator.
- Tickets may have **no epic** — do not force assignment.

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

Short, verifiable bullets — what "done" means for an agent or human:

```json
{
  "acceptanceCriteria": [
    "pnpm bench add-ticket creates a ticket with server-assigned BENCH- key",
    "Invalid JSON exits 1 with VALIDATION_ERROR"
  ]
}
```

Prefer outcomes over implementation steps. Use [`parseAcceptanceCriteria`](../../../packages/dev-bench-core/src/parsing/parse-acceptance-criteria.ts) conventions when editing multi-line text in the UI.

---

## Duplicate check

No `suggest-next` yet — **manual search**:

```bash
pnpm bench list-tickets --status backlog
pnpm bench list-tickets --area rules
pnpm bench list-epics --status active
```

Scan titles; if a match exists, **update** that ticket instead of creating a duplicate.

---

## CLI reference

All commands from repo root. Default output: JSON on stdout (`{ "ok": true, "data": … }`). Errors on stderr, exit `1`.

| Command                                         | Purpose                  |
| ----------------------------------------------- | ------------------------ |
| `pnpm bench add-ticket --json '…'`              | Create ticket            |
| `pnpm bench get-ticket BENCH-123`               | Read by display key      |
| `pnpm bench get-ticket <mongoId>`               | Read by id               |
| `pnpm bench update-ticket BENCH-123 --json '…'` | Patch fields             |
| `pnpm bench list-tickets [--filters]`           | List/filter              |
| `pnpm bench create-epic --json '…'`             | Create epic              |
| `pnpm bench list-epics [--status active]`       | List epics               |
| `pnpm bench seed-epics`                         | Idempotent starter epics |

Flags:

- `--format text` — markdown ticket snapshot (`formatTicketForAgent`) or compact lists
- `--created-by user|agent` — `add-ticket` only (default `agent`)

**Never set `key`** — server assigns `BENCH-###` on create.

---

## Common workflows

### Capture a gap (backlog)

```bash
pnpm bench add-ticket --json '{
  "title": "Validate epic area on create",
  "type": "bug",
  "priority": "medium",
  "size": "s",
  "area": "api",
  "description": "Epic create accepts invalid area slugs.",
  "epicName": "Rules Configuration",
  "acceptanceCriteria": ["Invalid area returns 400 with clear message"],
  "codeRefs": [{ "path": "apps/api/src/features/dev-bench/bench.service.ts" }]
}'
```

### Start near-term work

```bash
pnpm bench add-ticket --json '{
  "title": "Bench workflow columns",
  "type": "feature",
  "priority": "high",
  "size": "m",
  "status": "up_next",
  "area": "ui"
}'
```

### Read ticket for implementation planning

```bash
pnpm bench get-ticket BENCH-042 --format text
```

### Move through workflow

```bash
pnpm bench update-ticket BENCH-042 --json '{"status":"in_progress"}'
pnpm bench update-ticket BENCH-042 --json '{"status":"done"}'
```

### Mark blocked

```bash
pnpm bench update-ticket BENCH-042 --json '{
  "status": "blocked",
  "blockedByTicketIds": ["507f1f77bcf86cd799439011"]
}'
```

Use Mongo **ids** in `blockedByTicketIds` / `relatedTicketIds`, not display keys.

---

## Error codes

| Code               | Meaning                                                        |
| ------------------ | -------------------------------------------------------------- |
| `VALIDATION_ERROR` | Bad JSON or Zod parse                                          |
| `API_ERROR`        | 4xx/5xx from API                                               |
| `NETWORK_ERROR`    | API unreachable — start `@rpg/api`                             |
| `NOT_FOUND`        | Ticket/epic missing                                            |
| `AMBIGUOUS_EPIC`   | Multiple epics match `epicName` — use `epicId` or disambiguate |

On `epicName` with no match: ticket still creates **without epic**; response includes `warnings`.

---

## UI vs CLI

| Surface                                      | Use                                             |
| -------------------------------------------- | ----------------------------------------------- |
| **CLI**                                      | Agent create/read/update/list; scriptable JSON  |
| **Browser** (`http://localhost:8080/bench/`) | Human review, filters, drawer edit, epic boards |

Same data, same API. Agents should prefer CLI during implementation sessions.

---

## Do not

- Assign ticket `key` client-side
- Use `@rpg/api-client` or session cookies from agent shell
- Add `epicName` to contracts — CLI-only resolver
- Auto-seed epics on every task — `seed-epics` is explicit
- Use `delete-ticket` / `delete-epic` via CLI (not implemented)
