import { describe, expect, it } from 'vitest'

import { resolveMonsterActionAttackProfile } from '@rpg/contracts'

import { buildMonsterActionAttackPreview } from './monster-action-attack-summary'

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
          additionalDamage: [{ roll: { dice: { count: 1, faces: 6 } }, damageType: 'fire' }],
        },
      },
      monster: {
        abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
        challengeRating: '1',
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
  })

  it('returns unavailable messaging when the profile is unavailable', () => {
    expect(
      buildMonsterActionAttackPreview({ status: 'unavailable', reason: 'missing-input' }, {}),
    ).toEqual({
      status: 'unavailable',
      message: 'Attack summary unavailable (missing input)',
    })
  })
})
