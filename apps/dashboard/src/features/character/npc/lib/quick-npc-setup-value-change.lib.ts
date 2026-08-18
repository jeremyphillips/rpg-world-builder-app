import {
  isClassProgressionApplicable,
  resolveCharacterLevelConstraints,
  resolveOrganizationMembershipTitleDefinitionByLabel,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import { titleFromMembershipRadioValue } from '../../components/connections/organization-membership-title-field.lib'

import { resolveQuickNpcDefaultLevel, type QuickNpcSetupValues } from './quick-npc-form-fields'
import { applyQuickNpcRecommendedClassSeeding } from './quick-npc-class-recommendation.lib'

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
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  context: CharacterBuildContext
}): number {
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const defaultLevel = resolveQuickNpcDefaultLevel(args.context)

  if (args.membershipTitle === undefined) {
    return defaultLevel
  }

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

type QuickNpcSetupValueChangeArgs = {
  values: QuickNpcSetupValues
  setId: string
  nextValue: string | number
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationClassAffinityIds?: readonly string[]
}

function applyRecommendedClassSeeding(args: QuickNpcSetupValueChangeArgs): QuickNpcSetupValues {
  return applyQuickNpcRecommendedClassSeeding({
    values: args.values,
    context: args.context,
    titles: args.titles,
    organizationClassAffinityIds: args.organizationClassAffinityIds,
  })
}

export function applyQuickNpcSetupValueChange(
  args: QuickNpcSetupValueChangeArgs,
): QuickNpcSetupValues {
  if (args.setId === 'speciesId') {
    return applyLevelClassSideEffects({
      ...args.values,
      speciesId: String(args.nextValue),
      classId: '',
    })
  }

  if (args.setId === 'membershipTitle') {
    const membershipTitle = String(args.nextValue)
    const nextValues = {
      ...args.values,
      membershipTitle,
      level: resolveQuickNpcLevelForMembershipTitle({
        membershipTitle,
        titles: args.titles,
        context: args.context,
      }),
      classId: '',
    }

    return applyRecommendedClassSeeding({ ...args, values: nextValues })
  }

  if (args.setId === 'level') {
    const previousLevel = args.values.level
    const nextLevel = Number(args.nextValue)

    if (!isClassProgressionApplicable(nextLevel)) {
      return applyLevelClassSideEffects({ ...args.values, level: nextLevel })
    }

    if (!isClassProgressionApplicable(previousLevel)) {
      return applyRecommendedClassSeeding({
        ...args,
        values: { ...args.values, level: nextLevel, classId: '' },
      })
    }

    return { ...args.values, level: nextLevel }
  }

  if (args.setId === 'classId') {
    return {
      ...args.values,
      classId: String(args.nextValue),
    }
  }

  return args.values
}
