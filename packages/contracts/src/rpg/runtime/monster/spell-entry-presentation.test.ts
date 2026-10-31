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
import { formatMonsterLimitedUseHeading, formatMonsterSpellEntry } from './spell-entry-presentation'

const MONSTER_CHANGED = 'srd-cc-5.2.1:fireball'

const spellsById = monsterFixtureSpellLookup()
const spellsInBody = new Map([[SPELLCASTING_ACTION.id, SPELLCASTING_ACTION]])

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
    expect(rendered.bodyHtml).toContain('At Will: <em>Mage Hand</em>, <em>Detect Magic</em>')
    expect(rendered.bodyHtml).toContain('2/Day Each: <em>Fireball</em>, <em>Lightning Bolt</em>')
    expect(rendered.bodyHtml).toContain('1/Day: <em>Raise Dead</em>')
    expect(rendered.bodyHtml).not.toContain('At Will Each')
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
    expect(protective.bodyHtml).toContain(
      "The archmage casts <em>Counterspell</em> or <em>Shield</em> in response to the spell's trigger, using the same spellcasting ability as Spellcasting.",
    )

    const misty = formatMonsterSpellEntry({
      entry: MISTY_STEP_BONUS_ACTION,
      monsterName: 'Archmage',
      section: 'bonusActions',
      spellsById,
      catalogStatus: 'ready',
      spellsInBody,
    })
    expect(misty.bodyHtml).toContain(
      'The archmage casts <em>Misty Step</em>, using the same spellcasting ability as Spellcasting.',
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
    expect(changed.bodyHtml).toContain('Unavailable spell')
    expect(changed.bodyHtml).not.toContain('missing')
    expect(changed.bodyHtml).not.toContain('Mage Hand')
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
    ).toBe('Legendary Resistance (Proficiency Bonus/Long Rest)')
  })
})
