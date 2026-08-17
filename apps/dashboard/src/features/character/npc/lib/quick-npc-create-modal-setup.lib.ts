import {
  getContentTypeTerm,
  indexCharacterBuildCatalog,
  isClassProgressionApplicable,
  resolvePlayableBuilderContent,
  resolveCharacterLevelConstraints,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { formatBuilderDraftCharacterSummary } from '../../lib/builder-preview/preview-identity-summary'
import {
  isCreateSetupChoiceComplete,
  isCreateSetupNumberComplete,
  resolveCreateSetupCanContinue,
  type CreateSetupSet,
} from '@/lib/create-setup'

import { buildQuickNpcContentOptions, type QuickNpcSetupValues } from './quick-npc-form-fields'
import { buildQuickNpcClassRadioCardPresentation } from './quick-npc-class-option-groups.lib'
import { buildQuickNpcSpeciesRadioCardPresentation } from './quick-npc-species-option-groups.lib'

export const QUICK_NPC_SETUP_HEADLINE = 'Create NPC' as const
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const
export const QUICK_NPC_SETUP_SUMMARY_EYEBROW = 'Setup' as const

export type QuickNpcSetupModel = {
  speciesOptions: ReturnType<typeof buildQuickNpcContentOptions>['speciesOptions']
  classOptions: ReturnType<typeof buildQuickNpcContentOptions>['classOptions']
  canContinue: boolean
  /** Canonical character summary (`formatCharacterSummary`) for the setup selection. */
  summaryLine: string
}

export function resolveQuickNpcDefaultLevel(context: CharacterBuildContext): number {
  // Quick NPC setup defaults to campaign minimum (often level 0), unlike the full builder.
  return resolveCharacterLevelConstraints({
    characterKind: context.characterKind,
    rulesScope: context.rulesScope,
    characterCreationRules: context.characterCreationRules,
  }).minLevel
}

export function formatQuickNpcSetupCharacterSummary(
  values: QuickNpcSetupValues,
  context: CharacterBuildContext,
): string {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  return formatBuilderDraftCharacterSummary(
    {
      species: { speciesId: values.speciesId },
      class: {
        classId: isClassProgressionApplicable(values.level) ? values.classId : undefined,
        level: values.level,
      },
    },
    catalogIndex,
  )
}

export function buildQuickNpcCreateSetupSets(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  onValuesChange: (values: QuickNpcSetupValues) => void
  members?: { classAffinityIds?: readonly string[]; speciesAffinityIds?: readonly string[] }
}): CreateSetupSet[] {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const playableContent = resolvePlayableBuilderContent(args.context)
  const speciesPresentation = buildQuickNpcSpeciesRadioCardPresentation({
    speciesOptions,
    speciesAffinityIds: args.members?.speciesAffinityIds,
    playableSpecies: playableContent.species,
  })
  const classPresentation = buildQuickNpcClassRadioCardPresentation({
    classOptions,
    classAffinityIds: args.members?.classAffinityIds,
    playableClasses: playableContent.classes,
  })
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const defaultLevel = resolveQuickNpcDefaultLevel(args.context)
  const speciesTerm = getContentTypeTerm('species')
  const classTerm = getContentTypeTerm('classes')
  const { values, onValuesChange } = args
  const classProgressionApplicable = isClassProgressionApplicable(values.level)

  const sets: CreateSetupSet[] = [
    {
      id: 'speciesId',
      kind: 'choice',
      fieldLabel: speciesTerm.label,
      prompt: `What ${speciesTerm.label.toLowerCase()} is this NPC?`,
      options: speciesPresentation.options,
      ...(speciesPresentation.optionGroups
        ? { optionGroups: speciesPresentation.optionGroups }
        : {}),
      value: values.speciesId,
      isComplete: isCreateSetupChoiceComplete(values.speciesId),
      collapseWhenComplete: true,
      onValueChange: (speciesId) => onValuesChange({ ...values, speciesId }),
      onReset: () => {},
    },
    {
      id: 'level',
      kind: 'number',
      fieldLabel: 'Level',
      value: values.level,
      min: levelConstraints.minLevel,
      max: levelConstraints.maxLevel,
      digits: 2,
      isComplete: isCreateSetupNumberComplete(
        values.level,
        levelConstraints.minLevel,
        levelConstraints.maxLevel,
      ),
      collapseWhenComplete: false,
      onValueChange: (level) => onValuesChange({ ...values, level }),
      onReset: () => onValuesChange({ ...values, level: defaultLevel }),
    },
  ]

  if (classProgressionApplicable) {
    sets.push({
      id: 'classId',
      kind: 'choice',
      fieldLabel: classTerm.label,
      prompt: `Choose a ${classTerm.label.toLowerCase()}`,
      options: classPresentation.options,
      ...(classPresentation.optionGroups ? { optionGroups: classPresentation.optionGroups } : {}),
      value: values.classId,
      dependsOn: ['speciesId'],
      isComplete: isCreateSetupChoiceComplete(values.classId),
      collapseWhenComplete: true,
      onValueChange: (classId) => onValuesChange({ ...values, classId }),
      onReset: () => onValuesChange({ ...values, classId: '' }),
    })
  }

  return sets
}

export function resolveQuickNpcSetupModel(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
}): QuickNpcSetupModel {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const { speciesId, classId, level } = args.values
  const classRequired = isClassProgressionApplicable(level)

  const sets = buildQuickNpcCreateSetupSets({
    context: args.context,
    values: args.values,
    onValuesChange: () => {},
  })
  const canContinue =
    resolveCreateSetupCanContinue({ sets }) &&
    isCreateSetupNumberComplete(level, levelConstraints.minLevel, levelConstraints.maxLevel) &&
    Boolean(speciesId) &&
    (!classRequired || Boolean(classId))

  return {
    speciesOptions,
    classOptions,
    canContinue,
    summaryLine: formatQuickNpcSetupCharacterSummary(args.values, args.context),
  }
}
