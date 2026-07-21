# Vocabulary term audit

`@rpg/term-audit` finds direct uses of catalog content-type and configurable
vocabulary-set terms in TypeScript source.

Run from the repository root:

```sh
pnpm vocab:audit --content-type species
pnpm vocab:audit --term skill-proficiencies --format json
pnpm vocab:audit --vocab-set creature-types
```

Use `--term` only for an unambiguous id. Use `--content-type` or `--vocab-set`
when an id could exist in both registries. The scanner matches whole term phrases
inside literals and prose, not arbitrary substrings, so `class` does not match
`className`.

`compactLabel` is omitted by default because compact forms can be broad terms.
Pass `--include-compact` when auditing a target that defines one. Add repeated
`--ignore <glob>` arguments for an invocation-specific exclusion.

## Configuration

[`term-audit.config.ts`](./term-audit.config.ts) contains project exclusions and
approved contextual occurrences. Each contextual entry records the target,
path/pattern, reason, owner/category, and optional expiry or TODO reference.
The analyzer reports parse failures and skipped files rather than treating a
partial scan as clean.

The JSON output is stable and includes `schemaVersion: 1`, sorted variants and
usages, the report summary, skipped files, and parse failures. Exit codes are
`0` for a completed report, `2` for invalid or ambiguous targets, `3` for
configuration or parse failures, and `4` is reserved for Phase 7 usage-budget
enforcement.

## Deferred enforcement

Analyzer tests run with this package. Repository-wide literal budgets are
intentionally deferred until the Phase 7 baseline-stability spike documented in
[`docs/content-types.md`](../../../docs/content-types.md).
