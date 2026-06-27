import type { FieldOption, FormItem } from '@rpg/ui/form'

import {
  buildActiveCreatureTypeFieldOptions,
  buildSeedCreatureTypeVocabulary,
} from '@/features/homebrew'

import {
  buildRulesConfigLayoutFields,
  buildRulesFieldsForSurface,
  buildRulesSchemaForSurface,
} from './character-configuration-field-registry'

const defaultCreatureTypeOptions = buildActiveCreatureTypeFieldOptions(
  buildSeedCreatureTypeVocabulary(),
)

export {
  CREATE_WIZARD_RULE_FIELD_IDS,
  buildRulesFieldsForSurface,
  buildRulesReviewRowsForSurface,
  buildRulesSchemaForSurface,
  type CharacterRuleSurface,
  type CreateRulesValues,
  type CreateWizardRuleFieldId,
  type RulesReviewRow,
  type RulesValues,
} from './character-configuration-field-registry'

export const createRulesSchema = buildRulesSchemaForSurface('create')
export const rulesSchema = buildRulesSchemaForSurface('config')

export const createRulesFields = buildRulesFieldsForSurface('create', defaultCreatureTypeOptions)

export function resolveRulesSchema(activeCreatureTypeIds?: ReadonlySet<string>) {
  if (!activeCreatureTypeIds) return rulesSchema

  return rulesSchema.superRefine((values, ctx) => {
    for (const id of values.allowedCharacterCreatureTypes) {
      if (!activeCreatureTypeIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Creature type is not available in this campaign vocabulary',
          path: ['allowedCharacterCreatureTypes'],
        })
      }
    }
  })
}

/** Rules fields for Homebrew Rules Configuration — flat sections with in-page anchor targets. */
export function buildRulesConfigFields(creatureTypeOptions: FieldOption[]): FormItem[] {
  return buildRulesConfigLayoutFields(creatureTypeOptions)
}
