# Game Terms (dashboard)

Leaf UI for **Game Library → Game Terms** — hub, set overview, term detail,
entry sheet, bulk availability, and set navigation.

Depends on [`vocabulary`](../vocabulary/README.md) for data access and the entry
form model. No other feature should import `game-terms`. Route screens are
lazy-loaded from `src/app/lazy-routes.ts`, not re-exported from this barrel.

Legacy `/homebrew/vocabulary/*` paths redirect at the app router to Game Terms.

See [vocabulary.md](../../../../docs/vocabulary.md).
