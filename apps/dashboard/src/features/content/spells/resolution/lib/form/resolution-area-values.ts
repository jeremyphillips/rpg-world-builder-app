import type { AreaGeometry } from '@rpg/contracts'

import {
  EMPTY_SPELL_AREA_OF_EFFECT,
  spellAreaOfEffectFromFormValues,
  spellAreaOfEffectToFormValues,
  type SpellFormAreaOfEffect,
} from '../../../lib/spell-form-values'

export type ResolutionFormAreaOfEffect = SpellFormAreaOfEffect

export const EMPTY_RESOLUTION_AREA_OF_EFFECT = EMPTY_SPELL_AREA_OF_EFFECT

export function resolutionAreaToForm(
  areaOfEffect: AreaGeometry | undefined,
): ResolutionFormAreaOfEffect {
  return spellAreaOfEffectToFormValues(areaOfEffect)
}

export function resolutionAreaFromForm(
  areaOfEffect: ResolutionFormAreaOfEffect | undefined,
): AreaGeometry | undefined {
  return spellAreaOfEffectFromFormValues(areaOfEffect)
}
