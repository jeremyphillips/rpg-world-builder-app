import { getAbilityLabel } from '../../../vocab/ability'
import type { SpellResolution } from './schema'
import { getSpellResolutionAttackTypeLabel } from './vocab'

export type ResolutionMethodFormatRegister = 'authoring' | 'resolution-preview'

/** e.g. "Ranged spell attack" / "Constitution saving throw" / "Automatic" */
export function formatResolutionMethod(
  resolution: SpellResolution,
  register: ResolutionMethodFormatRegister = 'authoring',
): string {
  const { method } = resolution
  if (register === 'resolution-preview' && method.kind === 'automatic') {
    return 'No check required'
  }

  switch (method.kind) {
    case 'attack':
      return getSpellResolutionAttackTypeLabel(method.attackType)
    case 'saving-throw':
      return `${getAbilityLabel(method.ability)} saving throw`
    case 'automatic':
      return 'Automatic'
    default: {
      const _exhaustive: never = method
      return _exhaustive
    }
  }
}
