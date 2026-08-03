/**
 * Phase 4 validation sweep for dashboard forms outside the content catalog registry.
 */
import { describe, it } from 'vitest'
import {
  assertFieldPathsRegistered,
  assertInvalidSubmitUsesRefinedMessages,
  assertRegistryCoverage,
} from '@rpg/ui/form/test-utils'

import {
  buildRulesConfigFields,
  createRulesFields,
  createRulesSchema,
  resolveRulesSchema,
} from '@/features/campaign/lib/rules/character-configuration/character-configuration-form'
import {
  buildActiveCreatureTypeFieldOptions,
  buildAttackResolutionModeFieldOptions,
  buildEditionPresetFieldOptions,
  buildSeedAttackResolutionModeVocabulary,
  buildSeedCreatureTypeVocabulary,
  buildSeedEditionPresetVocabulary,
} from '@/features/vocabulary'
import {
  buildMechanicsConfigFields,
  mechanicsValuesSchema,
} from '@/features/campaign/lib/rules/mechanics/mechanics-form-fields'
import {
  flavorFields,
  flavorSchema,
  identityFields,
  identitySchema,
} from '@/features/campaign/lib/profile/campaign-profile-form-fields'
import { campaignSettingsSchema } from '@/features/campaign/lib/campaign-settings-form-values'
import { buildWorldSettingsFields } from '@/features/campaign/lib/world/world-settings-form-fields'
import { accountFields, accountFormSchema } from '@/features/user/lib/account-fields'
import {
  changePasswordFields,
  changePasswordFormSchema,
} from '@/features/user/lib/change-password-fields'
import {
  vocabularyEntryCreateFields,
  vocabularyEntryCreateFormSchema,
  vocabularyEntryEditFields,
  vocabularyEntryEditFormSchema,
} from '@/features/vocabulary/lib/vocabulary-entry-form-fields'

const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(buildSeedCreatureTypeVocabulary())
const editionPresetOptions = buildEditionPresetFieldOptions(buildSeedEditionPresetVocabulary())
const attackResolutionOptions = buildAttackResolutionModeFieldOptions(
  buildSeedAttackResolutionModeVocabulary(),
)

const SLOT_IGNORE = [/^_/] as const

describe('dashboard form validation', () => {
  it('account profile', () => {
    assertFieldPathsRegistered(accountFields)
    assertRegistryCoverage(accountFormSchema, accountFields)
    assertInvalidSubmitUsesRefinedMessages(accountFormSchema, accountFields)
  })

  it('change password', () => {
    assertFieldPathsRegistered(changePasswordFields)
    assertRegistryCoverage(changePasswordFormSchema, changePasswordFields)
    assertInvalidSubmitUsesRefinedMessages(changePasswordFormSchema, changePasswordFields, {
      invalidValue: {
        currentPassword: '',
        newPassword: 'short',
        confirmNewPassword: 'different',
      },
    })
  })

  it('campaign create identity step', () => {
    assertFieldPathsRegistered(identityFields)
    assertRegistryCoverage(identitySchema, identityFields)
    assertInvalidSubmitUsesRefinedMessages(identitySchema, identityFields)
  })

  it('campaign create rules step', () => {
    assertFieldPathsRegistered(createRulesFields)
    assertRegistryCoverage(createRulesSchema, createRulesFields)
    assertInvalidSubmitUsesRefinedMessages(createRulesSchema, createRulesFields, {
      invalidValue: { startingLevel: 0, importedCharactersPolicy: 'disabled' },
    })
  })

  it('campaign create flavor step', () => {
    assertFieldPathsRegistered(flavorFields)
    assertRegistryCoverage(flavorSchema, flavorFields)
    assertInvalidSubmitUsesRefinedMessages(flavorSchema, flavorFields, {
      invalidValue: { playStyle: ['not-a-style'] },
    })
  })

  it('campaign settings (identity + flavor + world)', () => {
    const fields = [...identityFields, ...flavorFields, ...buildWorldSettingsFields([])]
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(campaignSettingsSchema, fields)
    assertInvalidSubmitUsesRefinedMessages(campaignSettingsSchema, fields, {
      invalidValue: { name: '' },
    })
  })

  it('character configuration (rules config)', () => {
    const fields = buildRulesConfigFields(creatureTypeOptions)
    const schema = resolveRulesSchema()

    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(schema, fields, { ignorePaths: SLOT_IGNORE })
    assertInvalidSubmitUsesRefinedMessages(schema, fields, {
      invalidValue: { startingLevel: 0 },
    })
  })

  it('mechanics configuration', () => {
    const fields = buildMechanicsConfigFields({
      editionPresetOptions,
      attackResolutionModeOptions: attackResolutionOptions,
    })

    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(mechanicsValuesSchema, fields, { ignorePaths: SLOT_IGNORE })
    assertInvalidSubmitUsesRefinedMessages(mechanicsValuesSchema, fields)
  })

  it('vocabulary entry create sheet', () => {
    assertFieldPathsRegistered(vocabularyEntryCreateFields)
    assertRegistryCoverage(vocabularyEntryCreateFormSchema, vocabularyEntryCreateFields)
    assertInvalidSubmitUsesRefinedMessages(
      vocabularyEntryCreateFormSchema,
      vocabularyEntryCreateFields,
    )
  })

  it('vocabulary entry edit sheet', () => {
    assertFieldPathsRegistered(vocabularyEntryEditFields)
    assertRegistryCoverage(vocabularyEntryEditFormSchema, vocabularyEntryEditFields)
    assertInvalidSubmitUsesRefinedMessages(
      vocabularyEntryEditFormSchema,
      vocabularyEntryEditFields,
      {
        invalidValue: { id: 'fey', label: '', description: '', status: 'active' },
      },
    )
  })
})
