/**
 * Investigation-only — documents which resolveAuthoredProfile guards fail for typical form shapes.
 * Remove or fold into regression tests once product fix lands.
 */
import { describe, expect, it } from 'vitest'
import { resolveMonsterActionAttackProfile } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import { resolveMonsterFormActionAttackProfile } from './monster-action-attack-summary'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
} as ContentFormCtx

function authoredAttack(
  overrides: Record<string, unknown> = {},
): MonsterFormValues['actions'][number] {
  return {
    id: 'slash',
    kind: 'attack',
    name: 'Slash',
    modes: ['melee'],
    damageType: 'slashing',
    damage: { dice: { count: 1, faces: 6 } },
    ...overrides,
  }
}

function formWithAction(
  action: MonsterFormValues['actions'][number],
  formOverrides: Partial<MonsterFormValues> = {},
): MonsterFormValues {
  const base = resolveMonsterCreateDefaultValues()
  return {
    ...base,
    challengeRating: '1',
    abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
    actions: [action],
    ...formOverrides,
  }
}

function profileStatus(values: MonsterFormValues) {
  return resolveMonsterFormActionAttackProfile(values, ctx, 'slash').status
}

describe('attack summary investigation (authored attack guards)', () => {
  it('maps bare create row to missing-input', () => {
    const bare = { id: 'slash', kind: 'attack' as const }
    expect(
      resolveMonsterActionAttackProfile({
        action: bare,
        monster: { abilityScores: { str: 16 } },
        equipmentCatalog: new Map(),
        proficiencyBonus: 2,
        magicPropertyProvider: () => undefined,
      }).status,
    ).toBe('unavailable')
  })

  it('fails when bonusSource is absent but damage and modes look filled', () => {
    expect(profileStatus(formWithAction(authoredAttack()))).toBe('unavailable')
  })

  it('fails when ability branch lacks proficient boolean', () => {
    expect(
      profileStatus(
        formWithAction(
          authoredAttack({
            bonusSource: { kind: 'ability', ability: 'str' },
          }),
        ),
      ),
    ).toBe('unavailable')
  })

  it('resolves when ability branch is complete including proficient false', () => {
    expect(
      profileStatus(
        formWithAction(
          authoredAttack({
            bonusSource: { kind: 'ability', ability: 'str', proficient: false },
          }),
        ),
      ),
    ).toBe('resolved')
  })

  it('fails when damage has count but no faces', () => {
    expect(
      profileStatus(
        formWithAction(
          authoredAttack({
            bonusSource: { kind: 'ability', ability: 'str', proficient: true },
            damage: { dice: { count: 1 } },
          }),
        ),
      ),
    ).toBe('unavailable')
  })

  it('fails when challenge rating is missing on the form', () => {
    const values = formWithAction(
      authoredAttack({
        bonusSource: { kind: 'ability', ability: 'str', proficient: true },
      }),
    )
    delete values.challengeRating
    expect(profileStatus(values)).toBe('unavailable')
  })

  it('normalization does not drop a valid bonusSource for preview', () => {
    const values = formWithAction(
      authoredAttack({
        bonusSource: { kind: 'ability', ability: 'str', proficient: false },
      }),
    )
    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    const row = (normalized.actions as Array<{ bonusSource?: unknown }>)?.[0]
    expect(row?.bonusSource).toEqual({ kind: 'ability', ability: 'str', proficient: false })
    expect(profileStatus(values)).toBe('resolved')
  })

  it('documents natural-weapon form-adapter path when mode is dropped by normalization', () => {
    const natural = {
      id: 'bite',
      kind: 'natural-weapon' as const,
      name: 'Bite',
      mode: 'melee' as const,
      damageType: 'piercing',
      damage: { dice: { count: 1, faces: 8 } },
    }
    const normalized = normalizeMonsterFormValues(formWithAction(natural), {
      intent: 'draft',
      mode: 'create',
    })
    const row = (normalized.actions as Array<Record<string, unknown>>)?.[0]
    expect(row?.mode).toBe('melee')
    expect(row?.damage).toEqual({ dice: { count: 1, faces: 8 } })
    const profile = resolveMonsterFormActionAttackProfile(formWithAction(natural), ctx, 'bite')
    expect(profile).toEqual({ status: 'resolved', value: expect.any(Object) })
  })

  it('contrast: natural-weapon resolves via direct resolver without bonusSource', () => {
    expect(
      resolveMonsterActionAttackProfile({
        action: {
          id: 'bite',
          kind: 'natural-weapon',
          name: 'Bite',
          mode: 'melee',
          damageType: 'piercing',
          damage: { dice: { count: 1, faces: 8 } },
        },
        monster: { abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 } },
        equipmentCatalog: new Map(),
        proficiencyBonus: 2,
        magicPropertyProvider: () => undefined,
      }).status,
    ).toBe('resolved')
  })
})
