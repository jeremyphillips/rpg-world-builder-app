import {
  formatEffectRowSentence,
  formatEffectRowTitleFromParts,
  type SpellAtomicEffectKind,
  type SpellDamageEffect,
  type SpellHealingEffect,
  type SpellTemporaryHitPointsEffect,
} from '@rpg/contracts'

/** Returns a grant-style primary title for a resolution effect array item header. */
export function formatResolutionEffectRowPrimary(
  values: Record<string, unknown>,
  index: number,
): string | undefined {
  const kind = values.kind
  return formatEffectRowTitleFromParts(
    typeof kind === 'string' ? (kind as SpellAtomicEffectKind) : undefined,
    { label: values.label, unitLabel: values.unitLabel },
    index,
  )
}

function toDamageEffect(values: Record<string, unknown>): SpellDamageEffect | undefined {
  if (values.kind !== 'damage' || !values.roll || !values.damageType) return undefined
  return {
    id: String(values.id ?? ''),
    kind: 'damage',
    roll: values.roll as SpellDamageEffect['roll'],
    damageType: String(values.damageType),
  }
}

function toHealingEffect(values: Record<string, unknown>): SpellHealingEffect | undefined {
  if (values.kind !== 'healing' || !values.roll) return undefined
  return {
    id: String(values.id ?? ''),
    kind: 'healing',
    roll: values.roll as SpellHealingEffect['roll'],
  }
}

function toTemporaryHitPointsEffect(
  values: Record<string, unknown>,
): SpellTemporaryHitPointsEffect | undefined {
  if (values.kind !== 'temporary-hit-points' || !values.roll) return undefined
  return {
    id: String(values.id ?? ''),
    kind: 'temporary-hit-points',
    roll: values.roll as SpellTemporaryHitPointsEffect['roll'],
  }
}

/** Returns a grant-style summary sentence for a resolution effect array item header. */
export function formatResolutionEffectRowSummary(values: Record<string, unknown>): string {
  const damage = toDamageEffect(values)
  if (damage) return formatEffectRowSentence(damage)

  const healing = toHealingEffect(values)
  if (healing) return formatEffectRowSentence(healing)

  const temporaryHitPoints = toTemporaryHitPointsEffect(values)
  if (temporaryHitPoints) return formatEffectRowSentence(temporaryHitPoints)

  return ''
}
