# @rpg/bench-cli

Agent-friendly CLI for Dev Bench tickets and epics. Primary integration surface for Cursor agents.

Workflow playbook → [`.cursor/skills/dev-bench/SKILL.md`](../../.cursor/skills/dev-bench/SKILL.md). Field authoring detail → [`docs/dev-bench-agent-reference.md`](../../docs/dev-bench-agent-reference.md).

## Prerequisites

Ensure **`apps/api` is running** before using the CLI:

```bash
pnpm --filter @rpg/api dev
```

The CLI talks to the API **directly** (not through the `:8080` dev proxy).

| Variable        | Default                 | Purpose              |
| --------------- | ----------------------- | -------------------- |
| `BENCH_API_URL` | `http://localhost:5001` | Express API base URL |

From the repo root:

```bash
pnpm bench <command> [options]
```

## Commands

| Command         | Description                                         |
| --------------- | --------------------------------------------------- |
| `add-ticket`    | Create a ticket (`--json` required)                 |
| `get-ticket`    | Read one ticket by `BENCH-###` or Mongo `id`        |
| `list-tickets`  | List/filter tickets                                 |
| `update-ticket` | Patch a ticket (`--json` required)                  |
| `create-epic`   | Create an epic (`--json` required)                  |
| `list-epics`    | List/filter epics                                   |
| `seed-epics`    | Idempotently create starter epics from `SEED_EPICS` |
| `suggest-next`  | Recommend next eligible ticket (weighted heuristic) |

Global flags:

- `--format json|text` — default `json` (stdout success envelope; stderr errors)
- `-h, --help` — usage

`add-ticket` also accepts `--created-by user|agent` (default `agent`).

## list-tickets filters

```bash
pnpm bench list-tickets --status backlog
pnpm bench list-tickets --area rules
pnpm bench list-tickets --type feature --priority high
pnpm bench list-tickets --epic-id <mongoId> --size m --created-by agent
```

| Flag           | Values                                                            |
| -------------- | ----------------------------------------------------------------- |
| `--status`     | `backlog`, `up_next`, `in_progress`, `blocked`, `done`, `wont_do` |
| `--area`       | lowercase slug (see agent reference)                              |
| `--type`       | ticket type enum                                                  |
| `--priority`   | `critical`, `high`, `medium`, `low`                               |
| `--size`       | `xs`, `s`, `m`, `l`, `xl`                                         |
| `--epic-id`    | Mongo epic id                                                     |
| `--created-by` | `user`, `agent`                                                   |

## suggest-next

Recommends one eligible ticket (`backlog` or `up_next`, no blockers) using `@rpg/dev-bench-core` scoring. Fetches all tickets and epics, then filters client-side — no dedicated API route.

```bash
pnpm bench suggest-next --epic-name "Rules Configuration"
pnpm bench suggest-next --epic-id <mongoId>
pnpm bench suggest-next --area rules
pnpm bench suggest-next --epic-name "Rules Configuration" --area rules
```

| Flag          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `--epic-id`   | Scope to epic Mongo id (wins over `--epic-name`) |
| `--epic-name` | Resolve epic by title (errors if no match)       |
| `--area`      | Scope to ticket area slug                        |

JSON success: `{ "ok": true, "data": { "ticket": Ticket \| null, "context": { ... } } }`. Text: ticket snapshot or `No eligible ticket.`

## Blocker and related ticket ids

`blockedByTicketIds` and `relatedTicketIds` in update JSON require **Mongo ids**, not display keys.

Duplicate ids within one array are rejected. The same id cannot appear in **both** arrays — the API returns `invalid_reference` with a clear message (not a misleading “do not exist” error).

```bash
pnpm bench get-ticket BENCH-001          # copy data.ticket.id
pnpm bench update-ticket BENCH-042 --json '{
  "status": "blocked",
  "blockedByTicketIds": ["507f1f77bcf86cd799439011"]
}'
```

## Examples

```bash
pnpm bench seed-epics

pnpm bench add-ticket --json '{
  "title": "Add patch write support",
  "type": "feature",
  "priority": "high",
  "size": "m",
  "status": "up_next",
  "epicName": "Rules Configuration"
}'

pnpm bench get-ticket BENCH-001 --format text
pnpm bench list-tickets --status backlog
pnpm bench update-ticket BENCH-001 --json '{"status":"in_progress"}'

pnpm bench suggest-next --epic-name "Rules Configuration" --format text
```

**Never set `key` on create** — the server assigns `BENCH-###`.

## Output

Success (JSON):

```json
{
  "ok": true,
  "data": {}
}
```

Errors print to **stderr** and exit `1`.

| Code               | Meaning                                        |
| ------------------ | ---------------------------------------------- |
| `VALIDATION_ERROR` | Bad JSON or Zod parse                          |
| `API_ERROR`        | 4xx/5xx from API                               |
| `NETWORK_ERROR`    | API unreachable — start `@rpg/api`             |
| `NOT_FOUND`        | Ticket/epic missing                            |
| `AMBIGUOUS_EPIC`   | Multiple epics match `epicName` — use `epicId` |

On `epicName` with no match: ticket still creates **without epic**; response includes `warnings`.

`--format text` on `get-ticket` returns a markdown snapshot via `formatTicketForAgent`.

## Development

```bash
pnpm --filter @rpg/bench-cli test
pnpm --filter @rpg/bench-cli typecheck
pnpm --filter @rpg/bench-cli lint
```

HTTP client lives in `src/lib/api.ts` only — no `@rpg/api-client`, no `apps/bench` clients. Domain helpers come from `@rpg/dev-bench-core`.
