import {
  isClassProgressionApplicable,
  resolveCharacterLevelConstraints,
  resolveOrganizationMembershipTitleDefinitionByLabel,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../components/connections/organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'

import { resolveQuickNpcDefaultLevel, type QuickNpcSetupValues } from './quick-npc-form-fields'

function clampLevel(level: number, minLevel: number, maxLevel: number): number {
  return Math.min(maxLevel, Math.max(minLevel, level))
}

function applyLevelClassSideEffects(values: QuickNpcSetupValues): QuickNpcSetupValues {
  if (!isClassProgressionApplicable(values.level)) {
    return { ...values, classId: '' }
  }
  return values
}

export function resolveQuickNpcLevelForMembershipTitle(args: {
  membershipTitle: string
  titles: readonly OrganizationMembershipTitleDefinition[]
  context: CharacterBuildContext
}): number {
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const defaultLevel = resolveQuickNpcDefaultLevel(args.context)

  if (
    args.membershipTitle.trim() === '' ||
    args.membershipTitle === ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE
  ) {
    return defaultLevel
  }

  const persistedTitle = titleFromMembershipRadioValue(args.membershipTitle)
  if (persistedTitle === undefined) {
    return defaultLevel
  }

  const definition = resolveOrganizationMembershipTitleDefinitionByLabel(
    args.titles,
    persistedTitle,
  )
  const recommendation = definition?.npcRecommendation
  if (recommendation === undefined) {
    return defaultLevel
  }

  return clampLevel(recommendation.level, levelConstraints.minLevel, levelConstraints.maxLevel)
}

export function applyQuickNpcSetupValueChange(args: {
  values: QuickNpcSetupValues
  setId: string
  nextValue: string | number
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
}): QuickNpcSetupValues {
  if (args.setId === 'speciesId') {
    return applyLevelClassSideEffects({
      ...args.values,
      speciesId: String(args.nextValue),
      classId: '',
    })
  }

  if (args.setId === 'membershipTitle') {
    const membershipTitle = String(args.nextValue)
    return applyLevelClassSideEffects({
      ...args.values,
      membershipTitle,
      level: resolveQuickNpcLevelForMembershipTitle({
        membershipTitle,
        titles: args.titles,
        context: args.context,
      }),
    })
  }

  if (args.setId === 'level') {
    return applyLevelClassSideEffects({
      ...args.values,
      level: Number(args.nextValue),
    })
  }

  if (args.setId === 'classId') {
    return {
      ...args.values,
      classId: String(args.nextValue),
    }
  }

  return args.values
}
