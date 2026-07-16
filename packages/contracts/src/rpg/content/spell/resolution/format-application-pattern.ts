import type {
  SpellApplicationPattern,
  SpellApplicationPatternProjectiles,
  SpellResolution,
} from './schema'

const DEFAULT_PROJECTILE_UNIT_LABEL = {
  singular: 'projectile',
  plural: 'projectiles',
} as const

function resolveProjectilesUnitLabel(pattern: SpellApplicationPatternProjectiles): {
  singular: string
  plural: string
} {
  return pattern.unitLabel ?? DEFAULT_PROJECTILE_UNIT_LABEL
}

/** e.g. "Creates 3 darts." */
export function formatResolutionProjectilesPreview(
  pattern: SpellApplicationPatternProjectiles,
): string {
  const count = pattern.count.value
  const { singular, plural } = resolveProjectilesUnitLabel(pattern)
  const word = count === 1 ? singular : plural
  return `Creates ${count} ${word}.`
}

/** Supporting label for the Effects section — e.g. "Applied once" / "Applied per dart". */
export function formatResolutionEffectsApplicationLabel(
  resolution: Pick<SpellResolution, 'applicationPattern'>,
): string {
  const pattern = resolution.applicationPattern
  if (!pattern || pattern.kind !== 'projectiles') {
    return 'Applied once'
  }

  const { singular } = resolveProjectilesUnitLabel(pattern)
  return `Applied per ${singular}`
}

/** Formats an application pattern for preview panels. */
export function formatResolutionApplicationPattern(
  pattern: SpellApplicationPattern | undefined,
): string {
  if (pattern?.kind === 'projectiles') {
    return formatResolutionProjectilesPreview(pattern)
  }
  return ''
}
