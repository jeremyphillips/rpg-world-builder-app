/**
 * Workflows still on the legacy validation presentation path until their adoption slice.
 * Phase 7 promotes guards; delete each entry when the named milestone lands.
 */
export const FORM_VALIDATION_ADOPTION_ALLOWLIST = [
  {
    id: 'character-builder',
    removesIn: 'phase-6-character-builder',
    paths: [
      'apps/dashboard/src/features/character/lib/builder',
      'apps/dashboard/src/features/character/components/builder',
    ],
  },
  {
    id: 'character-import',
    removesIn: 'phase-6-character-import',
    paths: ['apps/dashboard/src/features/character-import'],
  },
  {
    id: 'quick-npc',
    removesIn: 'phase-6-quick-npc',
    paths: ['apps/dashboard/src/features/character/npc'],
  },
  {
    id: 'monster-statistics-presentation',
    removesIn: 'phase-6-monster-statistics',
    paths: [
      'apps/dashboard/src/features/content/monsters/components/form/statistics/statistics-panel.tsx',
    ],
  },
  {
    id: 'master-detail-presentation',
    removesIn: 'phase-6-content-master-detail',
    paths: [
      'apps/dashboard/src/features/content/lib/master-detail/master-detail-row-validation.ts',
      'apps/dashboard/src/features/content/components/master-detail/master-detail-inline-title.tsx',
    ],
  },
] as const
