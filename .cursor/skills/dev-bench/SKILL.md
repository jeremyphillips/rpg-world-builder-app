---
name: dev-bench
description: >-
  Dev Bench agent workflow playbook — capture, plan, and update tickets via
  pnpm bench. Field/CLI reference → docs/dev-bench-agent-reference.md and
  tools/bench/README.md.
---

# Dev Bench — Agent Workflow

Local workbench for requirements, gaps, epics, and agent-assisted planning. **Use the CLI** (`pnpm bench`) — do not invent ticket keys, call the browser API with CSRF, or redefine schemas outside `@rpg/contracts/dev-bench`.

---

## Fast path

When the user says **“add this to Dev Bench”** (see [Trigger phrases](#trigger-phrases)):

1. Identify title, type, priority, size, area, epic, code refs, and acceptance criteria.
2. Ask clarifying questions only when ambiguity would materially affect the ticket (see [Defaults](#defaults)).
3. Run a [duplicate check](#duplicate-check).
4. If a duplicate exists, **update** it — do not create a new one.
5. Otherwise `pnpm bench add-ticket --json` with [Defaults](#defaults).
6. Report key + one-sentence summary (key, title, status, epic if any, warnings). No full JSON unless asked.

**Ask when:** unclear title/outcome, whether to track, epic assignment, blocker relationship, done criteria, or ticket looks `xl` and needs splitting.

**Do not** ask for every optional field — use [Defaults](#defaults) for low-risk gaps.

---

## Trigger phrases

| User says                                                                | Recipe                                  |
| ------------------------------------------------------------------------ | --------------------------------------- |
| “add this to Dev Bench”, “add this gap”, “track this”, “create a ticket” | [Add this gap](#add-this-gap)           |
| “put this on my bench”                                                   | [Put on bench](#put-on-bench)           |
| “plan BENCH-###”                                                         | [Plan](#plan-bench-)                    |
| “start BENCH-###”                                                        | [Start](#start-bench-)                  |
| “mark blocked”, “link as blocker”                                        | [Mark blocked](#mark-blocked)           |
| “move … to done”                                                         | [Mark done](#mark-done)                 |
| “won’t pursue”                                                           | [Won’t pursue](#wont-pursue)            |
| “what should I work on next”, “recommend next”, “suggest next ticket”    | [Recommend next](#recommend-next)       |
| “list open tickets for …”, “what’s open in \<epic\>”                     | [List epic tickets](#list-epic-tickets) |

---

## When to create/update a ticket

| Situation                                               | Action                                                |
| ------------------------------------------------------- | ----------------------------------------------------- |
| Track a gap, bug, follow-up, or plan item               | Create or update                                      |
| Multi-session work or needs status/blockers             | Create or update                                      |
| Pure explanation, one-off fix done, trivial inline typo | No ticket                                             |
| User said “don’t create a ticket”                       | No ticket                                             |
| Unclear whether to persist                              | Ask once; default **backlog** if they want it tracked |

Updates beat duplicates — always search before create.

---

## Defaults

| Field       | Default   |
| ----------- | --------- |
| `status`    | `backlog` |
| `type`      | `feature` |
| `priority`  | `medium`  |
| `size`      | `m`       |
| `createdBy` | `agent`   |
| epic        | optional  |

Full enum guidance → [`docs/dev-bench-agent-reference.md`](../../docs/dev-bench-agent-reference.md).

---

## Ticket quality bar

**Include:** action-oriented title, enough context for future readers, ≥1 acceptance criterion, code refs when code-driven, epic only when the match is clear.

**Avoid:** vague titles (“Fix issue”), duplicate tickets, implementation-only acceptance criteria, `xl` scope without splitting (epic + smaller tickets, research ticket first, or ask user).

---

## Workflow recipes

Use [Required command patterns](#required-command-patterns). Existing CLI only.

### Add this gap

- Clarify if needed → duplicate check → create backlog ticket.
- **Report:** key + one-line summary.

### Put on bench

- Create or `update-ticket` with `"status": "up_next"`.

### Plan BENCH-###

- `get-ticket <key> --format text`; read code refs.
- Clarify if goal, AC, code, or constraints are ambiguous.
- Output implementation plan.
- **Do not** change status unless user asked to start.
- Create/link blocker tickets if prerequisites are missing.

### Start BENCH-###

- Read ticket → `update-ticket` → `"status": "in_progress"`.
- Brief plan → code only if agent mode allows edits.

### Mark blocked

- `blockedByTicketIds` / `relatedTicketIds` need **Mongo ids**, not `BENCH-###`:
  1. `pnpm bench get-ticket BENCH-123` → copy `id`
  2. Use in update JSON
- Set `"status": "blocked"`.
- Include blocker reason in description (or `relatedTicketIds`) if not obvious.

### Mark done

- Confirm AC met or summarize why.
- Warn if blockers remain.
- `update-ticket` → `"status": "done"`.

### Won’t pursue

- `update-ticket` → `"status": "wont_do"`.
- Preserve reason in description if not obvious.

### Recommend next

- `pnpm bench suggest-next --epic-name "Rules Configuration"` or `--epic-id <mongoId>` or `--area rules`.
- Read result (`--format text` for planning); **do not** auto-change status.
- Offer to [Plan](#plan-bench-) or [Start](#start-bench-) if the user wants to proceed.
- Epic detail UI has the same heuristic via **Recommend next** on `/epics/:epicId`.

### List epic tickets

- List incomplete work for an epic by title — backlog plus on-desk (`bucket=open` excludes only `done` and `wont_do`; **includes blocked**).
- Not the same as epic detail **Open Tickets** UI (that section splits blocked out via `epicTicketBucket`).

```bash
pnpm bench list-tickets --epic-name "Character Builder" --bucket open --format text
```

- `epicId` wins over `epicName` when both are set. Do not combine `--bucket` with `--status`.

---

## Duplicate check

Before every create, scan for overlap:

```bash
pnpm bench list-tickets --status backlog
pnpm bench list-tickets --area <area>
pnpm bench suggest-next --epic-name "<Epic>"   # optional — next work, not duplicate scan
```

Apply `@rpg/dev-bench-core` **`findDuplicateCandidates`** rules mentally (or in code when scripting):

| Signal                                 | Weight                        |
| -------------------------------------- | ----------------------------- |
| Same normalized title                  | Strong duplicate — **update** |
| Shared title tokens (≥3 chars)         | Review                        |
| Same `area` / `epicId` / code-ref path | Adds confidence               |

**Update** when title match is clear (score ≥ 10 equivalent). **Review** partial overlap (5–9). More filters → [`tools/bench/README.md`](../../../tools/bench/README.md).

---

## Required command patterns

**Create** (never set `key` — server assigns `BENCH-###`):

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

**Read for plan:**

```bash
pnpm bench get-ticket BENCH-042 --format text
```

**Status:**

```bash
pnpm bench update-ticket BENCH-042 --json '{"status":"in_progress"}'
pnpm bench update-ticket BENCH-042 --json '{"status":"done"}'
```

**Blocked** (resolve id first):

```bash
pnpm bench get-ticket BENCH-001   # copy data.ticket.id
pnpm bench update-ticket BENCH-042 --json '{
  "status": "blocked",
  "blockedByTicketIds": ["<mongoId>"]
}'
```

**Near-term capture:** add `"status": "up_next"` to create JSON, or patch after create.

**List open epic tickets** (`bucket=open` = not done / not wont_do):

```bash
pnpm bench list-tickets --epic-name "Character Builder" --bucket open --format text
```

**Recommend next:**

```bash
pnpm bench suggest-next --epic-name "Rules Configuration" --format text
pnpm bench suggest-next --area rules
pnpm bench suggest-next --epic-id <mongoId>
```

---

## Status semantics

**Priority = importance. Status = workflow location.**

| Intent                | Status                                          |
| --------------------- | ----------------------------------------------- |
| Capture for later     | `backlog` (create default)                      |
| On Bench / near-term  | `up_next`                                       |
| Actively implementing | `in_progress`                                   |
| Blocked on dependency | `blocked` (+ Mongo ids in `blockedByTicketIds`) |
| Done                  | `done`                                          |
| Won't pursue          | `wont_do`                                       |

Bench UI columns: `up_next`, `in_progress`, `blocked`, `done`. `backlog` and `wont_do` are in Backlog / filters.

---

## Do not

- Assign ticket `key` client-side
- Use `@rpg/api-client` or session cookies from the agent shell
- Put `epicName` in contracts — CLI resolver only
- Auto-run `seed-epics` every task
- Use `delete-ticket` / `delete-epic` via CLI (not implemented)
- Change status on **plan** or **recommend next** unless user asked to **start**
- Paste full CLI JSON in chat unless asked
- Create many tickets without approval (unless user asked for a breakdown)

---

## Reference links

| Topic                                | Doc                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Field enums, codeRefs, AC, UI vs CLI | [`docs/dev-bench-agent-reference.md`](../../docs/dev-bench-agent-reference.md)             |
| Commands, filters, errors, output    | [`tools/bench/README.md`](../../../tools/bench/README.md)                                  |
| Run API / env                        | [`docs/running.md`](../../docs/running.md)                                                 |
| Product scope                        | [`.cursor/plans/dev-bench/00-product-scope.md`](../../plans/dev-bench/00-product-scope.md) |
| Zod schemas                          | `@rpg/contracts/dev-bench`                                                                 |
