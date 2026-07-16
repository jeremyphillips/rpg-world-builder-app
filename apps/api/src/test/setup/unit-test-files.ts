/** Pure lib tests — no Mongo; run in the parallel `api:unit` Vitest project. */
export const unitTestFiles = [
  'src/env.test.ts',
  'src/features/character-import/dnd-beyond-acquisition.service.test.ts',
  'src/features/content/lib/deep-merge.test.ts',
  'src/features/content/lib/resolve-catalog.test.ts',
  'src/features/content/lib/apply-content-keys.test.ts',
  'src/features/content/lib/assert-slug-available.test.ts',
  'src/features/content/species/assert-species-class-slugs.test.ts',
  'src/features/content/spells/assert-spell-class-ids.test.ts',
  'src/features/content/spells/spell-effects-persistence.test.ts',
  'src/features/dev-bench/bench-query.test.ts',
  'src/features/vocabulary/lib/collect-content-vocabulary-ids.test.ts',
  'src/features/vocabulary/lib/resolve-vocabulary.test.ts',
  'src/features/vocabulary/lib/assert-vocabulary-id-available.test.ts',
] as const
