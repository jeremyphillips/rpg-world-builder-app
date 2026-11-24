import {
  availableBodyRows,
  joinStatBlockProseDocument,
  MONSTER_ACTION_KIND_ENTRIES,
  monsterActionSchema,
  monsterActionSectionRows,
  systemDefaultArmorClassRules,
  type MonsterLegendaryAction,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickMonster, pickSkillProficiency, pickSpell } from '@/test/fixtures/pick'

import { buildMonsterDetailViewModel, tryDeriveMonsterStatBlock } from '../monster-display'

import {
  buildSpellDisplayContext,
  resolveActionStatBlockRulesFacing,
  resolveActionStatBlockRulesFacingList,
} from './resolve-action-stat-block-rules-facing'

const TURN_LIMIT_SENTENCE = "can't take this action again until the start of its next turn"
const SAVE_OPENING = 'Constitution Saving Throw: DC 20'

describe('resolveActionStatBlockRulesFacing', () => {
  it('composes the spell turn limit once and preserves the authored notes', () => {
    const monster = pickMonster('hell-hound')
    const spell = pickSpell('fireball')
    const description = '<p>Supplemental text.</p>'
    const action = monsterActionSchema.parse({
      id: 'spell-with-notes',
      kind: 'spell',
      name: 'Spell with notes',
      castingAbility: { kind: 'ability', ability: 'int' },
      spells: [{ spellId: spell.id }],
      onceUntilNextTurn: true,
      description,
    })
    const context = buildSpellDisplayContext({
      monster,
      catalogState: 'ready',
      equipmentById: new Map(),
      spellsById: new Map([[spell.id, spell]]),
      spellCatalogStatus: 'ready',
      magicPropertyProvider: () => undefined,
    })

    const result = resolveActionStatBlockRulesFacing(
      action,
      'actions',
      null,
      'ready',
      context,
      new Map(),
    )

    expect(JSON.stringify(result.rulesProse).split(TURN_LIMIT_SENTENCE)).toHaveLength(2)
    expect(result.descriptionHtml).toBe(description)
  })

  it('matches detail view model rules-facing fields for hell hound multiattack', () => {
    const monster = pickMonster('hell-hound')
    const derived = tryDeriveMonsterStatBlock(monster, [], [pickSkillProficiency('perception')], {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    expect(derived).not.toBeNull()

    const spellContext = buildSpellDisplayContext({
      monster,
      equipmentById: new Map(),
      catalogState: 'ready',
      magicPropertyProvider: () => undefined,
    })
    const actions = availableBodyRows(monster.actions)
    const facing = resolveActionStatBlockRulesFacingList(
      actions,
      'actions',
      derived,
      'ready',
      spellContext,
    ).find((row) => row.id === 'multiattack')

    const detail = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Fiend',
      equipmentById: new Map(),
      catalogState: 'ready',
      derived,
    }).actions.find((row) => row.id === 'multiattack')

    expect(facing?.name).toBe(detail?.name)
    expect(facing?.descriptionHtml).toBe(detail?.descriptionHtml)
    expect(facing?.descriptionHtml).toContain('hell hound makes two Bite attacks')
  })

  it('does not format non-attack kinds as attack sentences', () => {
    const monster = pickMonster('hell-hound')
    const derived = tryDeriveMonsterStatBlock(monster, [], [], {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    const spellContext = buildSpellDisplayContext({
      monster,
      equipmentById: new Map(),
      catalogState: 'ready',
      magicPropertyProvider: () => undefined,
    })
    for (const kind of Object.keys(MONSTER_ACTION_KIND_ENTRIES)) {
      if (kind === 'weapon' || kind === 'natural-weapon' || kind === 'attack') continue
      const row = [
        ...availableBodyRows(monster.actions),
        ...availableBodyRows(monster.bonusActions),
        ...availableBodyRows(monster.reactions),
      ].find((action) => action.kind === kind)
      if (!row) continue
      const facing = resolveActionStatBlockRulesFacing(
        row,
        'actions',
        derived,
        'ready',
        spellContext,
        new Map(),
      )
      const attackPrefix =
        facing.attackLine?.startsWith('Melee') || facing.attackLine?.startsWith('Ranged')
      expect(attackPrefix).not.toBe(true)
    }
  })

  it('matches detail attack lines for kobold weapon actions', () => {
    const monster = pickMonster('kobold-warrior')
    const derived = tryDeriveMonsterStatBlock(monster, [], [], {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    const spellContext = buildSpellDisplayContext({
      monster,
      equipmentById: new Map(),
      catalogState: 'ready',
      magicPropertyProvider: () => undefined,
    })
    const dagger = resolveActionStatBlockRulesFacing(
      availableBodyRows(monster.actions).find((row) => row.id === 'dagger')!,
      'actions',
      derived,
      'ready',
      spellContext,
      new Map(),
    )
    const detail = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'ready',
      derived,
    }).actions.find((row) => row.id === 'dagger')
    expect(dagger.name).toBe(detail?.name)
    expect(dagger.attackLine).toBe(detail?.attackLine)
  })
})

function lichSpellContext(monster: ReturnType<typeof pickMonster>) {
  return buildSpellDisplayContext({
    monster,
    equipmentById: new Map(),
    catalogState: 'ready',
    magicPropertyProvider: () => undefined,
  })
}

function lichDerived(monster: ReturnType<typeof pickMonster>) {
  return tryDeriveMonsterStatBlock(monster, [], [pickSkillProficiency('perception')], {
    armorClassRules: systemDefaultArmorClassRules(),
  })
}

describe('mapSaveActionFacing', () => {
  it('omits descriptionHtml when structured rules exist without authored description (disrupt life)', () => {
    const monster = pickMonster('lich')
    const derived = lichDerived(monster)
    const spellContext = lichSpellContext(monster)
    const disrupt = monsterActionSectionRows<MonsterLegendaryAction>(
      monster,
      'legendaryActions',
    ).find((row) => row.id === 'disrupt-life')
    expect(disrupt?.kind).toBe('save')

    const facing = resolveActionStatBlockRulesFacing(
      disrupt!,
      'legendaryActions',
      derived,
      'ready',
      spellContext,
      new Map(),
    )

    expect(facing.rulesProse?.length).toBeGreaterThan(0)
    expect(facing.descriptionHtml).toBeUndefined()
    const plain = joinStatBlockProseDocument(facing.rulesProse ?? [])
    expect(plain).toContain(SAVE_OPENING)
    expect(plain).toContain("each creature that isn't an Undead in a 20-foot Emanation")
    expect(plain).toContain(TURN_LIMIT_SENTENCE)
  })

  it('keeps supplemental descriptionHtml when structured save rules exist', () => {
    const monster = pickMonster('lich')
    const derived = lichDerived(monster)
    const spellContext = lichSpellContext(monster)
    const disrupt = monsterActionSectionRows<MonsterLegendaryAction>(
      monster,
      'legendaryActions',
    ).find((row) => row.id === 'disrupt-life')
    expect(disrupt?.kind).toBe('save')
    const supplemental = '<p>Siphons vitality from nearby creatures.</p>'
    const action = { ...disrupt!, description: supplemental }

    const facing = resolveActionStatBlockRulesFacing(
      action,
      'legendaryActions',
      derived,
      'ready',
      spellContext,
      new Map(),
    )

    expect(facing.rulesProse?.length).toBeGreaterThan(0)
    expect(facing.descriptionHtml).toBe(supplemental)
    const plain = joinStatBlockProseDocument(facing.rulesProse ?? [])
    expect(plain).not.toContain('Siphons vitality')
    expect(plain).not.toContain(supplemental)
  })

  it('preserves published saving throw rules when equipment is unavailable', () => {
    const monster = pickMonster('hell-hound')
    const breath = availableBodyRows(monster.actions).find((row) => row.id === 'fire-breath')
    if (!breath) throw new Error('Missing Fire Breath fixture')

    const ready = resolveActionStatBlockRulesFacing(
      breath,
      'actions',
      lichDerived(monster),
      'ready',
      lichSpellContext(monster),
      new Map(),
    )
    const unavailable = resolveActionStatBlockRulesFacing(
      breath,
      'actions',
      null,
      'error',
      lichSpellContext(monster),
      new Map(),
    )

    expect(joinStatBlockProseDocument(unavailable.rulesProse ?? [])).toContain('Saving Throw')
    expect(unavailable.rulesProse).toEqual(ready.rulesProse)
  })

  it('includes the turn-limit sentence once in structured rules for save actions', () => {
    const monster = pickMonster('lich')
    const derived = lichDerived(monster)
    const spellContext = lichSpellContext(monster)
    const disrupt = monsterActionSectionRows<MonsterLegendaryAction>(
      monster,
      'legendaryActions',
    ).find((row) => row.id === 'disrupt-life')!

    const facing = resolveActionStatBlockRulesFacing(
      disrupt,
      'legendaryActions',
      derived,
      'ready',
      spellContext,
      new Map(),
    )

    const plain = joinStatBlockProseDocument(facing.rulesProse ?? [])
    expect(plain.match(new RegExp(TURN_LIMIT_SENTENCE, 'gi'))?.length).toBe(1)
    expect(facing.descriptionHtml ?? '').not.toContain(TURN_LIMIT_SENTENCE)
  })

  it('matches detail view model save facing for actions and legendary actions', () => {
    const monster = pickMonster('lich')
    const derived = lichDerived(monster)
    const spellContext = lichSpellContext(monster)
    const disrupt = monsterActionSectionRows<MonsterLegendaryAction>(
      monster,
      'legendaryActions',
    ).find((row) => row.id === 'disrupt-life')!
    const facing = resolveActionStatBlockRulesFacing(
      disrupt,
      'legendaryActions',
      derived,
      'ready',
      spellContext,
      new Map(),
    )
    const detail = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Undead',
      equipmentById: new Map(),
      catalogState: 'ready',
      derived,
    }).legendaryActions.find((row) => row.id === 'disrupt-life')

    expect(detail?.rulesProse).toEqual(facing.rulesProse)
    expect(detail?.descriptionHtml).toBe(facing.descriptionHtml)
  })
})
