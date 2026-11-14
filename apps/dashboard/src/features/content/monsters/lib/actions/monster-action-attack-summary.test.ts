import { describe, expect, it } from 'vitest'

import { resolveMonsterActionAttackProfile } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MONSTER_ATTACK_BONUS_LABEL } from '../monster-form-labels'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import {
  buildMonsterActionAttackPreview,
  resolveMonsterActionAttackPreviewGuidance,
  resolveMonsterFormActionAttackProfile,
} from './monster-action-attack-summary'

describe('buildMonsterActionAttackPreview', () => {
  it('builds attack, damage, and reach rows with mode caption', () => {
    const profile = resolveMonsterActionAttackProfile({
      action: {
        id: 'bite',
        kind: 'natural-weapon',
        name: 'Bite',
        mode: 'melee',
        damageType: 'piercing',
        damage: { dice: { count: 1, faces: 8 } },
        onHit: {
          effects: [{ kind: 'damage', roll: { dice: { count: 1, faces: 6 } }, damageType: 'fire' }],
        },
      },
      monster: {
        abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
      },
      equipmentCatalog: new Map(),
      proficiencyBonus: 2,
      magicPropertyProvider: () => undefined,
    })

    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return

    const previewWithScores = buildMonsterActionAttackPreview(profile, {
      str: 16,
      dex: 14,
      con: 13,
      int: 8,
      wis: 11,
      cha: 8,
    })

    expect(previewWithScores.status).toBe('ready')
    if (previewWithScores.status !== 'ready') return

    expect(previewWithScores.modeCaption).toBe('Melee')
    expect(previewWithScores.rows.map((row) => row.label)).toEqual([
      'Attack',
      'Damage',
      'Extra',
      'Reach',
    ])
    expect(previewWithScores.rows[0]).toMatchObject({
      primary: '+5',
      secondary: 'STR +3 · PB +2',
    })
    expect(previewWithScores.rows[1]).toMatchObject({
      id: 'damage',
      label: 'Damage',
      primary: '7',
    })
    expect(previewWithScores.rows[1]?.secondary).toMatch(/1d8.*piercing/i)
    expect(previewWithScores.rows[2]).toMatchObject({
      id: 'on-hit-0',
      label: 'Extra',
      primary: '3',
    })
    expect(previewWithScores.rows[2]?.secondary).toMatch(/1d6.*fire/i)
    expect(previewWithScores.rows[3]).toMatchObject({ primary: '5 ft' })
    expect(previewWithScores.sentence).toBe(
      'Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Piercing damage plus 3 (1d6) Fire damage.',
    )
  })

  it('returns attack-bonus guidance when the profile is unavailable without context', () => {
    expect(
      buildMonsterActionAttackPreview({ status: 'unavailable', reason: 'missing-input' }, {}),
    ).toEqual({
      status: 'unavailable',
      guidance: `Configure ${MONSTER_ATTACK_BONUS_LABEL} to calculate this attack.`,
    })
  })

  it('assumes 5 ft reach for melee custom attacks without an explicit reach', () => {
    const ctx = {
      entityCatalogLayer: 'homebrew',
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    } as ContentFormCtx
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      challengeRating: '1',
      abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
      actions: [
        {
          id: 'slash',
          kind: 'attack',
          name: 'Slash',
          modes: ['melee'],
          damageType: 'slashing',
          damage: { dice: { count: 1, faces: 6 } },
          bonusSource: { kind: 'ability', ability: 'str', proficient: true },
        },
      ],
    } as const

    const profile = resolveMonsterFormActionAttackProfile(values, ctx, 'slash')
    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return
    expect(profile.value.reach).toBe(5)
  })

  it('stays unavailable when only the damage type is set on the row', () => {
    const ctx = {
      entityCatalogLayer: 'homebrew',
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    } as ContentFormCtx
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      challengeRating: '1',
      abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
      actions: [
        {
          id: 'slash',
          kind: 'attack',
          name: 'Slash',
          modes: ['melee'],
          damageType: 'slashing',
          bonusSource: { kind: 'ability', ability: 'str', proficient: true },
        },
      ],
    } as const

    expect(resolveMonsterFormActionAttackProfile(values, ctx, 'slash').status).toBe('unavailable')
  })

  it('prefers attack bonus guidance over damage for incomplete authored attacks', () => {
    const ctx = {
      entityCatalogLayer: 'homebrew',
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    } as ContentFormCtx
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      challengeRating: '1',
      abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
      actions: [
        {
          id: 'slash',
          kind: 'attack',
          name: 'Slash',
          modes: ['melee'],
          damageType: 'slashing',
          damage: { dice: { count: 1, faces: 6 } },
        },
      ],
    } as const

    expect(
      resolveMonsterActionAttackPreviewGuidance({
        ctx,
        values,
        action: values.actions[0],
      }),
    ).toBe(`Configure ${MONSTER_ATTACK_BONUS_LABEL} to calculate this attack.`)
  })
})
