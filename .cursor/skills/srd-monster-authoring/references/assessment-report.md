# Assessment report

Chat deliverable for `assess`, `review`, and the read-only half of `author`. Do not commit this report. `assess` and `review` do not write the gap registry. Proposed gap ids stay here until an approved authoring or implementation pass.

## A. Source identity

- Monster name, SRD edition, Open5e key, `document.key`.
- Retrieval completeness. Name any stat-block section the payload did not cover.
- Local catalog status: absent, or `srd-cc-5.2.1:{slug}` plus citation and excerpt ids.

## B. Stat derivation

For AC, HP and hit-dice formula, proficiency, saves, skills, attacks, damage, spell DC and spell attack, defenses, and movement: source value, stored input when a seed exists, resolver name, and independent expected result. Record inferred proficiency, governing ability, natural armor, and exceptional adjustments with their inputs. A matching total is not a justification.

## C. Source-feature inventory

One row per applicable feature, not per sentence. Cover identity and statistics, defenses, traits, actions, bonus actions, reactions, legendary and other exceptional sections, attack riders, save outcomes, conditions, spellcasting and spell lists, usage and recharge, and any other rule that changes play. Mark inapplicable sections, including legendary actions when the source has none.

Each row:

- Source evidence: Open5e detail, excerpt cross-check, or inference.
- Structured field or description destination.
- Rendered section, or omitted.
- Capability and verification, from [coverage-rubric.md](coverage-rubric.md).
- Gap id, or none.

## D. Proposed representation

For each feature that would be authored or changed: contract field, shared resolver, equipment or spell reference, expected runtime outcome, and description fallback if needed.

## E. Coverage

- Estimated or tested fraction, the features in the denominator, and signature mechanics.
- Counts of resolved, structured, descriptive, unsupported, and uncertain.
- Verification counts: verified, unverified, mismatch.
- Fidelity: Pass / Fail / Not yet verified.
- Derived parity: Pass / Fail / Not yet verified. List exceptions. Do not report full parity while any exception remains.
- Readiness for an unseeded monster: Mechanically ready, Text-supported, or Needs reconciliation.

## F. Modeling concerns

For each meaningful gap: existing capability, why it is insufficient, smallest shared extension, other monsters, character applicability, authoring UX, and recommendation. Link an existing registry id or propose one. Follow [model-extension.md](model-extension.md). Do not propose an extension when a current shared mechanic already supports the behavior.

## G. Related SRD candidates

A short unseeded set. For each: why it is similar, which mechanics it reuses, estimated completeness, known gaps, and what authoring it would verify. Group as high-confidence, shared-mechanic cohort, extension candidate, or text-supported. Do not seed them.

## H. Required decisions

- Can authoring proceed without a model change?
- Is descriptive fallback recommended?
- Is a shared extension worth investigating?
- Which of A, B, and C need approval?

## Review

Include this section for `review`. A seed that validates can still be mechanically incomplete. Use the same rubric and inventory as above.

- Seed id, slug, provenance, excerpt ids.
- Inventory mapped to the stored representation.
- Expected SRD value, stored input, and resolved output.
- Equipment and action ownership against the skill's decision order.
- Spellcasting rows and the spell-resolution status of referenced spells.
- Confirmed discrepancies. For each: category, owner, severity, confirmed or uncertain.

Categories:

- Source discrepancy or incomplete extraction. Owner: Open5e retrieval. Not a schema defect.
- Missing or incorrect seed content. Owner: the seed. Waits for `author`.
- Incorrect mechanical derivation. Owner: the seed's inputs, or the shared resolver if the inputs are right and the output is wrong.
- Shared resolver defect. Owner: `runtime/creature/` or `runtime/monster/`. Separate implementation approval.
- Missing structured capability. Owner: the gap registry. Proposal only.
- Missing runtime execution. Owner: the gap registry. Proposal only.
- Stat-block presentation defect. Owner: the named formatter.
- Descriptive-only mechanic. Owner: the prose field. Not a defect when that is the faithful representation.
- Missing regression coverage. Owner: the existing test. Review does not add it.
- Potential modeling improvement. Owner: [model-extension.md](model-extension.md). Recommend it only for fidelity, correctness, maintainability, or shared coverage.

Also record descriptive and unsupported mechanics, existing gap ids, proposed ids, and modernization notes (benefit, regression, other monsters, character applicability, UX cost). "No change" is a valid recommendation.

Disposition, separate from the score:

- **Verified** for a named scope. Do not call the whole monster verified when only some fields were tested.
- **Corrections recommended.** The current model can represent the SRD. The seed or presentation should change.
- **Text-supported.** The SRD rule is preserved. Mechanical gaps stay documented.
- **Needs reconciliation.** Source uncertainty, conflicting derivations, or an unresolved discrepancy block the review.
