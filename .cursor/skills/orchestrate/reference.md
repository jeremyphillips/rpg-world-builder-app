# Orchestration reference

Templates, commands, and the dispatch ID. Status rules live in
[docs/agent-validation.md](../../../docs/agent-validation.md). The procedure lives
in [SKILL.md](SKILL.md).

## Dispatch ID

```text
wf-<plan-slug>-<yyyymmddThhmmssZ>-<suffix>
```

`<plan-slug>` is lowercase letters, digits, and single hyphens. Generate the
timestamp in UTC. `<suffix>` is **exactly six** lowercase hex characters (not five
or seven). The suffix is not unique and is **not** a correlation key. Workflows
and sessions correlate on the **full id** only.

Every worker prompt starts with `Dispatch: <full id>`. The checkpoint, the
model-check CLI argument, and the hook `dispatchId` must be that same full
string. The hook regex extracts the full id from the `Dispatch:` line; it does
not accept a suffix alone. A longer or shorter suffix fails the match and
produces `dispatchId: null` in `.tmp/agent-workflow/subagent-start.jsonl`.

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

After each return, select log lines for the **full** dispatch id from
`.tmp/agent-workflow/subagent-start.jsonl`. Run the model check with the hook’s
`dispatchId` value (the full id string), not a suffix alone and not a prompt
suffix that differs from the logged id when length was wrong.

Continue only when there is exactly one line and `subagent_model` is
`composer-2.5`, or a premium model the user authorized for that dispatch in
Workflow state. Zero lines, more than one line, or any other model: checkpoint,
suspend further delegation, and report. Do not launch another worker.

```bash
node tools/hooks/agent-workflow-model-check.mjs <full-dispatch-id> composer-2.5
```

Pass extra allowed model ids only when Workflow state records that authorization.
Hook `subagent_model` is not billing and does not prove that a pin cannot fall
back.

## Assignment package

The **plan checkpoint** (minimal active assignment) is authoritative before
launch. It holds only: full dispatch id, agent and kind, criterion ids, pre-tree,
attempt, and model observation. Do not duplicate removed fields there.

The block below is optional **worker prompt context** the orchestrator may append
after the `Dispatch:` line. It is not persisted in Workflow state.

```markdown
Dispatch: <full id>
Agent: implementer | verifier
Kind: implement | remediate | investigate | verify | assess | review-plan
Criterion IDs: <ids>
Attempt: <n/limit>
Pre-tree: <tree>
Protected paths: <paths and blob hashes, or none>
```

Pre-existing dirty paths and expected return are derivable from the pre-tree and
plan text on recovery, not stored in the checkpoint. The verifier `verify` kind is
`scoped` or `final`, named in the prompt.

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

Minimal active assignment, written before launch and cleared after verification:

```markdown
- Dispatch: <full id>
- Agent and kind:
- Criterion IDs:
- Pre-tree:
- Attempt: <n/limit>
- Model observation: pending
```

After return, set model observation from the hook line for that full id. Use the
hook line’s `subagent_id` only when recovery needs worker identity; do not write
it into the checkpoint before launch.

## Usage

- New work: `/orchestrate <objective>` in a Composer chat.
- Existing approved plan: `/orchestrate execute <plan>`.
- Resume: `/orchestrate resume <plan>`.
- Scoped verification is dispatched by the orchestrator. A manual whole-branch review stays `/pr-review`.
- Architectural escalation uses `verifier` kind `assess`.
- Premium models are used only with a recorded user authorization.
