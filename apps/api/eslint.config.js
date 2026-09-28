import { buildingArchetypeAppQuarantine } from '@rpg/config/eslint/building-archetype-quarantine'
import base from '@rpg/config/eslint/base'

/** Content-usage indexers sit on a feature cycle if wired only through barrels (content ↔ character-relationships). */
const contentUsageCrossFeatureBoundaryFiles = [
  'src/features/content/lib/content-usage/content-usage-sources.ts',
  'src/features/content/lib/content-usage/resolve-viewer-character-relationships.ts',
  'src/features/character-relationships/lib/content-usage/character-relationship-usage.ts',
]

export default [
  ...base,
  buildingArchetypeAppQuarantine,
  {
    files: contentUsageCrossFeatureBoundaryFiles,
    rules: {
      'boundaries/dependencies': 'off',
    },
  },
]
