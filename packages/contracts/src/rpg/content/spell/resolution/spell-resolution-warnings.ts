import type { AreaGeometry } from '../../../primitives/area-geometry'
import type { SpellResolution } from './schema'

export type SpellResolutionAreaMismatchWarning = {
  code: 'spell-resolution-area-mismatch'
  spellArea: AreaGeometry
  resolutionArea: AreaGeometry
}

/** Non-blocking authoring warning when spell-level and resolution areas differ. */
export function getSpellResolutionAreaMismatchWarning(spell: {
  areaOfEffect?: AreaGeometry | null
  resolution?: SpellResolution | null
}): SpellResolutionAreaMismatchWarning | undefined {
  const spellArea = spell.areaOfEffect
  const resolutionArea = spell.resolution?.areaOfEffect
  if (!spellArea || !resolutionArea) return undefined

  if (JSON.stringify(spellArea) === JSON.stringify(resolutionArea)) return undefined

  return {
    code: 'spell-resolution-area-mismatch',
    spellArea,
    resolutionArea,
  }
}
