import {
  formatEffectResolutionMethod,
  type ResolutionMethodFormatRegister,
} from '../../lib/resolution/format-method'
import type { SpellResolution } from './schema'
import { getSpellResolutionAttackTypeLabel } from './vocab'

export type { ResolutionMethodFormatRegister }

/** e.g. "Ranged spell attack" / "Constitution saving throw" / "Automatic" */
export function formatResolutionMethod(
  resolution: SpellResolution,
  register: ResolutionMethodFormatRegister = 'authoring',
): string {
  const { method } = resolution
  switch (method.kind) {
    case 'attack':
      return getSpellResolutionAttackTypeLabel(method.attackType)
    case 'saving-throw':
    case 'automatic':
      return formatEffectResolutionMethod({ method }, register)
    default: {
      const _exhaustive: never = method
      return _exhaustive
    }
  }
}
