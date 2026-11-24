import {
  joinStatBlockProseDocument,
  type Monster,
  monsterActionSectionRows,
  systemDefaultArmorClassRules,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickEquipment, pickMonster, pickSpell } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterDetailViewModel } from '../monster-display'
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

function expectPublishedParity(
  monster: Monster,
  section: keyof Pick<Monster, 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions'>,
  actionId: string,
  ctx: ContentFormCtx,
) {
  const preview = resolveActionStatBlockRulesFacingForForm({
    values: monster as unknown as MonsterFormValues,
    ctx,
    actionId,
    section,
  })
  if (preview.status !== 'ready') throw new Error(JSON.stringify(preview))

  const published = buildMonsterDetailViewModel({
    monster,
    creatureTypeLabel: 'Fiend',
    equipmentById: new Map(ctx.equipmentCatalogById),
    catalogState: ctx.equipmentCatalogStatus ?? 'pending',
    spellsById: ctx.spellCatalogById,
    spellCatalogStatus: ctx.spellCatalogStatus === 'ready' ? 'ready' : 'unavailable',
  })[section].find((row) => row.id === actionId)

  if (!published) throw new Error('Missing published action')
  expect(published).toMatchObject({
    name: preview.facing.name,
    descriptionHtml: preview.facing.descriptionHtml,
    rulesProse: preview.facing.rulesProse,
  })
  return published
}

describe('resolveActionStatBlockRulesFacingForForm', () => {
  it('keeps authored Special Ability prose visible without campaign rules or catalogs', () => {
    const description = '<p>The creature roars.</p>'
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values: baseValues({
        actions: [{ id: 'roar', kind: 'special', name: 'Roar', description }],
      }),
      ctx: baseCtx({
        armorClassRules: undefined,
        rulesetId: undefined,
        equipmentCatalogStatus: 'error',
        spellCatalogStatus: 'error',
      }),
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

  it('resolves spell previews from the spell catalog while campaign rules and equipment are unavailable', () => {
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
        armorClassRules: undefined,
        rulesetId: undefined,
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

  it('preserves bonus-action spell usage and authored notes while equipment is unavailable', () => {
    const spell = pickSpell('fireball')
    const description = '<p>Supplemental text.</p>'
    const action = {
      id: 'cast',
      kind: 'spell',
      name: 'Spellcasting',
      castingAbility: { kind: 'ability', ability: 'int' },
      spells: [{ spellId: spell.id }],
      onceUntilNextTurn: true,
      description,
    } as const
    const monster = {
      ...pickMonster('hell-hound'),
      bonusActions: [{ ...action, spells: [...action.spells] }],
    }
    const published = expectPublishedParity(
      monster,
      'bonusActions',
      action.id,
      baseCtx({
        equipmentCatalogStatus: 'error',
        spellCatalogById: new Map([[spell.id, spell]]),
      }),
    )
    const rules = joinStatBlockProseDocument(published.rulesProse ?? [])
    expect(rules).toMatch(/fireball.*until the start of its next turn/is)
    expect(rules.match(/until the start of its next turn/g)).toHaveLength(1)
    expect(published.descriptionHtml).toBe(description)
  })

  it.each(['ready', 'pending', 'error'] as const)(
    'reports an empty spell selection as incomplete when the spell catalog is %s',
    (spellCatalogStatus) => {
      const outcome = resolveActionStatBlockRulesFacingForForm({
        values: baseValues({
          actions: [
            {
              id: 'cast',
              kind: 'spell',
              name: 'Spellcasting',
              castingAbility: { kind: 'ability', ability: 'int' },
              spells: [],
            },
          ],
        }),
        ctx: baseCtx({ spellCatalogStatus }),
        actionId: 'cast',
        section: 'actions',
      })
      expect(outcome).toEqual({
        status: 'incomplete',
        reason: { code: 'missing-spell-configuration' },
      })
    },
  )

  it('requires a direct shared casting source for a legendary spell invocation', () => {
    const spell = pickSpell('fireball')
    const description = '<p>Authored invocation notes.</p>'
    const source = {
      id: 'casting',
      name: 'Spellcasting',
      kind: 'spell' as const,
      castingAbility: { kind: 'ability' as const, ability: 'int' as const },
      spells: [{ spellId: spell.id, castAtLevel: 4 }],
    }
    const values = baseValues({
      actions: [source],
      legendaryActions: {
        uses: { normal: 3 },
        actions: [
          {
            id: 'invoke',
            kind: 'spell',
            name: 'Invoke',
            castingAbility: { kind: 'shared', entryId: source.id },
            spellInvocation: 'use-entry',
            description,
            spells: [{ spellId: spell.id }],
          },
        ],
      },
    })
    const request = {
      actionId: 'invoke',
      section: 'legendaryActions',
      ctx: baseCtx({ spellCatalogById: new Map([[spell.id, spell]]) }),
    } as const

    const ready = resolveActionStatBlockRulesFacingForForm({ ...request, values })
    expect(ready.status).toBe('ready')
    if (ready.status === 'ready') {
      const rules = joinStatBlockProseDocument(ready.facing.rulesProse ?? [])
      expect(rules).toContain(source.name)
      expect(rules).toMatch(/fireball/i)
    }

    expect(
      resolveActionStatBlockRulesFacingForForm({
        ...request,
        values: { ...values, actions: [] },
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'missing-action-reference' } })
    const published = buildMonsterDetailViewModel({
      monster: { ...values, actions: [] } as unknown as Monster,
      creatureTypeLabel: 'Fiend',
      equipmentById: new Map(),
      catalogState: 'ready',
      spellsById: new Map([[spell.id, spell]]),
      spellCatalogStatus: 'ready',
    }).legendaryActions.find((row) => row.id === request.actionId)
    expect(published).toMatchObject({ descriptionHtml: description, rulesProse: undefined })
  })

  it.each(['natural-weapon', 'attack'] as const)(
    'preserves %s rules in draft and published detail during catalog failures',
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
          : { ...attack, kind, properties: [] }
      const section = action.kind === 'attack' ? 'bonusActions' : 'actions'
      const monster = {
        ...pickMonster('hell-hound'),
        actions: action.kind === 'natural-weapon' ? [action] : [],
        bonusActions: action.kind === 'attack' ? [action] : [],
      }
      const request = {
        values: monster as unknown as MonsterFormValues,
        actionId: attack.id,
        section,
      } as const
      const ready = resolveActionStatBlockRulesFacingForForm({ ...request, ctx: baseCtx() })

      expect(ready).toMatchObject({
        status: 'ready',
        facing: { rulesProse: expect.any(Array) },
        attackProfile: expect.any(Object),
        attackLine: expect.any(Object),
      })
      for (const equipmentCatalogStatus of ['pending', 'error'] as const) {
        const ctx = baseCtx({ equipmentCatalogStatus, spellCatalogStatus: 'error' })
        expect(resolveActionStatBlockRulesFacingForForm({ ...request, ctx })).toEqual(ready)
        expectPublishedParity(monster, section, attack.id, ctx)
      }
    },
  )

  it('resolves a natural-attack multiattack during unrelated catalog failures', () => {
    const monster = pickMonster('hell-hound')
    const values = baseValues({ actions: monster.actions })
    const ctx = baseCtx({ equipmentCatalogStatus: 'error', spellCatalogStatus: 'error' })
    const request = { actionId: 'multiattack', section: 'actions', ctx } as const

    const published = expectPublishedParity(
      values as unknown as Monster,
      request.section,
      request.actionId,
      ctx,
    )
    expect(published.descriptionHtml).toContain('Bite')

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

    const body: Monster = {
      ...monster,
      actions: [
        action,
        {
          id: 'combo',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ actionIds: [action.id], count: 2 }],
        },
      ],
    }
    const dagger = pickEquipment('dagger')
    const published = expectPublishedParity(
      body,
      'actions',
      'combo',
      baseCtx({
        equipmentCatalogById: new Map([[dagger.id, dagger]]),
        spellCatalogStatus: 'error',
      }),
    )
    expect(published.descriptionHtml).toMatch(/dagger/i)
    expect(
      resolveActionStatBlockRulesFacingForForm({
        values: body as unknown as MonsterFormValues,
        ctx: baseCtx({ equipmentCatalogStatus: 'pending', spellCatalogStatus: 'error' }),
        actionId: 'combo',
        section: 'actions',
      }),
    ).toEqual({ status: 'unavailable', reason: { code: 'catalog-pending', catalog: 'equipment' } })
    const missing = buildMonsterDetailViewModel({
      monster: body,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'ready',
    }).actions.find((row) => row.id === 'combo')
    expect(missing).toMatchObject({ descriptionHtml: undefined })
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
    expectPublishedParity(
      values as unknown as Monster,
      request.section,
      request.actionId,
      baseCtx({ equipmentCatalogStatus: 'error', spellCatalogById: new Map([[spell.id, spell]]) }),
    )
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

  it.each(['reactions', 'legendaryActions'] as const)(
    'preserves weapon reference rules in %s once equipment is ready',
    (section) => {
      const monster = pickMonster('kobold-warrior')
      const weapon = monster.actions.find((row) => row.kind === 'weapon')
      if (!weapon) throw new Error('Missing weapon fixture')
      const dagger = pickEquipment('dagger')
      const id = 'follow-up'
      const body: Monster = {
        ...monster,
        reactions: [{ id, kind: 'parry', name: 'Parry', acBonus: 2, followUpActionId: weapon.id }],
        legendaryActions: {
          uses: { normal: 3 },
          actions: [{ id, kind: 'action-reference', actionIds: [weapon.id] }],
        },
      }
      const published = expectPublishedParity(
        body,
        section,
        id,
        baseCtx({
          equipmentCatalogById: new Map([[dagger.id, dagger]]),
          spellCatalogStatus: 'error',
        }),
      )
      expect(published.descriptionHtml).toMatch(/dagger/i)
      const withoutSource: Monster = { ...body, actions: [] }
      const unavailableCases = [
        { body, status: 'pending', reason: { code: 'catalog-pending', catalog: 'equipment' } },
        { body, status: 'error', reason: { code: 'catalog-error', catalog: 'equipment' } },
        { body, status: 'ready', reason: { code: 'missing-equipment-reference' } },
        {
          body: withoutSource,
          status: 'ready',
          reason: { code: 'missing-action-reference' },
        },
      ] as const
      for (const unavailable of unavailableCases) {
        expect(
          resolveActionStatBlockRulesFacingForForm({
            values: unavailable.body as unknown as MonsterFormValues,
            ctx: baseCtx({ equipmentCatalogStatus: unavailable.status }),
            actionId: id,
            section,
          }),
        ).toEqual({ status: 'unavailable', reason: unavailable.reason })

        const detail = buildMonsterDetailViewModel({
          monster: unavailable.body,
          creatureTypeLabel: 'Dragon',
          equipmentById: new Map(),
          catalogState: unavailable.status,
        })[section].find((row) => row.id === id)
        expect(detail).toBeDefined()
        if (section === 'reactions') {
          expect(detail?.descriptionHtml).toContain('adds 2 to its AC')
          expect(detail?.descriptionHtml).not.toContain('On a miss')
        } else {
          expect(detail?.descriptionHtml).toBeUndefined()
        }
      }
    },
  )

  it('preserves published reaction notes when the referenced action is missing', () => {
    const monster = pickMonster('hell-hound')
    const description = '<p>Authored reaction notes.</p>'
    const detail = buildMonsterDetailViewModel({
      monster: {
        ...monster,
        reactions: [
          {
            id: 'reflex',
            kind: 'action-reference',
            actionIds: ['missing'],
            description,
            trigger: { text: 'The creature is hit.' },
          },
        ],
      },
      creatureTypeLabel: 'Fiend',
      equipmentById: new Map(),
      catalogState: 'ready',
    })
    expect(detail.reactions[0]?.descriptionHtml).toBe(description)
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
    expect(
      resolve({
        armorClassRules: undefined,
        rulesetId: undefined,
        equipmentCatalogById: new Map([[dagger.id, dagger]]),
        spellCatalogStatus: 'error',
      }),
    ).toEqual(ready)

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
