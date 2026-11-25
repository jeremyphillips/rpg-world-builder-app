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
    id: 'campaign-settings-submit',
    removesIn: 'phase-6-campaign-settings',
    paths: ['apps/dashboard/src/features/campaign/routes/campaign-settings.tsx'],
  },
] as const
