import type { RadioCardOption, RadioCardOptionGroup } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

import { mapFieldOptionsToRadioCardOptions } from '../../lib/choice-sets/choice-set-field.lib'

export const QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW = 'Recommended for this organization' as const

export function buildQuickNpcAffinityRadioCardPresentation(input: {
  options: readonly FieldOption[]
  recommendedIds: readonly string[]
  recommendedGroupEyebrow: string
  allOtherGroupEyebrow: string
  allOtherGroupId: string
}): {
  options: RadioCardOption[]
  optionGroups?: RadioCardOptionGroup[]
} {
  const options = mapFieldOptionsToRadioCardOptions(input.options)

  if (input.recommendedIds.length === 0) {
    return { options }
  }

  const optionsByValue = new Map(options.map((option) => [option.value, option]))
  const recommendedOptions = input.recommendedIds.flatMap((contentId) => {
    const option = optionsByValue.get(contentId)
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
      eyebrow: input.recommendedGroupEyebrow,
      options: recommendedOptions,
    },
  ]

  if (otherOptions.length > 0) {
    optionGroups.push({
      id: input.allOtherGroupId,
      eyebrow: input.allOtherGroupEyebrow,
      options: otherOptions,
    })
  }

  return { options, optionGroups }
}
