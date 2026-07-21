import type { TermAuditConfig } from './src/types'

export const VOCAB_TERM_AUDIT_CONFIG = {
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/generated/**',
    '**/*.json',
    '**/*.snap',
  ],
  contextual: [
    {
      target: 'content-type:classes',
      path: 'packages/contracts/src/rpg/content/lib/content-type-terms.ts',
      reason: 'Canonical catalog content-type term registry',
      owner: 'contracts',
    },
    {
      target: 'content-type:classes',
      path: 'packages/contracts/src/rpg/vocab/**/*.ts',
      reason: 'Field taxonomy and game-rule vocabulary, not catalog chrome',
      owner: 'contracts',
    },
    {
      target: 'content-type:classes',
      path: 'packages/contracts/src/rpg/runtime/**/*.ts',
      reason: 'Runtime workflow copy deferred to Phase 5',
      owner: 'contracts',
    },
    {
      target: 'content-type:classes',
      path: 'packages/ui/src/components/ui/rich-text-link-picker.client.tsx',
      reason: 'Storybook defaults; dashboard passes term-derived options',
      owner: 'ui',
    },
    {
      target: 'content-type:spells',
      path: 'packages/contracts/src/rpg/content/lib/content-type-terms.ts',
      reason: 'Canonical catalog content-type term registry',
      owner: 'contracts',
    },
    {
      target: 'content-type:spells',
      path: 'packages/contracts/src/rpg/vocab/spell/**/*.ts',
      reason: 'Spell field taxonomy and resolution vocabulary, not catalog chrome',
      owner: 'contracts',
    },
    {
      target: 'content-type:spells',
      path: 'packages/contracts/src/rpg/content/spell/**/*.ts',
      reason: 'Spell resolution and effect vocabulary, not catalog chrome',
      owner: 'contracts',
    },
    {
      target: 'content-type:spells',
      path: 'packages/contracts/src/rpg/runtime/**/*.ts',
      reason: 'Runtime workflow copy deferred to Phase 5',
      owner: 'contracts',
    },
    {
      target: 'content-type:spells',
      path: 'packages/ui/src/components/ui/rich-text-link-picker.client.tsx',
      reason: 'Storybook defaults; dashboard passes term-derived options',
      owner: 'ui',
    },
    {
      target: 'content-type:feats',
      path: 'packages/contracts/src/rpg/content/lib/content-type-terms.ts',
      reason: 'Canonical catalog content-type term registry',
      owner: 'contracts',
    },
    {
      target: 'content-type:feats',
      path: 'packages/contracts/src/rpg/vocab/feat.ts',
      reason: 'Feat field taxonomy vocabulary, not catalog chrome',
      owner: 'contracts',
    },
    {
      target: 'content-type:feats',
      path: 'packages/contracts/src/rpg/runtime/**/*.ts',
      reason: 'Runtime workflow copy deferred to Phase 5',
      owner: 'contracts',
    },
    {
      target: 'content-type:feats',
      path: 'packages/ui/src/components/ui/rich-text-link-picker.client.tsx',
      reason: 'Storybook defaults; dashboard passes term-derived options',
      owner: 'ui',
    },
    {
      target: 'content-type:equipment',
      path: 'packages/contracts/src/rpg/content/lib/content-type-terms.ts',
      reason: 'Canonical catalog content-type term registry',
      owner: 'contracts',
    },
    {
      target: 'content-type:equipment',
      path: 'packages/contracts/src/rpg/vocab/equipment/**/*.ts',
      reason: 'Equipment family/kind/category vocabulary, not parent catalog chrome',
      owner: 'contracts',
    },
    {
      target: 'content-type:equipment',
      path: 'packages/contracts/src/rpg/runtime/**/*.ts',
      reason: 'Runtime workflow copy deferred to Phase 5',
      owner: 'contracts',
    },
    {
      target: 'content-type:equipment',
      path: 'apps/dashboard/src/features/content/equipment/lib/shared/equipment-family-paths.ts',
      reason: 'Equipment family labels; parent equipment term does not substitute here',
      owner: 'dashboard',
    },
    {
      target: 'content-type:equipment',
      path: 'apps/dashboard/src/features/content/equipment/hooks/use-equipment-family-overview.ts',
      reason: 'Family-scoped create labels derived from family headings',
      owner: 'dashboard',
    },
    {
      target: 'vocab-set:creature-types',
      path: 'packages/contracts/src/rpg/vocab/creature-type.ts',
      reason: 'Vocabulary option-set registry, not a direct term audit target surface',
      owner: 'contracts',
    },
  ],
} as const satisfies TermAuditConfig
