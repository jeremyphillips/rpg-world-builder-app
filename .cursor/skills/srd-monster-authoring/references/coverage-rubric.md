# Coverage rubric

Three separate judgments. Do not fold them into one percentage.

## Capability

| Class | Meaning |
| --- | --- |
| Resolved | The existing resolver or formatter produces the rule |
| Structured | Contracts can store it, and runtime does not fully produce it |
| Descriptive | Faithful prose in an existing field |
| Unsupported | Cannot be represented faithfully yet |
| Uncertain | The representation cannot be checked |
| Not applicable | The source has no such feature. Omit from the score |

A missing test does not move Resolved to Structured.

## Verification

| Status | Meaning |
| --- | --- |
| Verified | A test asserts this feature against an independent SRD literal |
| Unverified | The model is expected to produce it, and this monster has no such assertion |
| Mismatch | A test compared it with an SRD literal and it was wrong |

Phase A and `review` mark the fraction **estimated**. An approved authoring pass marks **tested** only the features whose verification is verified. The fraction still includes unverified features at their capability credit.

## Weights and credits

Essential weight 3: AC, HP and hit-dice formula, ability scores, primary attack bonus and damage, spell DC and spell attack when the creature casts, placement of primary features.

Standard weight 2: saves, skills, movement, senses, defenses, reach and range, limits on primary features.

Supporting weight 1: languages, alignment, table XP, narrative traits.

Name signature mechanics and raise them to essential when the lists above would score them lower. Do not count a feature twice.

Credits: resolved 1, structured 0.6, descriptive 0.35, unsupported 0. Uncertain and not applicable leave the denominator.

Score is `weighted credit / weighted applicable weight`. Report it as a fraction with one decimal, the denominator's features, the signature list, parity exceptions, and the three verification counts. Verification, source confidence, and estimated versus tested are not terms in the fraction.

## Signature mechanics

Examples: breath and recharge, grapple or restraint, paralysis, reactions, transformation, regeneration, spellcasting, special movement or targeting, conditional attack riders.

For each, record SRD importance, structured representation, runtime support, description fallback, and shared-model applicability. Judge that against what this app resolves. There is no encounter resolver. Tactical advantage and other DM-adjudicated rules may stay descriptive without being treated as missing automation.

An unsupported signature blocks Mechanically ready. It does not block approved Text-supported authoring. A signature left only in prose also blocks Mechanically ready when a resolver already owns that calculation.

## Source confidence

Ordinal, outside the score: **high**, **medium**, **low**, **blocked**.

High requires a complete source and one supported derivation. Several plausible derivations lower confidence even when one matches. A numeric match from an unsupported configuration is not high. Blocked means the source is incomplete or uncertain, or derivations conflict with no SRD convention to choose.

## Readiness

Separate from the review disposition in [assessment-report.md](assessment-report.md).

- **Mechanically ready.** Fidelity Pass, derived parity Pass, no unsupported signature, and no signature left in prose when a resolver already owns it.
- **Text-supported.** Eligible to seed. Resolver-owned numbers match, or each exception is an approved "the model cannot express this" record. Remaining essential mechanics are descriptive or unsupported and registered. The report does not claim full resolution.
- **Needs reconciliation.** Incomplete or uncertain source, or conflicting derivations.

## Fidelity and parity

**Fidelity** is Pass only when every applicable feature is inventoried, has a destination, and appears in the rendered stat block, or is an explicit approved exception. A numeric pass with an omitted feature is Fail.

**Derived parity** is Pass only when every resolver-owned value matches an independent SRD literal and the exception list is empty. Prose and unexplained offsets do not convert a mismatch into a pass. A value the resolver cannot produce is an exception: gap id, prose fallback, and incomplete structural parity.
