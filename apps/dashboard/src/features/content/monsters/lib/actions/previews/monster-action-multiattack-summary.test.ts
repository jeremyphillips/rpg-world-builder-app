import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_MULTIATTACK_STEPS_LABEL,
  formatMonsterActionMultiattackPreviewConfigureHint,
} from '../../monster-form-labels'
import { monsterFormTestValues } from '../../monster-form-test-values'
import type { MonsterFormValues } from '../../monster-form-values'
import { buildMonsterActionMultiattackPreview } from './monster-action-multiattack-summary'

function readyCtx(): ContentFormCtx {
  return {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as unknown as ContentFormCtx
}

describe('buildMonsterActionMultiattackPreview', () => {
  it('prints stat-block prose from formatMonsterMultiattack', () => {
    const ctx = readyCtx()
    const values = monsterFormTestValues({
      name: 'Wolf',
      actions: [
        {
          id: 'bite',
          kind: 'natural-weapon',
          name: 'Bite',
          mode: 'melee',
          damageType: 'piercing',
          damage: { dice: { count: 1, faces: 8 } },
        },
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ count: 1, actionIds: ['bite'] }],
        },
      ] as MonsterFormValues['actions'],
    })

    const preview = buildMonsterActionMultiattackPreview({
      values,
      ctx,
      actionId: 'multiattack',
    })

    expect(preview?.status).toBe('ready')
    if (!preview || preview.status !== 'ready') return
    expect(preview.prose).toMatch(/wolf makes one bite attack/i)
  })

  it('prints replacement prose when steps and replacement are configured', () => {
    const ctx = readyCtx()
    const values = monsterFormTestValues({
      name: 'Hell Hound',
      actions: [
        {
          id: 'bite',
          kind: 'natural-weapon',
          name: 'Bite',
          mode: 'melee',
          damageType: 'piercing',
          damage: { dice: { count: 1, faces: 8 } },
        },
        {
          id: 'fire-breath',
          kind: 'save',
          name: 'Fire Breath',
          dcSource: 'constitution',
          resolution: {
            kind: 'damage',
            damageType: 'fire',
            damage: { dice: { count: 2, faces: 6 } },
          },
        },
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ count: 2, actionIds: ['bite'] }],
          replacement: {
            count: 1,
            replacesActionId: 'bite',
            choices: [{ actionId: 'fire-breath' }],
          },
        },
      ] as MonsterFormValues['actions'],
    })

    const preview = buildMonsterActionMultiattackPreview({
      values,
      ctx,
      actionId: 'multiattack',
    })

    expect(preview?.status).toBe('ready')
    if (!preview || preview.status !== 'ready') return
    expect(preview.prose).toMatch(/makes two bite attacks/i)
    expect(preview.prose).toMatch(/replace the bite attack with a use of fire breath/i)
  })

  it('previews a browser-shaped replacement with empty strings and false switches', () => {
    const ctx = readyCtx()
    const values = monsterFormTestValues({
      name: 'Hell Hound',
      actions: [
        {
          id: 'bite',
          kind: 'natural-weapon',
          name: 'Bite',
          mode: 'melee',
          damageType: 'piercing',
          damage: { dice: { count: 1, faces: 8 } },
        },
        {
          id: 'fire-breath',
          kind: 'save',
          name: 'Fire Breath',
          dcSource: 'constitution',
          resolution: {
            kind: 'damage',
            damageType: 'fire',
            damage: { dice: { count: 2, faces: 6 } },
          },
        },
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          description: '',
          steps: [{ count: 2, actionIds: ['bite'] }],
          replacement: {
            choices: [{ actionId: 'fire-breath', spellId: '' }],
            count: 1,
            replacesActionId: '',
            attackWord: false,
          },
        },
      ] as MonsterFormValues['actions'],
    })

    const preview = buildMonsterActionMultiattackPreview({
      values,
      ctx,
      actionId: 'multiattack',
    })

    expect(preview?.status).toBe('ready')
    if (!preview || preview.status !== 'ready') return
    expect(preview.prose).toMatch(/makes two bite attacks/i)
    expect(preview.prose).toMatch(/replace one attack with a use of fire breath/i)
  })

  it('stays unavailable when replacement is incomplete', () => {
    const ctx = readyCtx()
    const values = monsterFormTestValues({
      name: 'Hell Hound',
      actions: [
        {
          id: 'bite',
          kind: 'natural-weapon',
          name: 'Bite',
          mode: 'melee',
          damageType: 'piercing',
          damage: { dice: { count: 1, faces: 8 } },
        },
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ count: 2, actionIds: ['bite'] }],
          replacement: { count: 1, choices: [], replacesActionId: 'bite' },
        },
      ] as MonsterFormValues['actions'],
    })

    expect(
      buildMonsterActionMultiattackPreview({
        values,
        ctx,
        actionId: 'multiattack',
      })?.status,
    ).toBe('unavailable')
  })

  it('returns steps guidance when no steps are configured', () => {
    const ctx = readyCtx()
    const values = monsterFormTestValues({
      name: 'Multiattack preview',
      actions: [
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [],
        },
      ] as MonsterFormValues['actions'],
    })

    expect(
      buildMonsterActionMultiattackPreview({
        values,
        ctx,
        actionId: 'multiattack',
      }),
    ).toEqual({
      status: 'unavailable',
      guidance: formatMonsterActionMultiattackPreviewConfigureHint(MONSTER_MULTIATTACK_STEPS_LABEL),
    })
  })
})
