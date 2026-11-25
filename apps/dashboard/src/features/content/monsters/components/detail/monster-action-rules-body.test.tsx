import {
  joinStatBlockProseDocument,
  monsterActionSchema,
  monsterActionSectionRows,
  systemDefaultArmorClassRules,
  type MonsterLegendaryAction,
} from '@rpg/contracts'
import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { pickMonster, pickSkillProficiency, pickSpell } from '@/test/fixtures/pick'

import {
  buildSpellDisplayContext,
  resolveActionStatBlockRulesFacing,
} from '../../lib/presentation/resolve-action-stat-block-rules-facing'
import { StructuredFacingHostPanel } from '../../../facing/structured-facing-host-panel'
import type { MonsterFormValues } from '../../lib/monster-form-values'
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

  it('renders spell rules, usage, and supplemental prose once in both preview and detail', () => {
    const spell = pickSpell('fireball')
    const note = 'The flames are blue.'
    const action = monsterActionSchema.parse({
      id: 'cast',
      kind: 'spell',
      name: 'Spellcasting',
      castingAbility: { kind: 'ability', ability: 'int' },
      spells: [{ spellId: spell.id }],
      onceUntilNextTurn: true,
      description: `<p>${note}</p>`,
    })
    const monster = { ...pickMonster('hell-hound'), actions: [action] }
    const spellsById = new Map([[spell.id, spell]])
    const spellContext = buildSpellDisplayContext({
      monster,
      equipmentById: new Map(),
      catalogState: 'ready',
      spellCatalogStatus: 'ready',
      spellsById,
      magicPropertyProvider: () => undefined,
    })
    const published = resolveActionStatBlockRulesFacing(
      action,
      'actions',
      null,
      'ready',
      spellContext,
      new Map(),
    )

    const detail = render(<MonsterActionRulesBody item={published} />)
    const preview = render(
      <StructuredFacingHostPanel
        facing={{
          domain: 'monsterAction',
          source: 'draft',
          values: monster as unknown as MonsterFormValues,
          actionId: action.id,
          section: 'actions',
          ctx: {
            rulesetId: monster.rulesetId,
            armorClassRules: systemDefaultArmorClassRules(),
            equipmentCatalogStatus: 'ready',
            spellCatalogStatus: 'ready',
            spellCatalogById: spellsById,
          },
        }}
      />,
    )

    for (const view of [preview, detail]) {
      const text = view.container.textContent ?? ''
      expect(text.match(/fireball/gi)).toHaveLength(1)
      expect(text.match(new RegExp(TURN_LIMIT_SENTENCE, 'gi'))).toHaveLength(1)
      expect(within(view.container).getAllByText(note)).toHaveLength(1)
      expect(text).toMatch(/fireball.*until the start of its next turn.*The flames are blue/is)
    }
  })
})
