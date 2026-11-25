/**
 * Workflows still on the legacy validation presentation path after Phase 6.
 * Phase 7 promotes guards; delete each entry when the named milestone lands.
 */
export const FORM_VALIDATION_ADOPTION_ALLOWLIST = [
  {
    id: 'character-builder',
    removesIn: 'phase-7-character-builder',
    paths: [
      'apps/dashboard/src/features/character/lib/builder',
      'apps/dashboard/src/features/character/components/builder',
    ],
  },
  {
    id: 'character-import',
    removesIn: 'phase-7-character-import',
    paths: ['apps/dashboard/src/features/character-import'],
  },
  {
    id: 'quick-npc',
    removesIn: 'phase-7-quick-npc',
    paths: ['apps/dashboard/src/features/character/npc'],
  },
] as const
