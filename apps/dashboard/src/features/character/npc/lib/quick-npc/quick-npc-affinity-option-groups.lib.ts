import type { RadioCardOption, RadioCardOptionGroup } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

import { mapFieldOptionsToRadioCardOptions } from '../../../lib/choice-sets/choice-set-field.lib'

export const QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW = 'Recommended for this organization' as const

/** Shared eyebrow for build-card recommended / all-other groups (class, role, …). */
export const QUICK_NPC_RECOMMENDED_GROUP_EYEBROW = 'Recommended' as const

export type QuickNpcAffinityOption = {
  value: string
  label: string
  disabled?: boolean
}

export type QuickNpcAffinityOptionGroup = {
  id: string
  eyebrow: string
  options: readonly QuickNpcAffinityOption[]
}

function mapFieldOptionsToAffinityOptions(
  options: readonly FieldOption[],
): QuickNpcAffinityOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    ...(option.disabled ? { disabled: option.disabled } : {}),
  }))
}

/** Chrome-neutral recommended vs all-other grouping for affinity pickers. */
export function resolveQuickNpcAffinityOptionGroups(input: {
  options: readonly FieldOption[]
  recommendedIds: readonly string[]
  recommendedGroupEyebrow: string
  allOtherGroupEyebrow: string
  allOtherGroupId: string
}): {
  options: QuickNpcAffinityOption[]
  optionGroups?: QuickNpcAffinityOptionGroup[]
} {
  const options = mapFieldOptionsToAffinityOptions(input.options)

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

  const optionGroups: QuickNpcAffinityOptionGroup[] = [
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

export function buildQuickNpcAffinityRadioCardPresentation(input: {
  options: readonly FieldOption[]
  recommendedIds: readonly string[]
  recommendedGroupEyebrow: string
  allOtherGroupEyebrow: string
  allOtherGroupId: string
  /** When set, used for labels/descriptions instead of mapping {@link input.options} only. */
  radioCardOptions?: readonly RadioCardOption[]
}): {
  options: RadioCardOption[]
  optionGroups?: RadioCardOptionGroup[]
} {
  const grouped = resolveQuickNpcAffinityOptionGroups(input)
  const options: RadioCardOption[] = input.radioCardOptions
    ? [...input.radioCardOptions]
    : mapFieldOptionsToRadioCardOptions(input.options)

  if (!grouped.optionGroups) {
    return { options }
  }

  const radioOptionsByValue = new Map(options.map((option) => [option.value, option]))

  return {
    options,
    optionGroups: grouped.optionGroups.map((group) => ({
      id: group.id,
      eyebrow: group.eyebrow,
      options: group.options.flatMap((option) => {
        const radioOption = radioOptionsByValue.get(option.value)
        return radioOption ? [radioOption] : []
      }),
    })),
  }
}

/** Props spread for {@link RadioCardField} from affinity presentation output. */
export function spreadQuickNpcRadioCardFieldPresentation(presentation: {
  options: readonly RadioCardOption[]
  optionGroups?: readonly RadioCardOptionGroup[]
}) {
  return {
    options: [...presentation.options],
    optionGroups: presentation.optionGroups?.map((group) => ({
      ...group,
      options: [...group.options],
    })),
  }
}
