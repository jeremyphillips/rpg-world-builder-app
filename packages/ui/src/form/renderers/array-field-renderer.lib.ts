import type { ArrayConfig } from '../field-config'

export function resolveLevelRangeKeys(
  arrayPattern: ArrayConfig['arrayPattern'],
): { min: string; max: string } | undefined {
  if (arrayPattern?.kind !== 'levelRange') return undefined

  const levelKeys = arrayPattern.levelKeys as { min?: string; max?: string } | undefined
  return {
    min: levelKeys?.min ?? 'minLevel',
    max: levelKeys?.max ?? 'maxLevel',
  }
}
