import {
  joinStatBlockProseDocument,
  monsterActionSectionRows,
  systemDefaultArmorClassRules,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickEquipment, pickMonster, pickSpell } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'

import { resolveActionStatBlockRulesFacingForForm } from './resolve-action-stat-block-rules-facing-for-form'

import {
  buildSpellDisplayContext,
  resolveActionStatBlockRulesFacing,
} from './resolve-action-stat-block-rules-facing'

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
      const rules = joinStatBlockProseDocument(ready.facing.rulesProse ?? [])
      expect(rules).toMatch(/fireball/i)
      expect(rules).toContain('DC 10')
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

  it.each(['natural-weapon', 'attack'] as const)(
    'preserves %s preview rules and metadata during catalog failures',
    (kind) => {
      const attack = {
        id: 'claw',
        name: 'Claw',
        mode: 'melee',
        reach: 5,
        damageType: 'piercing',
        damage: { dice: { count: 1, faces: 6 } },
      } as const
      const action =
        kind === 'attack'
          ? {
              ...attack,
              kind,
              modes: ['melee' as const],
              bonusSource: { kind: 'ability', ability: 'str', proficient: true } as const,
            }
          : { ...attack, kind }
      const request = {
        values: baseValues({ actions: [action] }),
        actionId: attack.id,
        section: 'actions',
      } as const
      const ready = resolveActionStatBlockRulesFacingForForm({ ...request, ctx: baseCtx() })

      expect(ready).toMatchObject({
        status: 'ready',
        facing: { rulesProse: expect.any(Array) },
        attackProfile: expect.any(Object),
        attackLine: expect.any(Object),
      })
      for (const equipmentCatalogStatus of ['pending', 'error'] as const) {
        expect(
          resolveActionStatBlockRulesFacingForForm({
            ...request,
            ctx: baseCtx({ equipmentCatalogStatus, spellCatalogStatus: 'error' }),
          }),
        ).toEqual(ready)
      }
    },
  )

  it('resolves a natural-attack multiattack during unrelated catalog failures', () => {
    const monster = pickMonster('hell-hound')
    const values = baseValues({ actions: monster.actions })
    const ctx = baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' })
    const request = { actionId: 'multiattack', section: 'actions', ctx } as const

    expect(resolveActionStatBlockRulesFacingForForm({ ...request, values })).toMatchObject({
      status: 'ready',
      facing: { descriptionHtml: expect.stringContaining('Bite') },
    })

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        values: { ...values, actions: values.actions?.filter((row) => row.kind === 'multiattack') },
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'missing-action-reference' } })
  })

  it('checks equipment only when a multiattack references a weapon', () => {
    const monster = pickMonster('kobold-warrior')
    const action = monster.actions.find((row) => row.kind === 'weapon')
    if (!action) throw new Error('Missing weapon fixture')

    const values = baseValues({
      equipment: monster.equipment,
      actions: [
        action,
        {
          id: 'combo',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ actionIds: [action.id], count: 2 }],
        },
      ],
    })
    expect(
      resolveActionStatBlockRulesFacingForForm({
        values,
        ctx: baseCtx({ equipmentCatalogStatus: 'pending', spellCatalogStatus: 'error' }),
        actionId: 'combo',
        section: 'actions',
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'catalog-pending', catalog: 'equipment' } })
  })

  it('uses the spell catalog for an explicit multiattack spell choice', () => {
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
        {
          id: 'combo',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ kind: 'use', mode: 'single', actionId: 'cast', spellId: spell.id }],
        },
      ],
    })
    const request = { values, actionId: 'combo', section: 'actions' } as const

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'pending' }),
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'catalog-pending', catalog: 'spells' } })

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        ctx: baseCtx({
          equipmentCatalogStatus: 'error',
          spellCatalogById: new Map([[spell.id, spell]]),
        }),
      }),
    ).toMatchObject({
      status: 'ready',
      facing: { descriptionHtml: expect.stringContaining('Fireball') },
    })
  })

  it('resolves a saving throw from a shared casting ability without either catalog', () => {
    const breath = pickMonster('hell-hound').actions.find((row) => row.kind === 'save')
    if (!breath) throw new Error('Missing saving throw fixture')
    const action = {
      ...breath,
      dcSource: {
        kind: 'spellcasting' as const,
        castingAbility: { kind: 'shared' as const, entryId: 'casting' },
      },
    }
    const values = baseValues({
      actions: [
        action,
        {
          id: 'casting',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'dex' },
          spells: [],
        },
      ],
    })
    const request = {
      actionId: action.id,
      section: 'actions',
      ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' }),
    } as const

    const ready = resolveActionStatBlockRulesFacingForForm({ ...request, values })
    expect(ready.status).toBe('ready')
    if (ready.status === 'ready') {
      expect(joinStatBlockProseDocument(ready.facing.rulesProse ?? [])).toContain('DC 12')
    }

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        values: { ...values, actions: [action] },
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'missing-action-reference' } })
  })

  it('shows authored saving-throw prose with a fixed DC during catalog failures', () => {
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values: baseValues({
        actions: [
          {
            id: 'roar',
            kind: 'special',
            name: 'Roar',
            savingThrow: {
              ability: 'wis',
              dcSource: { kind: 'fixed', dc: 14 },
              targets: 'each creature nearby',
              failure: 'The target is Frightened.',
            },
          },
        ],
      }),
      ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' }),
      actionId: 'roar',
      section: 'actions',
    })
    expect(outcome.status).toBe('ready')
    if (outcome.status === 'ready') {
      expect(joinStatBlockProseDocument(outcome.facing.rulesProse ?? [])).toContain('DC 14')
    }
  })

  it.each([
    ['hell-hound', 'actions', 'fire-breath'],
    ['hell-hound', 'bonusActions', 'test-teleport'],
    ['knight', 'reactions', 'parry'],
    ['lich', 'legendaryActions', 'disrupt-life'],
  ] as const)(
    'keeps %s %s draft and published rules aligned during catalog failures',
    (slug, section, id) => {
      const monster = pickMonster(slug)
      const body =
        section === 'bonusActions'
          ? {
              ...monster,
              bonusActions: [{ kind: 'teleport' as const, id, name: 'Teleport', distanceFeet: 40 }],
            }
          : monster
      const action = monsterActionSectionRows<
        Parameters<typeof resolveActionStatBlockRulesFacing>[0]
      >(body, section).find((row) => row.id === id)
      if (!action) throw new Error('Missing section parity fixture')
      const published = resolveActionStatBlockRulesFacing(
        action,
        section,
        null,
        'error',
        buildSpellDisplayContext({
          monster: body,
          catalogState: 'error',
          equipmentById: new Map(),
          magicPropertyProvider: () => undefined,
        }),
        new Map(),
      )
      const preview = resolveActionStatBlockRulesFacingForForm({
        values: body as unknown as MonsterFormValues,
        ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' }),
        actionId: id,
        section,
      })
      expect(preview).toMatchObject({ status: 'ready', facing: published })
    },
  )

  it('reports unsupported action kinds as invalid draft data', () => {
    const values = baseValues({
      actions: [{ id: 'unknown', kind: 'unsupported-kind' } as never],
    })
    expect(
      resolveActionStatBlockRulesFacingForForm({
        values,
        ctx: baseCtx(),
        actionId: 'unknown',
        section: 'actions',
      }),
    ).toEqual({ status: 'invalid', reason: { code: 'unsupported-kind' } })
  })

  it('distinguishes weapon selection, equipment lifecycle, and missing references', () => {
    const monster = pickMonster('kobold-warrior')
    const action = monster.actions.find((row) => row.kind === 'weapon')
    if (!action) throw new Error('Missing weapon fixture')

    const request = {
      values: baseValues({ equipment: monster.equipment, actions: [action] }),
      actionId: action.id,
      section: 'actions',
    } as const
    const resolve = (overrides?: Partial<ContentFormCtx>) =>
      resolveActionStatBlockRulesFacingForForm({ ...request, ctx: baseCtx(overrides) })

    expect(resolve({ equipmentCatalogStatus: 'pending' })).toEqual({
      status: 'unavailable',
      reason: { code: 'catalog-pending', catalog: 'equipment' },
    })
    expect(resolve({ equipmentCatalogStatus: 'error' })).toEqual({
      status: 'unavailable',
      reason: { code: 'catalog-error', catalog: 'equipment' },
    })
    expect(resolve({ spellCatalogStatus: 'error' })).toEqual({
      status: 'unavailable',
      reason: { code: 'missing-equipment-reference' },
    })

    const dagger = pickEquipment('dagger')
    const ready = resolve({
      equipmentCatalogById: new Map([[dagger.id, dagger]]),
      spellCatalogStatus: 'error',
    })
    expect(ready).toMatchObject({ status: 'ready', facing: { rulesProse: expect.any(Array) } })

    const values = baseValues({ actions: [{ ...action, equipmentEntryId: undefined }] })
    expect(
      resolveActionStatBlockRulesFacingForForm({ ...request, values, ctx: baseCtx() }),
    ).toEqual({
      status: 'incomplete',
      reason: { code: 'missing-attack-input', field: 'equipment' },
    })
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
            modes: ['melee'],
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
    expect(
      resolveActionStatBlockRulesFacingForForm({
        values,
        ctx: baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' }),
        actionId: 'unfinished',
        section: 'actions',
      }),
    ).toEqual({
      status: 'incomplete',
      reason: { code: 'missing-attack-input', field: 'damage' },
    })
    expect(outcome.status).toBe('ready')
    if (outcome.status === 'ready') {
      expect(joinStatBlockProseDocument(outcome.facing.rulesProse ?? [])).toContain(
        'Melee Attack Roll',
      )
    }
  })
})
