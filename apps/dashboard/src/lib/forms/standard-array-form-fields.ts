import {
  ABILITY_SCORE_MIN,
  CHARACTER_ABILITY_SCORE_MAX,
  STANDARD_ARRAY_LENGTH,
} from '@rpg/contracts'
import type { FormItem, FormNavigationAnchor } from '@rpg/ui/form'

const SCROLL_SECTION_ANCHOR_CLASS = 'scroll-mt-20'

export type StandardArrayFormFieldOptions = {
  name?: string
  label?: string
  hint?: string
  id?: string
  navigation?: FormNavigationAnchor
}

/** Six inline two-character-width numeric inputs for a Standard Array. */
export function standardArrayFormFields(options: StandardArrayFormFieldOptions = {}): FormItem {
  const name = options.name ?? 'standardArray'
  const label = options.label ?? 'Standard array'
  const navigation = options.navigation
  const id = options.id ?? navigation?.id

  return {
    kind: 'row',
    ...(id ? { id } : {}),
    ...(navigation ? { navigation } : {}),
    className: navigation || id ? SCROLL_SECTION_ANCHOR_CLASS : undefined,
    spacing: 'compact',
    heading: {
      label,
      ...(options.hint ? { hint: options.hint } : {}),
    },
    separator: 'subtle',
    fields: Array.from({ length: STANDARD_ARRAY_LENGTH }, (_, index) => ({
      type: 'number' as const,
      name: `${name}.${index}`,
      label: `${label} score ${index + 1}`,
      labelVisibility: 'srOnly' as const,
      digits: 2,
      width: 'auto' as const,
      required: true,
      min: ABILITY_SCORE_MIN,
      max: CHARACTER_ABILITY_SCORE_MAX,
    })),
  }
}
