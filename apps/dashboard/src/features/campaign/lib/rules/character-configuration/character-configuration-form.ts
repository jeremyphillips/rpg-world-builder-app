import type { FieldOption, FormItem } from '@rpg/ui/form'

import {
  buildActiveCreatureTypeFieldOptions,
  buildSeedCreatureTypeVocabulary,
} from '@/features/homebrew'

import {
  buildRulesConfigLayoutFields,
  buildRulesFieldsForSurface,
  buildRulesSchemaForSurface,
  characterConfigurationValidationMessages,
} from './character-configuration-form-fields'

const defaultCreatureTypeOptions = buildActiveCreatureTypeFieldOptions(
  buildSeedCreatureTypeVocabulary(),
)

export {
  CHARACTER_CONFIGURATION_SECTIONS,
  CREATE_WIZARD_RULE_FIELD_IDS,
  buildRulesConfigLayoutFields,
  buildRulesFieldsForSurface,
  buildRulesReviewRowsForSurface,
  buildRulesSchemaForSurface,
  characterConfigurationValidationMessages,
  type CharacterConfigurationSectionId,
  type CharacterRuleSurface,
  type CreateRulesValues,
  type CreateWizardRuleFieldId,
  type RulesReviewRow,
  type RulesValues,
} from './character-configuration-form-fields'

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
          message: characterConfigurationValidationMessages.creatureTypeUnavailable(),
          path: ['allowedCharacterCreatureTypes'],
        })
      }
    }
  })
}

export function resolveRulesSchemaWithVocabulary(options: {
  activeCreatureTypeIds?: ReadonlySet<string>
  activeLanguageIds?: ReadonlySet<string>
}) {
  const { activeCreatureTypeIds, activeLanguageIds } = options
  if (!activeCreatureTypeIds && !activeLanguageIds) return rulesSchema

  return rulesSchema.superRefine((values, ctx) => {
    if (activeCreatureTypeIds) {
      for (const id of values.allowedCharacterCreatureTypes) {
        if (!activeCreatureTypeIds.has(id)) {
          ctx.addIssue({
            code: 'custom',
            message: characterConfigurationValidationMessages.creatureTypeUnavailable(),
            path: ['allowedCharacterCreatureTypes'],
          })
        }
      }
    }

    if (activeLanguageIds) {
      for (const id of values.languageProficiencyGrants.items) {
        if (!activeLanguageIds.has(id)) {
          ctx.addIssue({
            code: 'custom',
            message: characterConfigurationValidationMessages.languageUnavailable(),
            path: ['languageProficiencyGrants', 'items'],
          })
        }
      }

      for (const id of values.languageProficiencyChoice.from) {
        if (!activeLanguageIds.has(id)) {
          ctx.addIssue({
            code: 'custom',
            message: characterConfigurationValidationMessages.languageUnavailable(),
            path: ['languageProficiencyChoice', 'from'],
          })
        }
      }
    }
  })
}

/** Rules fields for Homebrew Rules Configuration — flat sections with in-page anchor targets. */
export function buildRulesConfigFields(
  creatureTypeOptions: FieldOption[],
  languageOptions: FieldOption[] = [],
): FormItem[] {
  return buildRulesConfigLayoutFields(creatureTypeOptions, languageOptions)
}
