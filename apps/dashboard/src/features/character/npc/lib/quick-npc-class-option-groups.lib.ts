import {
  getContentTypeSentenceForm,
  resolveOrganizationMemberClassRecommendationIds,
  type CharacterClass,
} from '@rpg/contracts'
import type { RadioCardOption, RadioCardOptionGroup } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

import { mapFieldOptionsToRadioCardOptions } from '../../lib/choice-sets/choice-set-field.lib'

export const QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW = 'Recommended for this organization' as const
export const QUICK_NPC_CLASS_ALL_GROUP_EYEBROW = `All other ${getContentTypeSentenceForm('classes', 2)}`

export function buildQuickNpcClassRadioCardPresentation(input: {
  classOptions: readonly FieldOption[]
  memberClassAffinityIds?: readonly string[]
  playableClasses: readonly CharacterClass[]
}): {
  options: RadioCardOption[]
  optionGroups?: RadioCardOptionGroup[]
} {
  const options = mapFieldOptionsToRadioCardOptions(input.classOptions)
  const recommendedIds = resolveOrganizationMemberClassRecommendationIds({
    memberClassAffinityIds: input.memberClassAffinityIds ?? [],
    playableClasses: input.playableClasses,
  })

  if (recommendedIds.length === 0) {
    return { options }
  }

  const optionsByValue = new Map(options.map((option) => [option.value, option]))
  const recommendedOptions = recommendedIds.flatMap((classId) => {
    const option = optionsByValue.get(classId)
    return option ? [option] : []
  })

  if (recommendedOptions.length === 0) {
    return { options }
  }

  const recommendedValueSet = new Set(recommendedOptions.map((option) => option.value))
  const otherOptions = options.filter((option) => !recommendedValueSet.has(option.value))

  const optionGroups: RadioCardOptionGroup[] = [
    {
      id: 'recommended',
      eyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
      options: recommendedOptions,
    },
  ]

  if (otherOptions.length > 0) {
    optionGroups.push({
      id: 'all-classes',
      eyebrow: QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
      options: otherOptions,
    })
  }

  return { options, optionGroups }
}
