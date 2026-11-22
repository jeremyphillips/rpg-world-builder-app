import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { getMonsterBySlug } from '@rpg/catalog/monsters'

import { monsterLairFormFields } from './monster-lair-form-fields'
import { monsterLairCustomXpMinimumHint, resolveMonsterBaseExperiencePoints } from '@rpg/contracts'

import {
  lairExperienceModeVisibility,
  MONSTER_LAIR_EXPERIENCE_MODE_FIELD,
  monsterLairEnabledVisibility,
  resolveMonsterLairCustomXpHint,
  resolveMonsterLairExperienceModeOptions,
  seedMonsterLairExperience,
} from './monster-lair-form-fields.lib'
import { monsterToFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'

type NamedGroupItem = Extract<FormItem, { kind: 'group' }>

function findLairExperienceGroup(items: FormItem[]): NamedGroupItem | undefined {
  const lairSection = items[0]
  if (!lairSection || !('kind' in lairSection) || lairSection.kind !== 'group') return undefined
  return lairSection.fields.find(
    (field): field is NamedGroupItem =>
      'kind' in field && field.kind === 'group' && field.name === 'lair.experience',
  )
}

describe('lairExperienceModeVisibility', () => {
  it('reads the flat dependsOn watch map for experience mode', () => {
    expect(
      lairExperienceModeVisibility('suggested').visibleWhen({
        [MONSTER_LAIR_EXPERIENCE_MODE_FIELD]: 'suggested',
      }),
    ).toBe(true)
    expect(
      lairExperienceModeVisibility('suggested').visibleWhen({
        [MONSTER_LAIR_EXPERIENCE_MODE_FIELD]: 'custom',
      }),
    ).toBe(false)
  })
})

describe('monsterLairEnabledVisibility', () => {
  it('reads the flat dependsOn watch map for lair.enabled', () => {
    expect(monsterLairEnabledVisibility.visibleWhen({ 'lair.enabled': true })).toBe(true)
    expect(monsterLairEnabledVisibility.visibleWhen({ 'lair.enabled': false })).toBe(false)
    expect(monsterLairEnabledVisibility.visibleWhen({ lair: { enabled: true } })).toBe(false)
  })
})

describe('resolveMonsterLairCustomXpHint', () => {
  it('includes minimum normal XP and suggested in-lair XP', () => {
    const baseXp = resolveMonsterBaseExperiencePoints({ challengeRating: '10' })
    const hint = resolveMonsterLairCustomXpHint({
      challengeRating: '10',
      [MONSTER_LAIR_EXPERIENCE_MODE_FIELD]: 'custom',
    })
    expect(hint).toContain(monsterLairCustomXpMinimumHint(baseXp))
    expect(hint).toContain('Suggested: XP')
  })

  it('uses experiencePointsOverride for the minimum hint at CR 0', () => {
    const hint = resolveMonsterLairCustomXpHint({
      challengeRating: '0',
      experiencePointsOverride: 0,
      [MONSTER_LAIR_EXPERIENCE_MODE_FIELD]: 'custom',
    })
    expect(hint).toContain(monsterLairCustomXpMinimumHint(0))
  })
})

describe('monsterLairFormFields', () => {
  const experienceGroup = findLairExperienceGroup(monsterLairFormFields())

  it('declares optional in-lair XP with seedWhen', () => {
    expect(experienceGroup).toBeDefined()
    if (!experienceGroup) return
    expect(experienceGroup.optionalDisclosure?.watchPaths).toBeUndefined()
    expect(experienceGroup.optionalDisclosure?.clearPaths).toBeUndefined()
    expect(experienceGroup.optionalDisclosure?.seedWhen?.({ challengeRating: '21' })).toEqual({
      mode: 'suggested',
    })
    expect(experienceGroup.optionalDisclosure?.seedWhen?.({ challengeRating: '30' })).toEqual({
      mode: 'custom',
    })
  })

  it('omits Suggested mode when CR has no successor', () => {
    expect(
      resolveMonsterLairExperienceModeOptions({ challengeRating: '30' }).map(
        (option) => (option as { value: string }).value,
      ),
    ).toEqual(['custom'])
  })

  it('defaults to suggested when CR supports a successor', () => {
    expect(seedMonsterLairExperience({ challengeRating: '10' })).toEqual({ mode: 'suggested' })
  })
})

describe('monster lair form values', () => {
  it('hydrates lair from the entity', () => {
    const lich = getMonsterBySlug('srd-cc-5.2.1', 'lich')
    const values = monsterToFormValues(lich)
    expect(values.lair).toEqual({
      enabled: true,
      experience: { mode: 'suggested' },
    })
  })

  it('serializes an enabled lair with suggested experience', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '21'
    values.lair = { enabled: true, experience: { mode: 'suggested' } }
    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    expect(normalized.lair).toEqual({ enabled: true, experience: { mode: 'suggested' } })
  })

  it('clears lair on update when disabled after a baseline lair', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '21'
    const updated = normalizeMonsterFormValues(values, {
      intent: 'publish',
      mode: 'update',
      baseline: { lair: { enabled: true } },
    })
    expect(updated.lair).toBeNull()
  })
})
