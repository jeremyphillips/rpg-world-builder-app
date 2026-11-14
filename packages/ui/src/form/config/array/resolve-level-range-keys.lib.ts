import type { ArrayPatternConfig } from '../../field-config'

/** Default min/max field keys for `arrayPattern.kind === 'levelRange'`. */
export function resolveLevelRangeKeys(arrayPattern: ArrayPatternConfig | undefined): {
  min: string
  max: string
} {
  if (arrayPattern?.kind !== 'levelRange') {
    return { min: 'minLevel', max: 'maxLevel' }
  }

  const levelKeys = arrayPattern.levelKeys as { min?: string; max?: string } | undefined
  return {
    min: levelKeys?.min ?? 'minLevel',
    max: levelKeys?.max ?? 'maxLevel',
  }
}
