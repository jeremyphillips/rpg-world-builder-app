'use client'

import { useMemo } from 'react'

import { useSubmitHandler } from '@/lib/use-submit-handler'
import { notifySaveSuccess } from '@/lib/notify'
import {
  buildCharacterCreationPatchInput,
  buildRulesConfigFields,
  mapRulesetPatchToRulesValues,
  resolveRulesSchemaWithVocabulary,
  type RulesValues,
  useCanManageCampaign,
} from '@/features/campaign'
import {
  buildActiveCreatureTypeFieldOptions,
  buildActiveLanguageFieldOptions,
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
} from '@/features/vocabulary'
import { buildContentFormOptionSets, useEquipment } from '@/features/content'
import { disableFormItems } from '@/lib/disable-form-items'

import { createRulesConfigSaveFooter } from '../components/rules-config-save-footer'
import { usePatchCharacterCreationMutation } from './use-patch-character-creation-mutation'
import { useRulesetPatch } from './use-ruleset-patch'

export function useCharacterConfigurationRulesForm(campaignId: string) {
  const canManage = useCanManageCampaign(campaignId)
  const { data: patch, isPending, isError } = useRulesetPatch(campaignId)
  const {
    vocabulary: creatureTypeVocabulary,
    isPending: isCreatureTypeVocabularyPending,
    isError: isCreatureTypeVocabularyError,
  } = useCreatureTypeVocabulary(campaignId)
  const {
    vocabulary: languageVocabulary,
    categoryOptions,
    isPending: isLanguageVocabularyPending,
    isError: isLanguageVocabularyError,
  } = useLanguageVocabulary(campaignId)
  const {
    data: equipment,
    isPending: isEquipmentPending,
    isError: isEquipmentError,
  } = useEquipment(campaignId)
  const { mutateAsync, isPending: isSaving } = usePatchCharacterCreationMutation(campaignId)

  const schema = useMemo(
    () =>
      resolveRulesSchemaWithVocabulary({
        activeCreatureTypeIds: creatureTypeVocabulary?.activeIds,
        activeLanguageIds: languageVocabulary?.activeIds,
      }),
    [creatureTypeVocabulary?.activeIds, languageVocabulary?.activeIds],
  )

  const fields = useMemo(() => {
    const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(creatureTypeVocabulary)
    const languageOptions = buildActiveLanguageFieldOptions(languageVocabulary)
    const { armor: armorOptions, weapons: weaponOptions } = buildContentFormOptionSets({
      campaignId,
      equipment,
    })
    return disableFormItems(
      buildRulesConfigFields(
        creatureTypeOptions,
        languageOptions,
        categoryOptions,
        armorOptions,
        weaponOptions,
      ),
      !canManage,
    )
  }, [
    campaignId,
    canManage,
    categoryOptions,
    creatureTypeVocabulary,
    equipment,
    languageVocabulary,
  ])

  const defaultValues = useMemo(
    () => (patch ? mapRulesetPatchToRulesValues(patch.characterCreation) : undefined),
    [patch],
  )

  const { onSubmit, formError } = useSubmitHandler<RulesValues>(async (values, form) => {
    await mutateAsync(
      buildCharacterCreationPatchInput(values, {
        includeDefaultMulticlassing: true,
        includeDefaultSubclassing: true,
        includeDefaultLanguageProficiencies: true,
        includeDefaultLevelZeroNpcs: true,
        existingLanguageChoice: patch?.characterCreation.proficiencyChoices.languages[0],
      }),
    )
    form.reset(values)
    notifySaveSuccess()
  }, 'Could not save character configuration.')

  const saveFooter = useMemo(() => createRulesConfigSaveFooter({ pending: isSaving }), [isSaving])

  return {
    canManage,
    schema,
    fields,
    defaultValues,
    onSubmit,
    formError,
    saveFooter,
    isPending:
      isPending ||
      isCreatureTypeVocabularyPending ||
      isLanguageVocabularyPending ||
      isEquipmentPending,
    isError:
      isError || isCreatureTypeVocabularyError || isLanguageVocabularyError || isEquipmentError,
  }
}
