import type { Spell } from '../body'
import type { ResolutionSelectionMode } from '../../../vocab/resolution'

type SpellResolutionDistance = { value: number; unit: 'ft' }

type ResolutionOrigin = {
  proximity: { kind: 'distance'; distance: SpellResolutionDistance }
}

export type InferPointResolutionFromSpellInput = Pick<Spell, 'range' | 'areaOfEffect'> & {
  method: { kind: string }
}

/**
 * Catalog derivation helper — infers point selection from spell metadata.
 * Preview formatters treat stored resolution fields as authoritative.
 */
export function inferPointSelectionModeFromSpell(
  spell: InferPointResolutionFromSpellInput,
): ResolutionSelectionMode | undefined {
  if (spell.range.kind !== 'distance') return undefined
  if (!spell.areaOfEffect) return undefined
  if (spell.method.kind !== 'saving-throw') return undefined
  return 'point'
}

/** Builds a default origin from spell range distance for point-mode derivation. */
export function defaultOriginFromSpellRange(
  spell: Pick<Spell, 'range'>,
): ResolutionOrigin | undefined {
  if (spell.range.kind !== 'distance') return undefined
  return {
    proximity: {
      kind: 'distance',
      distance: { value: spell.range.value.value, unit: 'ft' },
    },
  }
}
