import {
  joinStatBlockProseDocument,
  monsterActionSectionRows,
  systemDefaultArmorClassRules,
  type MonsterLegendaryAction,
} from '@rpg/contracts'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

import {
  buildSpellDisplayContext,
  resolveActionStatBlockRulesFacing,
} from '../../lib/presentation/resolve-action-stat-block-rules-facing'
import { tryDeriveMonsterStatBlock } from '../../lib/monster-display'
import { MonsterActionRulesBody } from './monster-action-rules-body'

const SAVE_OPENING = 'Constitution Saving Throw: DC 20'
const TURN_LIMIT_SENTENCE = "can't take this action again until the start of its next turn"

describe('MonsterActionRulesBody', () => {
  it('renders disrupt life mechanical rules once', () => {
    const monster = pickMonster('lich')
    const derived = tryDeriveMonsterStatBlock(monster, [], [pickSkillProficiency('perception')], {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    const spellContext = buildSpellDisplayContext({
      monster,
      equipmentById: new Map(),
      catalogState: 'ready',
      magicPropertyProvider: () => undefined,
    })
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

    const { container } = render(<MonsterActionRulesBody item={facing} />)
    const text = container.textContent ?? ''
    expect(joinStatBlockProseDocument(facing.rulesProse ?? [])).toContain(SAVE_OPENING)
    expect(text.match(new RegExp(SAVE_OPENING, 'g'))?.length).toBe(1)
    expect(text.match(new RegExp(TURN_LIMIT_SENTENCE, 'gi'))?.length).toBe(1)
  })
})
