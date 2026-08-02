# Vocabulary (dashboard)

Campaign vocabulary **consumption** — API clients, TanStack Query hooks, per-set
option maps, field factories, labels, and the reusable entry form model.

Game Terms authoring UI lives in [`game-terms`](../game-terms/README.md). Import
this feature from `@/features/vocabulary` (or `sets.ts` / `fields.ts` entry
points); do not import `game-terms` for labels or option hooks.

Ruleset patch hooks remain in [`homebrew`](../homebrew) — unrelated to this
feature. See [vocabulary.md](../../../../docs/vocabulary.md).
