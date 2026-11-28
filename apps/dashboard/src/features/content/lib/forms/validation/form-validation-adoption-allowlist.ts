/** Deferred validation bypass paths for the enforcement scanner (family + removal milestone). */
export const FORM_VALIDATION_ADOPTION_ALLOWLIST = [
  {
    family: 'quick-npc',
    paths: [
      'apps/dashboard/src/features/character/npc/components/quick-npc/quick-npc-authoring-form.tsx',
    ],
    milestone: 'quick-npc validation adoption',
  },
] as const
