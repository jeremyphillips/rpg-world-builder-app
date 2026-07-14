import {
  spellResolutionSchema,
  spellSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  type Ability,
  type Spell,
  type SpellDamageEffect,
  type SpellResolution,
  type SpellResolutionMethod,
  type SpellResolutionRange,
  type SpellResolutionTarget,
} from '@rpg/contracts'

export type ResolutionDerivationOverrides = {
  method?: SpellResolutionMethod
  saveAbility?: Ability
  range?: SpellResolutionRange
  target?: SpellResolutionTarget
  hitNote?: string
  outcomes?: SpellResolution['outcomes']
}

const DEFAULT_TARGET: SpellResolutionTarget = {
  count: 1,
  kind: 'creature-or-object',
}

/** First unlabeled damage effect — excludes hex-style extra-damage riders. */
export function findPrimaryDamageEffect(effects: Spell['effects']): SpellDamageEffect | undefined {
  if (!effects?.length) return undefined

  return effects.find(
    (effect): effect is SpellDamageEffect => effect.kind === 'damage' && !effect.label,
  )
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

function mapSpellRangeToResolutionRange(
  spellRange: Spell['range'],
  method: SpellResolutionMethod | undefined,
): SpellResolutionRange | undefined {
  switch (spellRange.kind) {
    case 'touch':
      if (method?.kind === 'attack' && method.attackType === 'melee-spell') {
        return { kind: 'reach' }
      }
      return { kind: 'touch' }
    case 'distance':
      return {
        kind: 'distance',
        value: { value: spellRange.value.value, unit: 'ft' },
      }
    default:
      return undefined
  }
}

function buildMethod(
  spell: Pick<Spell, 'deliveryMethod'>,
  overrides: ResolutionDerivationOverrides,
): SpellResolutionMethod | undefined {
  if (overrides.method) return overrides.method
  if (overrides.saveAbility) {
    return { kind: 'saving-throw', ability: overrides.saveAbility }
  }
  return mapDeliveryMethodToResolutionMethod(spell.deliveryMethod)
}

function buildAttackOutcomes(hitNote: string | undefined): SpellResolution['outcomes'] {
  return [
    {
      result: 'hit',
      applications: [
        {
          effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          amount: 'full',
        },
      ],
      ...(hitNote ? { note: hitNote } : {}),
    },
  ]
}

function buildSavingThrowDamageOutcomes(): SpellResolution['outcomes'] {
  return [
    {
      result: 'failed-save',
      applications: [
        {
          effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          amount: 'full',
        },
      ],
    },
    {
      result: 'successful-save',
      applications: [
        {
          effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          amount: 'half',
        },
      ],
    },
  ]
}

function buildOutcomes(
  method: SpellResolutionMethod,
  overrides: ResolutionDerivationOverrides,
): SpellResolution['outcomes'] {
  if (overrides.outcomes) return overrides.outcomes

  if (method.kind === 'attack') {
    const note = overrides.hitNote?.trim()
    return buildAttackOutcomes(note || undefined)
  }

  return buildSavingThrowDamageOutcomes()
}

/** Derives a contract resolution envelope from spell metadata and atomic effects. */
export function deriveResolutionFromSpell(
  spell: Pick<Spell, 'effects' | 'deliveryMethod' | 'range'>,
  overrides: ResolutionDerivationOverrides = {},
): SpellResolution {
  const primaryEffect = findPrimaryDamageEffect(spell.effects)
  if (!primaryEffect) {
    throw new Error('Spell has no primary damage effect for resolution derivation.')
  }

  const method = buildMethod(spell, overrides)
  if (!method) {
    throw new Error('Could not derive resolution method from spell metadata.')
  }

  const range = overrides.range ?? mapSpellRangeToResolutionRange(spell.range, method)
  if (!range) {
    throw new Error('Could not derive resolution range from spell metadata.')
  }

  const candidate = {
    target: overrides.target ?? DEFAULT_TARGET,
    method,
    range,
    effects: [
      {
        id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
        kind: 'damage' as const,
        roll: primaryEffect.roll,
        damageType: primaryEffect.damageType,
      },
    ],
    outcomes: buildOutcomes(method, overrides),
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
