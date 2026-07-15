import {
  ARCANE_HAND_RESOLUTION,
  BURNING_HANDS_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  MASS_HEALING_WORD_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
  type SpellResolution,
} from '@rpg/contracts'

import type { ResolutionFormValues } from './lib/form/resolution-form-schema'
import { resolutionToForm } from './lib/form/resolution-form-values'

export {
  ARCANE_HAND_RESOLUTION,
  BURNING_HANDS_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  MASS_HEALING_WORD_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
}

/** Lazily mapped form fixtures — getters avoid circular init with resolution-form-values. */
export const RESOLUTION_FORM_FIXTURES = {
  get eldritchBlast(): ResolutionFormValues {
    return resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!
  },
  get chillTouch(): ResolutionFormValues {
    return resolutionToForm(CHILL_TOUCH_RESOLUTION)!
  },
  get inflictWounds(): ResolutionFormValues {
    return resolutionToForm(INFlict_WOUNDS_RESOLUTION)!
  },
  get cureWounds(): ResolutionFormValues {
    return resolutionToForm(CURE_WOUNDS_RESOLUTION)!
  },
  get falseLife(): ResolutionFormValues {
    return resolutionToForm(FALSE_LIFE_RESOLUTION)!
  },
  get fireball(): ResolutionFormValues {
    return resolutionToForm(FIREBALL_RESOLUTION)!
  },
  get burningHands(): ResolutionFormValues {
    return resolutionToForm(BURNING_HANDS_RESOLUTION)!
  },
  get massHealingWord(): ResolutionFormValues {
    return resolutionToForm(MASS_HEALING_WORD_RESOLUTION)!
  },
  get iceKnife(): ResolutionFormValues {
    return resolutionToForm(ICE_KNIFE_RESOLUTION)!
  },
  get arcaneHand(): ResolutionFormValues {
    return resolutionToForm(ARCANE_HAND_RESOLUTION)!
  },
  get magicMissile(): ResolutionFormValues {
    return resolutionToForm(MAGIC_MISSILE_RESOLUTION)!
  },
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
