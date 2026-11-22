import { describe, expect, it } from 'vitest'

import {
  MISTY_STEP_BONUS_ACTION,
  PROFICIENCY_BONUS_ACTION,
  PROTECTIVE_MAGIC_REACTION,
  RECHARGE_ACTIONS,
  SHORT_REST_ACTION,
  SPELLCASTING_ACTION,
  monsterFixtureSpellLookup,
} from '../../content/monster/test-fixtures'
import {
  formatMonsterLimitedUseHeading,
  formatMonsterSpellEntry,
  formatOnceUntilNextTurnSentence,
} from './spell-entry-presentation'
import { joinStatBlockProseDocument } from './stat-block-prose'
import type { MonsterReferencedSpell } from './reaction-trigger'

const MONSTER_CHANGED = 'srd-cc-5.2.1:fireball'

const spellsById = monsterFixtureSpellLookup()
const spellsInBody = new Map([[SPELLCASTING_ACTION.id, SPELLCASTING_ACTION]])

function spellEntryBody(rendered: ReturnType<typeof formatMonsterSpellEntry>): string {
  return joinStatBlockProseDocument(rendered.bodyProse)
}

describe('formatMonsterSpellEntry', () => {
  it('renders spellcasting groups from structure, including Each only for multiple spells', () => {
    const rendered = formatMonsterSpellEntry({
      entry: SPELLCASTING_ACTION,
      monsterName: 'Archmage',
      section: 'actions',
      spellsById,
      catalogStatus: 'ready',
      spellsInBody,
    })
    expect(spellEntryBody(rendered)).toContain('At Will: Mage Hand, Detect Magic')
    expect(spellEntryBody(rendered)).toContain('2/Day Each: Fireball, Lightning Bolt')
    expect(spellEntryBody(rendered)).toContain('1/Day: Raise Dead')
    expect(spellEntryBody(rendered)).not.toContain('At Will Each')
    expect(spellEntryBody(rendered)).not.toContain('spell save DC')
  })

  it('prints a derived save DC only when a listed spell resolves with a saving throw', () => {
    const fireballId = 'srd-cc-5.2.1:fireball'
    const withSave = new Map(spellsById)
    const fireball = withSave.get(fireballId)
    expect(fireball).toBeDefined()
    withSave.set(fireballId, {
      ...fireball!,
      resolution: { method: { kind: 'saving-throw' } },
    })
    const rendered = formatMonsterSpellEntry({
      entry: { ...SPELLCASTING_ACTION, omittedComponents: undefined },
      monsterName: 'Mage',
      section: 'actions',
      spellsById: withSave,
      catalogStatus: 'ready',
      spellsInBody,
      saveDc: 14,
    })
    expect(spellEntryBody(rendered)).toContain(
      'The mage casts one of the following spells, using Intelligence as the spellcasting ability (spell save DC 14):',
    )

    const shared = formatMonsterSpellEntry({
      entry: MISTY_STEP_BONUS_ACTION,
      monsterName: 'Mage',
      section: 'bonusActions',
      spellsById: withSave,
      catalogStatus: 'ready',
      spellsInBody,
      saveDc: 14,
    })
    expect(spellEntryBody(shared)).not.toContain('spell save DC')
    expect(spellEntryBody(shared)).toContain('using the same spellcasting ability as Spellcasting')
  })

  it('renders grouped spellcasting intro with material-only omissions', () => {
    const fireballId = 'srd-cc-5.2.1:fireball'
    const withSave = new Map(spellsById)
    const fireball = withSave.get(fireballId)
    expect(fireball).toBeDefined()
    withSave.set(fireballId, {
      ...fireball!,
      resolution: { method: { kind: 'saving-throw' } },
    })
    const rendered = formatMonsterSpellEntry({
      entry: {
        ...SPELLCASTING_ACTION,
        omittedComponents: ['material'],
      },
      monsterName: 'Ancient Red Dragon',
      section: 'actions',
      spellsById: withSave,
      catalogStatus: 'ready',
      spellsInBody,
      saveDc: 19,
    })
    expect(spellEntryBody(rendered)).toContain(
      'The ancient red dragon casts one of the following spells, requiring no Material components and using Intelligence as the spellcasting ability (spell save DC 19):',
    )
  })

  it('renders Protective Magic and Misty Step from structure', () => {
    const protective = formatMonsterSpellEntry({
      entry: PROTECTIVE_MAGIC_REACTION,
      monsterName: 'Archmage',
      section: 'reactions',
      spellsById,
      catalogStatus: 'ready',
      spellsInBody,
    })
    expect(protective.heading).toBe('Protective Magic (3/Day)')
    expect(spellEntryBody(protective)).toContain(
      "The archmage casts Counterspell or Shield in response to the spell's trigger, using the same spellcasting ability as Spellcasting.",
    )

    const misty = formatMonsterSpellEntry({
      entry: MISTY_STEP_BONUS_ACTION,
      monsterName: 'Archmage',
      section: 'bonusActions',
      spellsById,
      catalogStatus: 'ready',
      spellsInBody,
    })
    expect(spellEntryBody(misty)).toContain(
      'The archmage casts Misty Step, using the same spellcasting ability as Spellcasting.',
    )
  })

  it('re-renders when spell ids or limited use change and hides unresolved names', () => {
    const changed = formatMonsterSpellEntry({
      entry: {
        ...SPELLCASTING_ACTION,
        spells: [
          { spellId: 'missing', limitedUse: SPELLCASTING_ACTION.spells[2]?.limitedUse },
          { spellId: MONSTER_CHANGED, limitedUse: SPELLCASTING_ACTION.spells[2]?.limitedUse },
        ],
      },
      monsterName: 'Archmage',
      section: 'actions',
      spellsById,
      catalogStatus: 'ready',
      spellsInBody,
    })
    expect(spellEntryBody(changed)).toContain('Unavailable spell')
    expect(spellEntryBody(changed)).not.toContain('missing')
    expect(spellEntryBody(changed)).not.toContain('Mage Hand')
  })

  it('uses the spellcasting entry name without repeating its ability', () => {
    const rendered = formatMonsterSpellEntry({
      entry: {
        ...SPELLCASTING_ACTION,
        id: 'fiery',
        name: 'Fiery Rays',
        spellInvocation: 'use-entry',
        castingAbility: { kind: 'shared', entryId: SPELLCASTING_ACTION.id },
        spells: [{ spellId: 'srd-cc-5.2.1:fireball', castAtLevel: 5 }],
      },
      monsterName: 'Ancient Red Dragon',
      section: 'legendaryActions',
      spellsById,
      catalogStatus: 'ready',
      spellsInBody,
    })
    expect(spellEntryBody(rendered)).toContain('The ancient red dragon uses Spellcasting to cast')
    expect(spellEntryBody(rendered)).toContain('(level 5 version)')
    expect(spellEntryBody(rendered)).not.toContain('spellcasting ability')
  })

  it('prints legendary spell categories from structure', () => {
    const commandId = 'srd-cc-5.2.1:command'
    const catalogSpells = new Map<string, MonsterReferencedSpell>(spellsById)
    catalogSpells.set('srd-cc-5.2.1:fear', {
      name: 'Fear',
      castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
      resolution: { method: { kind: 'saving-throw' } },
    })
    catalogSpells.set(commandId, {
      name: 'Command',
      castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
      level: 1,
    })
    const spellcasting = {
      ...SPELLCASTING_ACTION,
      spells: [...SPELLCASTING_ACTION.spells, { spellId: commandId, castAtLevel: 2 }],
    }
    const spells = new Map([[spellcasting.id, spellcasting]])

    const gaze = formatMonsterSpellEntry({
      entry: {
        id: 'gaze',
        kind: 'spell',
        name: 'Frightening Gaze',
        castingAbility: { kind: 'shared', entryId: spellcasting.id },
        spells: [{ spellId: 'srd-cc-5.2.1:fear' }],
        onceUntilNextTurn: true,
      },
      monsterName: 'Mummy Lord',
      section: 'legendaryActions',
      spellsById: catalogSpells,
      catalogStatus: 'ready',
      spellsInBody: spells,
    })
    expect(spellEntryBody(gaze)).toContain(
      'The mummy lord casts Fear, using the same spellcasting ability as Spellcasting.',
    )
    expect(formatOnceUntilNextTurnSentence({ monsterName: 'Mummy Lord', kind: 'spell' })).toBe(
      "The mummy lord can't take this action again until the start of its next turn.",
    )

    const presence = formatMonsterSpellEntry({
      entry: {
        id: 'presence',
        kind: 'spell',
        name: 'Commanding Presence',
        spellInvocation: 'use-entry',
        castingAbility: { kind: 'shared', entryId: spellcasting.id },
        spells: [{ spellId: commandId, castAtLevel: 2 }],
      },
      monsterName: 'Ancient Red Dragon',
      section: 'legendaryActions',
      spellsById: catalogSpells,
      catalogStatus: 'ready',
      spellsInBody: spells,
    })
    expect(spellEntryBody(presence)).toContain(
      'The ancient red dragon uses Spellcasting to cast Command (level 2 version).',
    )

    const inherited = formatMonsterSpellEntry({
      entry: {
        id: 'inherited',
        kind: 'spell',
        name: 'Commanding Presence',
        spellInvocation: 'use-entry',
        castingAbility: { kind: 'shared', entryId: spellcasting.id },
        spells: [{ spellId: commandId }],
      },
      monsterName: 'Ancient Red Dragon',
      section: 'legendaryActions',
      spellsById: catalogSpells,
      catalogStatus: 'ready',
      spellsInBody: spells,
    })
    expect(spellEntryBody(inherited)).toContain('(level 2 version)')

    const dread = formatMonsterSpellEntry({
      entry: {
        id: 'dread',
        kind: 'spell',
        name: 'Dread Command',
        castingAbility: { kind: 'shared', entryId: spellcasting.id },
        spells: [{ spellId: commandId, castAtLevel: 2 }],
      },
      monsterName: 'Ancient Red Dragon',
      section: 'legendaryActions',
      spellsById: catalogSpells,
      catalogStatus: 'ready',
      spellsInBody: spells,
    })
    expect(spellEntryBody(dread)).toContain(
      'The ancient red dragon casts Command (level 2 version), using the same spellcasting ability as Spellcasting.',
    )

    const beguileSpells = new Map(catalogSpells)
    beguileSpells.set('srd-cc-5.2.1:charm-person', {
      name: 'Charm Person',
      castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
      resolution: { method: { kind: 'saving-throw' } },
    })
    const beguile = formatMonsterSpellEntry({
      entry: {
        id: 'beguile',
        kind: 'spell',
        name: 'Beguile',
        castingAbility: { kind: 'ability', ability: 'cha' },
        omittedComponents: ['verbal', 'somatic', 'material'],
        spells: [{ spellId: 'srd-cc-5.2.1:charm-person' }],
      },
      monsterName: 'Vampire',
      section: 'legendaryActions',
      spellsById: beguileSpells,
      catalogStatus: 'ready',
      spellsInBody: spells,
      saveDc: 17,
    })
    expect(spellEntryBody(beguile)).toContain('spell save DC 17')
    expect(spellEntryBody(beguile)).toContain('requiring no spell components')
  })
})

describe('formatMonsterLimitedUseHeading', () => {
  it('renders recharge, short rest, and proficiency bonus notation', () => {
    expect(formatMonsterLimitedUseHeading('Breath Weapon', RECHARGE_ACTIONS[0]?.limitedUse)).toBe(
      'Breath Weapon (Recharge 4–6)',
    )
    expect(formatMonsterLimitedUseHeading('Breath Weapon', RECHARGE_ACTIONS[1]?.limitedUse)).toBe(
      'Breath Weapon (Recharge 5–6)',
    )
    expect(formatMonsterLimitedUseHeading('Breath Weapon', RECHARGE_ACTIONS[2]?.limitedUse)).toBe(
      'Breath Weapon (Recharge 6)',
    )
    expect(
      formatMonsterLimitedUseHeading(SHORT_REST_ACTION.name, SHORT_REST_ACTION.limitedUse),
    ).toBe('Recovery (Recharges after a Short or Long Rest)')
    expect(
      formatMonsterLimitedUseHeading(
        PROFICIENCY_BONUS_ACTION.name,
        PROFICIENCY_BONUS_ACTION.limitedUse,
      ),
    ).toBe('Relentless (Proficiency Bonus/Long Rest)')
  })
})
