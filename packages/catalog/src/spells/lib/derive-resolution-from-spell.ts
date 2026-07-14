import {
  buildDefaultOutcomeSlots,
  spellResolutionSchema,
  spellSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
  stripEmptyOutcomeSlots,
  type Ability,
  type Spell,
  type SpellAtomicEffect,
  type SpellDamageEffect,
  type SpellHealingEffect,
  type SpellResolution,
  type SpellResolutionEffect,
  type SpellResolutionEffectId,
  type SpellResolutionMethod,
  type SpellResolutionTarget,
  type SpellResolutionTargetProximity,
  type SpellTemporaryHitPointsEffect,
} from '@rpg/contracts'

export type ResolutionDerivationOverrides = {
  method?: SpellResolutionMethod
  saveAbility?: Ability
  proximity?: SpellResolutionTargetProximity
  target?: {
    count?: number
    kind?: SpellResolutionTarget['kind']
    proximity?: SpellResolutionTargetProximity
  }
  outcomes?: SpellResolution['outcomes']
  /** @deprecated Use outcomes with a hit-branch note instead */
  hitNote?: string
  /** @deprecated Use proximity */
  range?: SpellResolutionTargetProximity
}

const DEFAULT_TARGET_KIND = 'creature-or-object' as const

const PRIMARY_RESOLUTION_EFFECT_KINDS = [
  'damage',
  'healing',
  'temporary-hit-points',
] as const satisfies readonly SpellAtomicEffect['kind'][]

type PrimaryResolutionEffectKind = (typeof PRIMARY_RESOLUTION_EFFECT_KINDS)[number]

type PrimaryResolutionEffect = Extract<SpellAtomicEffect, { kind: PrimaryResolutionEffectKind }>

/** First unlabeled roll-bearing effect — excludes hex-style extra-damage riders. */
export function findPrimaryDamageEffect(effects: Spell['effects']): SpellDamageEffect | undefined {
  const primary = findPrimaryResolutionEffect(effects)
  return primary?.kind === 'damage' ? primary : undefined
}

export function findPrimaryResolutionEffect(
  effects: Spell['effects'],
): PrimaryResolutionEffect | undefined {
  if (!effects?.length) return undefined

  return effects.find(
    (effect): effect is PrimaryResolutionEffect =>
      PRIMARY_RESOLUTION_EFFECT_KINDS.includes(effect.kind as PrimaryResolutionEffectKind) &&
      !('label' in effect && effect.label),
  )
}

function primaryEffectIdForKind(kind: PrimaryResolutionEffectKind): SpellResolutionEffectId {
  switch (kind) {
    case 'damage':
      return SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID
    case 'healing':
      return SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID
    case 'temporary-hit-points':
      return SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function buildResolutionEffect(primary: PrimaryResolutionEffect): SpellResolutionEffect {
  const id = primaryEffectIdForKind(primary.kind)

  switch (primary.kind) {
    case 'damage':
      return {
        id,
        kind: 'damage',
        roll: primary.roll,
        damageType: primary.damageType,
      }
    case 'healing':
      return {
        id,
        kind: 'healing',
        roll: (primary as SpellHealingEffect).roll,
      }
    case 'temporary-hit-points':
      return {
        id,
        kind: 'temporary-hit-points',
        roll: (primary as SpellTemporaryHitPointsEffect).roll,
      }
    default: {
      const _exhaustive: never = primary
      return _exhaustive
    }
  }
}

function mapDeliveryMethodToResolutionMethod(
  deliveryMethod: Spell['deliveryMethod'],
): SpellResolutionMethod | undefined {
  if (deliveryMethod === 'ranged-spell-attack') {
    return { kind: 'attack', attackType: 'ranged-spell' }
  }
  if (deliveryMethod === 'melee-spell-attack') {
    return { kind: 'attack', attackType: 'melee-spell' }
  }
  return undefined
}

function mapSpellRangeToTargetProximity(
  spellRange: Spell['range'],
  method: SpellResolutionMethod | undefined,
): SpellResolutionTargetProximity | undefined {
  switch (spellRange.kind) {
    case 'self':
      return { kind: 'self' }
    case 'touch':
      if (method?.kind === 'attack' && method.attackType === 'melee-spell') {
        return { kind: 'reach' }
      }
      return { kind: 'touch' }
    case 'distance':
      return {
        kind: 'distance',
        distance: { value: spellRange.value.value, unit: 'ft' },
      }
    default:
      return undefined
  }
}

function defaultMethodForPrimaryEffect(
  primary: PrimaryResolutionEffect,
  spell: Pick<Spell, 'deliveryMethod'>,
  overrides: ResolutionDerivationOverrides,
): SpellResolutionMethod | undefined {
  if (overrides.method) return overrides.method
  if (overrides.saveAbility) {
    return { kind: 'saving-throw', ability: overrides.saveAbility }
  }

  if (primary.kind === 'healing' || primary.kind === 'temporary-hit-points') {
    return { kind: 'automatic' }
  }

  return mapDeliveryMethodToResolutionMethod(spell.deliveryMethod)
}

function buildMethod(
  spell: Pick<Spell, 'deliveryMethod'>,
  overrides: ResolutionDerivationOverrides,
  primary: PrimaryResolutionEffect,
): SpellResolutionMethod | undefined {
  return defaultMethodForPrimaryEffect(primary, spell, overrides)
}

function buildTarget(
  spell: Pick<Spell, 'range'>,
  method: SpellResolutionMethod,
  overrides: ResolutionDerivationOverrides,
): SpellResolutionTarget {
  const proximityOverride = overrides.proximity ?? overrides.range ?? overrides.target?.proximity
  const proximity =
    proximityOverride ??
    mapSpellRangeToTargetProximity(spell.range, method) ??
    ({ kind: 'touch' } as const)

  return {
    count: overrides.target?.count ?? 1,
    kind: overrides.target?.kind ?? DEFAULT_TARGET_KIND,
    proximity,
  }
}

function buildOutcomes(
  method: SpellResolutionMethod,
  effectId: SpellResolutionEffectId,
  overrides: ResolutionDerivationOverrides,
): SpellResolution['outcomes'] {
  if (overrides.outcomes) return overrides.outcomes

  const defaults = buildDefaultOutcomeSlots(method, effectId)
  const hitNote = overrides.hitNote?.trim()

  if (method.kind === 'attack' && hitNote) {
    return stripEmptyOutcomeSlots(
      defaults.map((outcome) =>
        outcome.result === 'hit' ? { ...outcome, note: hitNote } : outcome,
      ),
    )
  }

  return stripEmptyOutcomeSlots(defaults)
}

/** Derives a contract resolution envelope from spell metadata and atomic effects. */
export function deriveResolutionFromSpell(
  spell: Pick<Spell, 'effects' | 'deliveryMethod' | 'range'>,
  overrides: ResolutionDerivationOverrides = {},
): SpellResolution {
  const primaryEffect = findPrimaryResolutionEffect(spell.effects)
  if (!primaryEffect) {
    throw new Error('Spell has no primary resolution effect for derivation.')
  }

  const resolutionEffect = buildResolutionEffect(primaryEffect)
  const method = buildMethod(spell, overrides, primaryEffect)
  if (!method) {
    throw new Error('Could not derive resolution method from spell metadata.')
  }

  const candidate = {
    target: buildTarget(spell, method, overrides),
    method,
    effects: [resolutionEffect],
    outcomes: buildOutcomes(method, resolutionEffect.id, overrides),
  }

  return spellResolutionSchema.parse(candidate)
}

/** Derives resolution and validates the full spell read model. */
export function deriveAndValidateSpellResolution(
  spell: Spell,
  overrides: ResolutionDerivationOverrides = {},
): SpellResolution {
  const resolution = deriveResolutionFromSpell(spell, overrides)
  spellSchema.parse({ ...spell, resolution })
  return resolution
}
