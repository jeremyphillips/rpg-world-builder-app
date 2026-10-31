import { getAbilityLabel } from '../../../vocab/ability'
import type { EffectResolutionMethod } from './schema'

export type ResolutionMethodFormatRegister = 'authoring' | 'resolution-preview'

/** e.g. "Constitution saving throw" / "Automatic" / "No check required". */
export function formatEffectResolutionMethod(
  resolution: { method: EffectResolutionMethod },
  register: ResolutionMethodFormatRegister = 'authoring',
): string {
  const { method } = resolution
  if (register === 'resolution-preview' && method.kind === 'automatic') {
    return 'No check required'
  }

  switch (method.kind) {
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
