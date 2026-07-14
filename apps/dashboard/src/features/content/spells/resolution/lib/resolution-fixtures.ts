import {
  ARCANE_HAND_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
  type SpellResolution,
} from '@rpg/contracts'

import type { ResolutionFormValues } from './resolution-form-schema'
import { resolutionToForm } from './resolution-form-values'

export {
  ARCANE_HAND_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
}

export const RESOLUTION_FORM_FIXTURES = {
  eldritchBlast: resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!,
  chillTouch: resolutionToForm(CHILL_TOUCH_RESOLUTION)!,
  inflictWounds: resolutionToForm(INFlict_WOUNDS_RESOLUTION)!,
  cureWounds: resolutionToForm(CURE_WOUNDS_RESOLUTION)!,
  falseLife: resolutionToForm(FALSE_LIFE_RESOLUTION)!,
  iceKnife: resolutionToForm(ICE_KNIFE_RESOLUTION)!,
  arcaneHand: resolutionToForm(ARCANE_HAND_RESOLUTION)!,
  magicMissile: resolutionToForm(MAGIC_MISSILE_RESOLUTION)!,
} as const satisfies Record<string, ResolutionFormValues>

export function spellResolutionFixture(
  slug: keyof typeof SPELL_RESOLUTION_FIXTURES,
): SpellResolution {
  return SPELL_RESOLUTION_FIXTURES[slug]
}

export function resolutionFormFixture(
  slug: keyof typeof SPELL_RESOLUTION_FIXTURES,
): ResolutionFormValues {
  const form = resolutionToForm(SPELL_RESOLUTION_FIXTURES[slug])
  if (!form) {
    throw new Error(`Failed to map resolution fixture to form values: ${slug}`)
  }
  return form
}
