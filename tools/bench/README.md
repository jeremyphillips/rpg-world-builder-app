# @rpg/bench-cli

Agent-friendly CLI for Dev Bench tickets and epics. Primary integration surface for Cursor agents.

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

Global flags:

- `--format json|text` — default `json` (stdout success envelope; stderr errors)
- `-h, --help` — usage

## Examples

```bash
# Seed starter epics (idempotent)
pnpm bench seed-epics

# Create a ticket for an agent workflow
pnpm bench add-ticket --json '{
  "title": "Add patch write support",
  "type": "feature",
  "priority": "high",
  "size": "m",
  "status": "up_next",
  "epicName": "Rules Configuration"
}'

# Read a ticket as markdown
pnpm bench get-ticket BENCH-001 --format text

# List backlog tickets
pnpm bench list-tickets --status backlog

# Update status
pnpm bench update-ticket BENCH-001 --json '{"status":"in_progress"}'
```

## Output

Success (JSON):

```json
{
  "ok": true,
  "data": {}
}
```

Errors print to **stderr** and exit `1`. Codes: `VALIDATION_ERROR`, `API_ERROR`, `NETWORK_ERROR`, `NOT_FOUND`, `AMBIGUOUS_EPIC`.

## Development

```bash
pnpm --filter @rpg/bench-cli test
pnpm --filter @rpg/bench-cli typecheck
pnpm --filter @rpg/bench-cli lint
```

HTTP client lives in `src/lib/api.ts` only — no `@rpg/api-client`, no `apps/bench` clients. Domain helpers come from `@rpg/dev-bench-core`.

Agent workflow skill → [`.cursor/skills/dev-bench/SKILL.md`](../../.cursor/skills/dev-bench/SKILL.md).
