import {
  isClassProgressionApplicable,
  resolveCharacterLevelConstraints,
  resolveOrganizationMembershipTitleProjection,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'

import { resolveQuickNpcDefaultLevel, type QuickNpcSetupValues } from './quick-npc-form-fields'
import { isQuickNpcOrganizationMemberSetup } from './quick-npc-form-fields'
import { isCreateSetupChoiceComplete, type CreateSetupValueChangeEvent } from '@/lib/create-setup'
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

  if (args.membershipTitle.trim() === '') {
    return defaultLevel
  }

  let membershipTitleId: string
  try {
    membershipTitleId = titleFromMembershipRadioValue(args.membershipTitle)
  } catch {
    return defaultLevel
  }

  const projection = resolveOrganizationMembershipTitleProjection({
    catalog: args.titles,
    membershipTitleId,
  })
  if (projection.status !== 'resolved' || projection.npcRecommendation === undefined) {
    return defaultLevel
  }

  return clampLevel(
    projection.npcRecommendation.level ?? defaultLevel,
    levelConstraints.minLevel,
    levelConstraints.maxLevel,
  )
}

type QuickNpcSetupValueChangeArgs = {
  values: QuickNpcSetupValues
  event: CreateSetupValueChangeEvent
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

function applyRecommendedClassSeedingWhenSpeciesComplete(
  args: QuickNpcSetupValueChangeArgs & { values: QuickNpcSetupValues },
): QuickNpcSetupValues {
  if (!isCreateSetupChoiceComplete(args.values.speciesId)) {
    return args.values
  }

  return applyRecommendedClassSeeding(args)
}

export function applyQuickNpcSetupValueChange(
  args: QuickNpcSetupValueChangeArgs,
): QuickNpcSetupValues {
  const { setId, nextValue } = args.event

  if (setId === 'speciesId') {
    const nextValues = applyLevelClassSideEffects({
      ...args.values,
      speciesId: String(nextValue),
      classId: '',
    })

    return applyRecommendedClassSeedingWhenSpeciesComplete({ ...args, values: nextValues })
  }

  if (setId === 'membershipTitle') {
    if (!isQuickNpcOrganizationMemberSetup(args.values)) {
      return args.values
    }

    const membershipTitle = String(nextValue)
    const nextValues: QuickNpcSetupValues = {
      ...args.values,
      membershipTitle,
      level: resolveQuickNpcLevelForMembershipTitle({
        membershipTitle,
        titles: args.titles,
        context: args.context,
      }),
      classId: '',
    }

    return applyRecommendedClassSeedingWhenSpeciesComplete({ ...args, values: nextValues })
  }

  if (setId === 'level') {
    const previousLevel = args.values.level
    const nextLevel = Number(nextValue)

    if (!isClassProgressionApplicable(nextLevel)) {
      return applyLevelClassSideEffects({ ...args.values, level: nextLevel })
    }

    if (!isClassProgressionApplicable(previousLevel)) {
      return applyRecommendedClassSeedingWhenSpeciesComplete({
        ...args,
        values: { ...args.values, level: nextLevel, classId: '' },
      })
    }

    return { ...args.values, level: nextLevel }
  }

  if (setId === 'classId') {
    return {
      ...args.values,
      classId: String(nextValue),
    }
  }

  return args.values
}
