import type { FormItem } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { monsterTraitDetailFields } from './monster-trait-form-fields'

const ctx = { damageTypeVocabulary: buildSeedDamageTypeVocabulary() }

function namesOf(items: readonly FormItem[]): string[] {
  const names: string[] = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') names.push(item.name)
    if ('fields' in item && Array.isArray(item.fields)) names.push(...namesOf(item.fields))
    if ('start' in item && item.start && typeof item.start === 'object' && 'name' in item.start) {
      if (typeof item.start.name === 'string') names.push(item.start.name)
    }
    if ('end' in item && item.end && typeof item.end === 'object' && 'name' in item.end) {
      if (typeof item.end.name === 'string') names.push(item.end.name)
    }
  }
  return names
}

function traitNames(row: unknown) {
  return namesOf(
    monsterTraitDetailFields({
      row,
      rowPath: 'traits.0',
      advisories: [],
      monsterName: 'Owl',
      ctx,
    }),
  )
}

describe('monsterTraitDetailFields', () => {
  it('keeps a custom description immediately after the advisory', () => {
    expect(
      traitNames({ id: 'note', kind: 'custom', name: 'Note', description: 'Custom.' }),
    ).toEqual(['buildAdvisories', 'description'])
  })

  it('puts template supplemental prose after legendary-resistance uses', () => {
    const names = traitNames({
      id: 'legend',
      templateId: 'legendary-resistance',
      config: { uses: 3 },
    })
    expect(names[0]).toBe('traitPreview')
    expect(names).toContain('config.uses')
    expect(names.at(-1)).toBe('descriptionOverride')
    expect(names.indexOf('config.uses')).toBeLessThan(names.indexOf('descriptionOverride'))
  })

  it('puts a fixed preset preview before the advisory and adds no body fields', () => {
    const names = traitNames({ id: 'fly', preset: 'flyby' })
    expect(names[0]).toBe('traitPreview')
    expect(names[1]).toBe('buildAdvisories')
    expect(names).toHaveLength(2)
  })

  it('keeps water-breathing duration behind the toggle until it is enabled', () => {
    expect(traitNames({ id: 'water', preset: 'water-breathing' })).toEqual([
      'traitPreview',
      'buildAdvisories',
      'outsideWaterBreathToggle',
    ])
    expect(
      traitNames({
        id: 'water',
        preset: 'water-breathing',
        outsideWaterBreathAmount: 1,
        outsideWaterBreathUnit: 'hour',
      }),
    ).toEqual([
      'traitPreview',
      'buildAdvisories',
      'outsideWaterBreathToggle',
      'outsideWaterBreathAmount',
      'outsideWaterBreathUnit',
    ])
  })
})
