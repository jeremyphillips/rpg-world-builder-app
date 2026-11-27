---
name: orchestrate
description: >-
  Run the multi-agent development workflow. The primary chat classifies the
  work, snapshots the tree, and delegates to the implementer and verifier.
  Direct, localized edits do not use this skill.
disable-model-invocation: true
---

# Orchestrate

The primary chat is the orchestrator. It owns requirements, classification,
slice selection, snapshots, checkpoints, plan edits, counters, model checks,
escalation, and reporting. Workers do not edit plan status.

Status, invalidation, gates, and evidence rules:
[docs/agent-validation.md](../../../docs/agent-validation.md). Review method:
[.cursor/skills/pr-review/SKILL.md](../pr-review/SKILL.md). Templates and
commands: [reference.md](reference.md).

In Standard and Architectural work the orchestrator does not do substantial
implementation.

## Classification

- **Direct.** Localized, no shared contract or package change, low risk. Do not load this skill and do not delegate.
- **Standard.** A bounded behavior change with regression risk. Put criterion IDs in a plan, then run the loop. Final verification applies when there are two or more slices.
- **Architectural, new.** Investigate, assess where needed, synthesize the plan, review the plan in a fresh context (at most two rounds), resolve material findings or escalate them, get user approval, then execute. Final verification is mandatory.
- **Existing approved plan.** Do not re-plan. Reconcile recorded status against the current snapshot, then execute. Assess and escalate only when a material discovery invalidates the approved direction. Do not reinterpret criteria.

## Loop

1. Snapshot. Read Workflow state. Recover an open assignment. Sweep staleness.
2. Choose the next stopping outcome, in this order:
   1. **Run limit reached.** Checkpoint and return an incomplete handoff. Do not dispatch final verification without budget.
   2. **Eligible work remains and the budget allows it.** Start a slice only when at least 3 dispatches remain.
   3. **Every mandatory criterion in the active boundary is `verified`, approved `deferred`, or waived.** Dispatch verifier `final` for that boundary. A pass on the whole plan is plan complete. A pass on a narrower boundary is checkpoint complete.
   4. **No eligible work remains because criteria are unresolved.** Report them. This is an incomplete handoff.
3. Before a launch, persist the dispatch counter and the active assignment.
4. Verifier `investigate`. If the criterion is already satisfied, record that and return to step 2.
5. Implementer for a gap. Then verifier `verify` scoped to the diff plus traced consumers, using the relevant `pr-review` lenses.
6. On `verified`, persist the outcome, execution result, evidence tree, and dependency scope. Clear the active assignment.
7. On `failed` or `partial`, follow remediation. Then return to step 2.

Do not pause between approved slices.

## Dispatch accounting

Every launch consumes one dispatch, including interrupted, failed, unsuccessful, and verifier launches. Persist the counter before launch. Do not refund a dispatch.

Default limit per run: **12** dispatches (Phase 3 readiness exercise: Session A **7**, Session C **5**; peak single session **7** with slice limit + remediation—keep **12** for headroom). A plan may override the limit.

## Remediation

Count attempts per criterion. Start a new counter only when the verifier classifies a deficiency as unrelated to every prior one and the orchestrator records why. When unsure, it is the same deficiency. Counters survive rewording, reassignment, new finding IDs, assessment, and context resets. Only a recorded user decision resets them.

Normal limit: 2.

- An interrupted initial implementation may be re-dispatched once without consuming a remediation attempt.
- An interrupted remediation consumes its attempt.
- A second interruption of the same assignment pauses it and is reported.

Exhaustion triggers: the limit is reached; the same deficiency is unchanged across two verifications; or another conditional, adapter, wrapper, or fallback was added for the same deficiency.

Then dispatch verifier `investigate` for root cause. One extra attempt is allowed only when that investigation names a materially different, evidence-backed approach. Otherwise dispatch `assess`. Assessment never grants attempts. A sound approach becomes progress `exhausted`. A flawed approach becomes `awaiting decision`, and the criterion outcome becomes `blocked` on that decision.

Then checkpoint, set the outcome from the latest evidence, report, and continue independent eligible work. A final-verification failure uses the same counters.

## Checkpoints and recovery

Workflow state in the plan is the only record. Field list and templates are in [reference.md](reference.md).

Write the active assignment before launch. After return, record the model observation, handoff summary, post-tree, and diff scope. After verification, record outcomes and clear the active assignment.

Recovery of an open assignment:

1. Reconcile the model observation for its dispatch ID before any further delegation.
2. Establish that the worker has stopped. Absence of source changes is not evidence. Use the native signal recorded under Native limitations. If termination cannot be established, require user confirmation before any write dispatch. Never run two implementers in the shared checkout.
3. Snapshot, diff against the pre-tree, and dispatch verifier `investigate` for any changes. Preserve partial implementation. Do not revert it. Changes outside the expected scope go to the user before they are attributed.
4. Resume implementation, verification, or remediation. Re-dispatch an interrupted verifier. Do not redo completed evidence that is not stale.

## Model policy

Composer everywhere. Subagents are pinned to `composer-2.5`. Premium use needs an explicit user authorization, recorded per dispatch in Workflow state and passed as the Task `model`. This file is the only place that authorization policy is stated.

Dispatch ID format and the post-return model check are in [reference.md](reference.md). Zero lines, multiple lines, or an unauthorized model: checkpoint and suspend all further delegation.

The `subagentStart` hook (`.cursor/hooks.json` → `tools/hooks/cursor-subagent-start-log.mjs`) only observes. It always allows the launch.

## Human approval

Pause for material architecture, product decisions, scope expansion, conflicting authorities, waivers and deferrals, premium use, destructive operations, an `awaiting decision` result, an unauthorized or unverified model observation, unconfirmable worker termination, out-of-scope changes found during recovery, protected-work hash mismatches, and the stopping boundary.

Git hooks run only at a commit or push the user requests. There is no auto-commit, push, or merge. The Cursor `subagentStart` hook is not a Git hook.

## Enforcement

- **Native:** `readonly`, the frontmatter model pin (subject to fallback), one nesting level, the Task refusal to resume a running agent, and account spend limits.
- **Observable:** hook-reported model and IDs, snapshot trees, blob hashes, timestamps. Task cards and the usage dashboard are visible only to the user.
- **Instruction-only:** classification, gates, invalidation, remediation and dispatch limits, stopping outcomes, premium authorization, suspension on a bad observation, the protected-path rule, and no auto-commit.

## Native limitations

Recorded 2026-11-27 after Phase 2 probes. Unproven items stay limitations below. **Enforcement classes:** snapshot trees, hook log lines, blob hashes, and Task resume refusal for a still-running worker are **observable**. Custom-agent `readonly` runs in Ask mode (blocks Shell and Write). Model pins are **native** subject to fallback. Classification, gates, suspension policy, protected paths, and no auto-commit stay **instruction-only**.

| Probe | Result | Fallback |
| ----- | ------ | -------- |
| 1 Readonly verifier | Custom `verifier` launches with `subagent_model` `composer-2.5`. Dispatch runs in **Ask mode**: Read works; Shell (including Vitest) and Write are refused with the same message. Native `readonly: true` is not separately observable from Ask mode. | Orchestrator runs verifier-named Vitest commands and passes raw output. Do not drop `readonly` without user approval. Do not use `explore` as verifier — it can write. |
| 2 Instruction reads | `AGENTS.md` is often pre-injected via workspace rules. `agent-validation.md`, `pr-review`, and `reference.md` were read fresh on custom-agent dispatches. Mandatory read-by-path remains required. | Record inheritance for information only. |
| 3 Snapshot | Identical trees on repeat (`8a9a08ba870cfe5a45db0fff4fa91dbdab67a170` after Phase 2 commit). Dirty/untracked non-ignored files change the tree; `.cursor/plans` edits do not. Real index unchanged. Temp index removed on success and on forced failure. Fabricated tree fails `git cat-file -e`. | Snapshot unavailable → outcomes `unverified`, checkpoint. |
| 4 Hook integration | One JSONL line per Task launch when the hook fires. When the hook `task` field includes `Dispatch: wf-…`, `dispatchId` correlates one-to-one. Some custom-agent launches log `dispatchId: null` (hook `task` omitted the dispatch line); treat that as a failed model observation and checkpoint. `subagent_model` is `composer-2.5` when the parent passes `model: composer-2.5`. Completed-agent resume appends a **new** line. | Resume only with a new dispatch ID and a correlated hook line. If `dispatchId` is null, suspend until the payload is understood or the user authorizes proceeding without hook correlation. |
| 5 Synthetic unauthorized | Controlled log: wrong model, duplicate lines, or zero lines → model check `ok: false` → checkpoint and suspend delegation (demonstrated in orchestrator session). | No live non-default model without user authorization. Real pin **fallback** detection is **not proven**. |
| 6 Worker termination | **Resume while running:** Task refuses with “Sub-agent is currently running” (native). **Interrupt:** `interrupt: true` on resume stopped a background implementer shell loop within ~2s; log growth ceased. Foreground **Stop** in the parent UI was not exercised in this probe. | If termination is unconfirmed after foreground Stop, require user confirmation before a write dispatch on an open assignment. |
| 7 Task card | Hook logs `composer-2.5` for pinned dispatches. The agent cannot read the UI card; the user re-checked during probe `wf-probe-20261127T170050Z-card01` and did not see an explicit Composer label. | At Phase 3, the user confirms card vs hook once per session, or records a mismatch and suspends delegation. |

Hook unit tests: `pnpm exec vitest run --config tools/hooks/vitest.config.ts tools/hooks/cursor-subagent-start-log.test.mjs` (7 passed).

Detection happens after launch, so consumption that already occurred cannot be prevented. `subagent_model` is the hook-reported model. Pins can fall back, and the parent can name another model.
