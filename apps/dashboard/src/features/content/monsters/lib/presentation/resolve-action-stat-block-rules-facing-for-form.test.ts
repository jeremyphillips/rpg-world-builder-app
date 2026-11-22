import { systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickMonster } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'

import { resolveActionStatBlockRulesFacingForForm } from './resolve-action-stat-block-rules-facing-for-form'

function baseCtx(overrides: Partial<ContentFormCtx> = {}): ContentFormCtx {
  return {
    campaignId: 'camp',
    equipmentCatalogStatus: 'ready',
    spellCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogById: new Map(),
    armorClassRules: systemDefaultArmorClassRules(),
    rulesetId: 'srd-cc-5.2.1',
    ...overrides,
  } as ContentFormCtx
}

function baseValues(overrides: Partial<MonsterFormValues> = {}): MonsterFormValues {
  return {
    name: 'Test creature',
    challengeRating: '1',
    abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    actions: [],
    bonusActions: [],
    reactions: [],
    ...overrides,
  } as MonsterFormValues
}

describe('resolveActionStatBlockRulesFacingForForm', () => {
  it('returns unavailable when equipment catalog is pending', () => {
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values: baseValues({
        actions: [
          {
            id: 'bite',
            kind: 'natural-weapon',
            name: 'Bite',
            mode: 'melee',
            reach: 5,
            damage: { dice: { count: 1, faces: 6 }, damageTypeId: 'piercing' },
          },
        ],
      }),
      ctx: baseCtx({ equipmentCatalogStatus: 'pending' }),
      actionId: 'bite',
      section: 'actions',
    })
    expect(outcome.status).toBe('unavailable')
  })

  it('keeps a finished attack ready when a sibling attack has no damage', () => {
    const monster = pickMonster('hell-hound')
    const values = normalizeMonsterFormValues(
      {
        ...monster,
        actions: [
          ...(monster.actions ?? []),
          {
            id: 'unfinished',
            kind: 'attack',
            name: 'Scratch',
            bonusSource: { kind: 'ability', ability: 'str', proficient: true },
            mode: 'melee',
            reach: 5,
          },
        ],
      } as MonsterFormValues,
      { intent: 'draft', mode: 'create', armorClassRules: systemDefaultArmorClassRules() },
    ) as MonsterFormValues
    const bite = (values.actions ?? []).find((row) => row.id === 'bite')
    expect(bite).toBeTruthy()
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values,
      ctx: baseCtx(),
      actionId: bite!.id,
      section: 'actions',
    })
    expect(outcome.status).toBe('ready')
    if (outcome.status === 'ready') {
      expect(outcome.facing.attackLine).toBeTruthy()
    }
  })
})
