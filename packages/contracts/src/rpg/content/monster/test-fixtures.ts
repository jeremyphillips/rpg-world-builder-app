import type { SpellCastingTime } from '../../vocab/spell/casting-time'

const RULESET = 'srd-cc-5.2.1'

function castingTime(unit: SpellCastingTime['normal']['unit'], trigger?: string): SpellCastingTime {
  return {
    normal: {
      value: 1,
      unit,
      ...(trigger ? { trigger: { text: trigger } } : {}),
    },
    canBeCastAsRitual: false,
  }
}

function spell(
  slug: string,
  name: string,
  unit: SpellCastingTime['normal']['unit'],
  trigger?: string,
): { id: string; name: string; castingTime: SpellCastingTime } {
  return {
    id: `${RULESET}:${slug}`,
    name,
    castingTime: castingTime(unit, trigger),
  }
}

export const MONSTER_FIXTURE_SPELLS = {
  mageHand: spell('mage-hand', 'Mage Hand', 'action'),
  detectMagic: spell('detect-magic', 'Detect Magic', 'action'),
  fireball: spell('fireball', 'Fireball', 'action'),
  lightningBolt: spell('lightning-bolt', 'Lightning Bolt', 'action'),
  raiseDead: spell('raise-dead', 'Raise Dead', 'hour'),
  counterspell: spell(
    'counterspell',
    'Counterspell',
    'reaction',
    'when you see a creature within 60 feet of yourself casting a spell',
  ),
  shield: spell(
    'shield',
    'Shield',
    'reaction',
    'when you are hit by an attack roll or targeted by the Magic Missile spell',
  ),
  mistyStep: spell('misty-step', 'Misty Step', 'bonus-action'),
} as const

export function monsterFixtureSpellLookup(): Map<
  string,
  { name: string; castingTime: SpellCastingTime }
> {
  return new Map(
    Object.values(MONSTER_FIXTURE_SPELLS).map((entry) => [
      entry.id,
      { name: entry.name, castingTime: entry.castingTime },
    ]),
  )
}

const longRestUses = (value: number) =>
  ({
    kind: 'uses',
    count: { kind: 'fixed', value },
    recovery: { minimumRest: 'long' },
  }) as const

export const PROTECTION_REACTION = {
  id: 'protection',
  kind: 'special',
  name: 'Protection',
  trigger: { text: 'An attack hits the wearer of the amulet while within range.' },
  description: '<p>The wearer gains a +2 bonus to AC, potentially causing the attack to miss.</p>',
} as const

export const RECHARGE_ACTIONS = [4, 5, 6].map((minRoll) => ({
  id: `recharge-${minRoll}`,
  kind: 'special' as const,
  name: 'Breath Weapon',
  description: '<p>Exhales.</p>',
  limitedUse: { kind: 'recharge' as const, minRoll },
}))

export const SHORT_REST_ACTION = {
  id: 'short-rest',
  kind: 'special' as const,
  name: 'Recovery',
  description: '<p>Recovers.</p>',
  limitedUse: {
    kind: 'uses' as const,
    count: { kind: 'fixed' as const, value: 1 },
    recovery: { minimumRest: 'short' as const },
  },
}

export const PROFICIENCY_BONUS_ACTION = {
  id: 'pb',
  kind: 'special' as const,
  name: 'Relentless',
  description: '<p>Succeeds instead.</p>',
  limitedUse: {
    kind: 'uses' as const,
    count: { kind: 'proficiency-bonus' as const },
    recovery: { minimumRest: 'long' as const },
  },
}

export const SPELLCASTING_ACTION = {
  id: 'spellcasting',
  kind: 'spell' as const,
  name: 'Spellcasting',
  castingAbility: { kind: 'ability' as const, ability: 'int' as const },
  omittedComponents: ['material' as const],
  spells: [
    { spellId: MONSTER_FIXTURE_SPELLS.mageHand.id },
    { spellId: MONSTER_FIXTURE_SPELLS.detectMagic.id },
    { spellId: MONSTER_FIXTURE_SPELLS.fireball.id, limitedUse: longRestUses(2) },
    { spellId: MONSTER_FIXTURE_SPELLS.lightningBolt.id, limitedUse: longRestUses(2) },
    { spellId: MONSTER_FIXTURE_SPELLS.raiseDead.id, limitedUse: longRestUses(1) },
  ],
}

export const PROTECTIVE_MAGIC_REACTION = {
  id: 'protective-magic',
  kind: 'spell' as const,
  name: 'Protective Magic',
  castingAbility: { kind: 'shared' as const, entryId: 'spellcasting' },
  limitedUse: longRestUses(3),
  spells: [
    { spellId: MONSTER_FIXTURE_SPELLS.counterspell.id },
    { spellId: MONSTER_FIXTURE_SPELLS.shield.id },
  ],
}

export const MISTY_STEP_BONUS_ACTION = {
  id: 'misty-step',
  kind: 'spell' as const,
  name: 'Misty Step',
  castingAbility: { kind: 'shared' as const, entryId: 'spellcasting' },
  spells: [{ spellId: MONSTER_FIXTURE_SPELLS.mistyStep.id }],
}

export const SHIELD_CONDITION_REACTION = {
  id: 'shield-condition',
  kind: 'spell' as const,
  name: 'Shield',
  castingAbility: { kind: 'shared' as const, entryId: 'spellcasting' },
  trigger: { text: 'The archmage can see the attacker.' },
  spells: [{ spellId: MONSTER_FIXTURE_SPELLS.shield.id }],
}
