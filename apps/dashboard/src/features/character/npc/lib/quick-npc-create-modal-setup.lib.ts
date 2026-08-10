import { getContentTypeTerm, type CharacterBuildContext } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  buildQuickNpcContentOptions,
  resolveQuickNpcMaxLevel,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'

export const QUICK_NPC_SETUP_HEADLINE = 'Create NPC' as const
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const

export type QuickNpcSetupSummaryEntry = {
  fieldLabel: string
  valueLabel: string
}

export type QuickNpcSetupModel = {
  speciesOptions: FieldOption[]
  classOptions: FieldOption[]
  maxLevel: number
  canContinue: boolean
  summaryEntries: QuickNpcSetupSummaryEntry[]
}

function optionLabel(options: readonly FieldOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export function resolveQuickNpcSetupModel(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
}): QuickNpcSetupModel {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const maxLevel = resolveQuickNpcMaxLevel(args.context)
  const { speciesId, classId, level } = args.values

  const canContinue = Boolean(speciesId && classId && level >= 1 && level <= maxLevel)

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
  if (level >= 1) {
    summaryEntries.push({
      fieldLabel: 'Level',
      valueLabel: String(level),
    })
  }

  return {
    speciesOptions,
    classOptions,
    maxLevel,
    canContinue,
    summaryEntries,
  }
}
