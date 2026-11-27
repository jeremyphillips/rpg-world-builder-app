# Orchestration reference

Templates, commands, and the dispatch ID. Status rules live in
[docs/agent-validation.md](../../../docs/agent-validation.md). The procedure lives
in [SKILL.md](SKILL.md).

## Dispatch ID

```text
wf-<plan-slug>-<yyyymmddThhmmssZ>-<6 lowercase hex>
```

`<plan-slug>` is lowercase letters, digits, and single hyphens. Generate the
timestamp in UTC and six random hex characters. Every worker prompt starts with
`Dispatch: <id>`. The id is unique across workflows and sessions.

## Snapshot

Run from the repository root. The real index is never written. `.cursor/` is
gitignored, so plan edits do not change the tree.

```bash
index=$(git rev-parse --git-path index)
copy=".tmp/agent-workflow/index.${RANDOM}${RANDOM}"
mkdir -p .tmp/agent-workflow
cp "$index" "$copy"
trap 'rm -f "$copy"' EXIT
if ! GIT_INDEX_FILE="$copy" git add -A; then
  exit 1
fi
GIT_INDEX_FILE="$copy" git write-tree
```

A non-zero exit or empty stdout means the snapshot is unavailable. Do not record
`verified` against it.

Confirm a historical tree with `git cat-file -e <tree>^{tree}`. A missing object
makes evidence tied to that tree `unverified`.

Implementation diff scope:

```bash
git diff --name-only <pre-tree> <post-tree>
```

Staleness:

```bash
git diff --name-only <evidence-tree> <current-tree> -- <dependency paths>
```

A non-empty result sets the criterion to `unverified`.

Protected-work check: `git hash-object <path>` for each recorded blob, and
`git diff --name-only <baseline-tree> <current-tree> -- <protected paths>`.
A hash mismatch or a non-empty diff stops the checkpoint.

## Model check

After each return, select log lines for that dispatch ID from
`.tmp/agent-workflow/subagent-start.jsonl`.

Continue only when there is exactly one line and `subagent_model` is
`composer-2.5`, or a premium model the user authorized for that dispatch in
Workflow state. Zero lines, more than one line, or any other model: checkpoint,
suspend further delegation, and report. Do not launch another worker.

```bash
node --input-type=module -e '
const fs = await import("node:fs");
const id = process.argv[1];
const allowed = new Set(process.argv.slice(2));
const path = ".tmp/agent-workflow/subagent-start.jsonl";
const lines = fs.existsSync(path)
  ? fs.readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line)).filter((row) => row.dispatchId === id)
  : [];
const ok = lines.length === 1 && allowed.has(lines[0].subagent_model);
console.log(JSON.stringify({ count: lines.length, model: lines[0]?.subagent_model ?? null, ok }));
process.exit(ok ? 0 : 2);
' <dispatch-id> composer-2.5
```

Pass extra allowed model ids only when Workflow state records that authorization.

## Assignment package

```markdown
Dispatch: <id>
Agent: implementer | verifier
Kind: implement | remediate | investigate | verify | assess | review-plan
Criterion IDs: <ids>
Attempt: <n/limit>
Pre-tree: <tree>
Pre-existing dirty paths: <paths or none>
Protected paths: <paths and blob hashes, or none>
Expected return: <what the parent needs>
```

The verifier `verify` kind is `scoped` or `final`, named in the prompt.

## Handoff

```markdown
Dispatch: <id>
Kind: <kind>
Criterion outcomes: <id: outcome>
Execution results: <command, passed | failed | errored | not run, counts, tree>
Diff scope: <paths>
Dependency scope: <paths and confidence>
Findings: <or none>
Model observation: <filled by the orchestrator after return>
```

## Workflow state

Place this section in the plan. It is the only workflow record.

```markdown
## Workflow state

- Classification:
- Active stopping boundary:
- Authority order:
- Retry limit:
- Remediation counters:
- Run dispatch limit:
- Dispatches used:
- Premium authorizations:
- Workflow base tree:
- Protected paths and hashes:
- Active assignment: none
- Open findings:
- Decisions and waivers:
- Slice log:
```

Active assignment, written before launch and cleared after verification:

```markdown
- Dispatch: <id>
- subagent_id:
- Agent and kind:
- Criterion IDs:
- Attempt: <n/limit>
- Pre-tree:
- Pre-existing dirty paths:
- Expected return:
- Started:
```

## Usage

- New work: `/orchestrate <objective>` in a Composer chat.
- Existing approved plan: `/orchestrate execute <plan>`.
- Resume: `/orchestrate resume <plan>`.
- Scoped verification is dispatched by the orchestrator. A manual whole-branch review stays `/pr-review`.
- Architectural escalation uses `verifier` kind `assess`.
- Premium models are used only with a recorded user authorization.
