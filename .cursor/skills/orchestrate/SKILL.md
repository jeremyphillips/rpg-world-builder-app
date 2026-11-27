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

Default limit per run: **12** dispatches. This is provisional until the readiness exercise measures actual usage. A plan may override the limit.

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

Probes from 2026-11-27. Unproven items stay limitations. Enforcement classes match these results: snapshot trees and the hook log are observable; `readonly` on `verifier` is not yet observed; classification, suspension, and protected paths stay instruction-only.

1. **`readonly`.** Not observed. This session's Task tool rejects `subagent_type` `verifier` and `implementer` (allowed values are the built-in types only). Do not drop `readonly`. If a read-only verifier cannot run Vitest, the orchestrator runs the named commands and passes the raw output back. Built-in `explore` is not a substitute: it created `.tmp/agent-workflow/explore-write-probe.txt` successfully. That file was removed after the probe.
2. **Instruction reads.** On the `explore` dispatch `wf-probe-20261127T155510Z-d00d11`, `AGENTS.md` was already in context through always-applied workspace rules, and `follow-agents.mdc` was inlined. Other rule files were not loaded in full until read. The worker still read `AGENTS.md` and `reference.md` by path. Inheritance is informational. Custom-agent reads are not yet observed.
3. **Snapshot.** Two runs with no content change returned `44e8c5e9de40742afe540a4c23764efc81816cd5`. Editing an already-dirty tracked file changed the tree. Adding a non-ignored untracked file changed it. Appending to a `.cursor/plans` file did not. The real index checksum was unchanged across a copy-index `git add` and `git write-tree`. The temporary index was removed on success. `git add` with `GIT_INDEX_FILE` set to a missing directory exited 128 with empty tree output, and the copy was removed by `trap`. `git cat-file -e deadbeefdeadbeefdeadbeefdeadbeefdeadbeef^{tree}` exited 128, so evidence tied to a missing tree is `unverified`.
4. **Hook integration.** The hook appended one line for `explore` with `subagent_model` `composer-2.5` and dispatch `wf-probe-20261127T155510Z-d00d11`. Resuming that completed agent with dispatch `wf-probe-20261127T155520Z-ee11aa` appended a second line for the new id. Resume of a completed worker is observable, so it is allowed only with a new dispatch ID and a passing model check. Custom agents did not launch, so the hook is not yet observed for them. `explore` with no model parameter was not run: this parent is not Composer, and omitting `model` would inherit a non-default model.
5. **Synthetic unauthorized observation.** Against a controlled log, one unauthorized model, two lines for one dispatch, and zero lines all failed the model check (`ok: false`). Those results checkpoint and suspend delegation. No live non-default model was launched. Real fallback detection is **not proven**.
6. **Worker termination.** Not observed. Until the user stops a foreground implementer and a later resume shows whether a running agent is refused, user confirmation is required before a write dispatch onto an open assignment.
7. **Task card.** Not confirmed. The user must confirm that the card matches the hook-reported model. Resolved or billed identity is not visible to the agent.

Detection happens after launch, so consumption that already occurred cannot be prevented. `subagent_model` is the hook-reported model. Pins can fall back, and the parent can name another model.
