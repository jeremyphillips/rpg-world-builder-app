import { availableBodyRows, systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

import { buildMonsterDetailViewModel, tryDeriveMonsterStatBlock } from '../monster-display'

import {
  buildSpellDisplayContext,
  resolveActionStatBlockRulesFacing,
  resolveActionStatBlockRulesFacingList,
} from './resolve-action-stat-block-rules-facing'

describe('resolveActionStatBlockRulesFacing', () => {
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
