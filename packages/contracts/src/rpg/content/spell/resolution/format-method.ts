import { getAbilityLabel } from '../../../vocab/ability'
import type { SpellResolution } from './schema'
import { getSpellResolutionAttackTypeLabel } from './vocab'

/** e.g. "Ranged spell attack" / "Constitution saving throw" / "Automatic" */
export function formatResolutionMethod(resolution: SpellResolution): string {
  const { method } = resolution
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
