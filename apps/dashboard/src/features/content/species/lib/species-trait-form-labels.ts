import { CONTENT_TRAIT_KINDS } from '@rpg/contracts'
import { toOptions } from '@rpg/ui/form'

export const TRAIT_KIND_LABELS = {
  custom: 'Custom',
  grant: 'From grants',
} as const satisfies Record<(typeof CONTENT_TRAIT_KINDS)[number], string>

export const traitKindOptions = toOptions(CONTENT_TRAIT_KINDS, TRAIT_KIND_LABELS)
