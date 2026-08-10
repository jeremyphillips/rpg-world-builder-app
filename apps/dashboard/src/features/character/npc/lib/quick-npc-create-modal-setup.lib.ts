import {
  getContentTypeTerm,
  resolveBuilderLevelConstraints,
  type CharacterBuildContext,
} from '@rpg/contracts'

import {
  isCreateSetupChoiceComplete,
  isCreateSetupNumberComplete,
  resolveCreateSetupCanContinue,
  type CreateSetupSet,
} from '@/lib/create-setup'

import { mapFieldOptionsToRadioCardOptions } from '../../lib/choice-sets/choice-set-field.lib'
import { buildQuickNpcContentOptions, type QuickNpcSetupValues } from './quick-npc-form-fields'

export const QUICK_NPC_SETUP_HEADLINE = 'Create NPC' as const
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const

export type QuickNpcSetupSummaryEntry = {
  fieldLabel: string
  valueLabel: string
}

export type QuickNpcSetupModel = {
  speciesOptions: ReturnType<typeof buildQuickNpcContentOptions>['speciesOptions']
  classOptions: ReturnType<typeof buildQuickNpcContentOptions>['classOptions']
  canContinue: boolean
  summaryEntries: QuickNpcSetupSummaryEntry[]
}

function optionLabel(options: readonly { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export function buildQuickNpcCreateSetupSets(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  onValuesChange: (values: QuickNpcSetupValues) => void
}): CreateSetupSet[] {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const levelConstraints = resolveBuilderLevelConstraints(args.context)
  const speciesTerm = getContentTypeTerm('species')
  const classTerm = getContentTypeTerm('classes')
  const { values, onValuesChange } = args

  return [
    {
      id: 'speciesId',
      kind: 'choice',
      fieldLabel: speciesTerm.label,
      prompt: `What ${speciesTerm.label.toLowerCase()} is this NPC?`,
      options: mapFieldOptionsToRadioCardOptions(speciesOptions),
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
      onReset: () => onValuesChange({ ...values, level: 1 }),
    },
    {
      id: 'classId',
      kind: 'choice',
      fieldLabel: classTerm.label,
      prompt: `Choose a ${classTerm.label.toLowerCase()}`,
      options: mapFieldOptionsToRadioCardOptions(classOptions),
      value: values.classId,
      dependsOn: ['speciesId'],
      isComplete: isCreateSetupChoiceComplete(values.classId),
      collapseWhenComplete: true,
      onValueChange: (classId) => onValuesChange({ ...values, classId }),
      onReset: () => onValuesChange({ ...values, classId: '' }),
    },
  ]
}

export function resolveQuickNpcSetupModel(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
}): QuickNpcSetupModel {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const levelConstraints = resolveBuilderLevelConstraints(args.context)
  const { speciesId, classId, level } = args.values

  const sets = buildQuickNpcCreateSetupSets({
    context: args.context,
    values: args.values,
    onValuesChange: () => {},
  })
  const canContinue =
    resolveCreateSetupCanContinue({ sets }) &&
    isCreateSetupNumberComplete(level, levelConstraints.minLevel, levelConstraints.maxLevel) &&
    Boolean(speciesId && classId)

  const summaryEntries: QuickNpcSetupSummaryEntry[] = []
  if (speciesId) {
    summaryEntries.push({
      fieldLabel: getContentTypeTerm('species').label,
      valueLabel: optionLabel(speciesOptions, speciesId),
    })
  }
  if (classId) {
    summaryEntries.push({
      fieldLabel: getContentTypeTerm('classes').label,
      valueLabel: optionLabel(classOptions, classId),
    })
  }
  if (level >= levelConstraints.minLevel) {
    summaryEntries.push({
      fieldLabel: 'Level',
      valueLabel: String(level),
    })
  }

  return {
    speciesOptions,
    classOptions,
    canContinue,
    summaryEntries,
  }
}
