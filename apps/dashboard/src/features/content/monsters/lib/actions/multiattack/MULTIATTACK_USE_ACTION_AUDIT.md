# Multiattack use-action model audit (Phase 2)

Records SRD-backed semantics for **Use an action** combinations and the clause-ownership decision that gates UI and schema work. Formatter defects are tracked in §8.11 of the cleanup plan, not here.

## Clause ownership — variant A (retain)

Keep `count` and `optional` on **single** use steps only. Choice mode remains a flat OR list without clause-level modifiers until SRD evidence requires shared modifiers (variant B).

UI follows **mutual exclusion** (§8.8): hide **Add action choice** while repetition is active (`count` > 1 or invalid) or while **Optional** is checked. Conversion guards stay strict; no schema widening in Phase 2.

## Audit matrix (§8.5)

| Configuration                     | SRD example                                       | Schema                   | Ambiguity        | Recommendation                       |
| --------------------------------- | ------------------------------------------------- | ------------------------ | ---------------- | ------------------------------------ |
| Single action                     | Most beasts (e.g. Wolf bite + claws)              | Supported                | None             | Retain                               |
| Repeated single action            | Hell Hound Fire Breath twice via count            | Supported                | None             | Retain                               |
| Optional single action            | Roper Extrude / Retract “can use”                 | Supported                | None             | Retain                               |
| OR-choice action                  | Marilith sword **or** tail (separate steps today) | Supported as choice step | None             | Retain                               |
| Optional OR choice                | Rare; often separate optional use step            | Unsupported on choice    | “Can” on OR list | **Defer** — use optional single step |
| Repeated OR (choose once, repeat) | Not observed in SRD 5.2 multiattack prose         | Unsupported              | Choice scope     | **Defer** — mutual exclusion         |
| Choice per repetition             | Not observed                                      | Unsupported              | Per-use vs once  | **Defer**                            |
| Optional repeated choice          | Not observed                                      | Unsupported              | Combined         | **Defer**                            |

## Repetition with choices (§8.3)

SRD multiattack rarely stacks “choose A or B” with “N times” on the same clause; repetition applies to named actions (Hell Hound breath) or attack groups. The formatter treats choice mode without `count`. **Recommendation:** keep mutual exclusion; do not imply “repeat the OR” without new semantics.

## Optional with choices (§8.4)

Optional appears on **Can use {action}** single clauses (Roper, Vampire Grapple follow-ups in pattern fixtures). OR-choice steps are required picks in SRD text (“uses X or Y”), not skippable branches. **Recommendation:** optional does not apply to choice mode; block/hide acquisition separately from repetition.

## Evidence sources

- Contract pattern fixtures: `packages/contracts/src/rpg/runtime/monster/multiattack-pattern-fixtures.data.ts`
- Published multiattack shapes in catalog seeds (attack groups, use single, use choice, use optional)
- Open5e `srd-2024` spot checks: Behir, Marilith, Vampire, Roper, Rust Monster, Aboleth, Glabrezu, Kraken, Erinyes, Dryad, Doppelganger, Planetar — none require optional+choice or repeated+choice on one use clause.

## Deferred contract work

No changes to `multiattack-schemas.ts`, refinements, or `formatMonsterMultiattack` for unsupported combinations in Phase 2. Revisit variant B only if new SRD entries require clause-level `optional` or `count` on choice steps with unambiguous formatter prose.
