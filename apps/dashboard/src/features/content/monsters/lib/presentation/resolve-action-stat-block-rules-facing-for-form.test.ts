import { joinStatBlockProseDocument, systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickMonster, pickSpell } from '@/test/fixtures/pick'

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
    ...pickMonster('hell-hound'),
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
  it('returns unavailable when campaign ruleset is not on context', () => {
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values: baseValues({
        actions: [{ id: 'act', kind: 'special', name: 'Roar', description: '<p>Roar</p>' }],
      }),
      ctx: baseCtx({ rulesetId: undefined }),
      actionId: 'act',
      section: 'actions',
    })
    expect(outcome).toEqual({
      status: 'unavailable',
      reason: { code: 'catalog-pending', catalog: 'armor-class-rules' },
    })
  })

  it('keeps authored Special Ability prose visible when unrelated catalogs fail', () => {
    const description = '<p>The creature roars.</p>'
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values: baseValues({
        actions: [{ id: 'roar', kind: 'special', name: 'Roar', description }],
      }),
      ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' }),
      actionId: 'roar',
      section: 'actions',
    })
    expect(outcome).toMatchObject({ status: 'ready', facing: { descriptionHtml: description } })
  })

  it('keeps generated bonus-action prose available during catalog failures', () => {
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values: baseValues({
        bonusActions: [{ id: 'step', kind: 'teleport', name: 'Teleport', distanceFeet: 40 }],
      }),
      ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' }),
      actionId: 'step',
      section: 'bonusActions',
    })
    expect(outcome).toMatchObject({
      status: 'ready',
      facing: { descriptionHtml: expect.stringContaining('40 feet') },
    })
  })

  it('resolves spell previews from the spell catalog even when equipment fails', () => {
    const spell = pickSpell('fireball')
    const values = baseValues({
      actions: [
        {
          id: 'cast',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
          spells: [{ spellId: spell.id }],
        },
      ],
    })
    const request = { values, actionId: 'cast', section: 'actions' } as const

    const ready = resolveActionStatBlockRulesFacingForForm({
      ...request,
      ctx: baseCtx({
        equipmentCatalogStatus: 'error',
        spellCatalogById: new Map([[spell.id, spell]]),
      }),
    })
    expect(ready.status).toBe('ready')
    if (ready.status === 'ready') {
      expect(joinStatBlockProseDocument(ready.facing.rulesProse ?? [])).toMatch(/fireball/i)
    }

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'pending' }),
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'catalog-pending', catalog: 'spells' } })

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        ctx: baseCtx({ spellCatalogStatus: 'error' }),
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'catalog-error', catalog: 'spells' } })

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        ctx: baseCtx(),
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'missing-spell-reference' } })
  })

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
            damageType: 'piercing',
            damage: { dice: { count: 1, faces: 6 } },
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
      } as unknown as MonsterFormValues,
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
      expect(joinStatBlockProseDocument(outcome.facing.rulesProse ?? [])).toContain(
        'Melee Attack Roll',
      )
    }
  })
})
