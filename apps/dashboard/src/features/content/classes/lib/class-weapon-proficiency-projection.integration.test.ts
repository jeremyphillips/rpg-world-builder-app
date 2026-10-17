import { describe, expect, it } from 'vitest'

import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import { proficienciesFromFormValues } from './class-form-values'
import type { ClassFormValues } from './class-form-fields'

const baseProficiencies: ClassFormValues['proficiencies'] = {
  savingThrows: ['str'],
  armor: { categories: [], items: [] },
  weapons: { categories: ['martial'], items: ['club'] },
  tools: { categories: [], items: [] },
  skills: { items: [] },
}

describe('class weapon proficiency projection', () => {
  it('persists categories only while both branches remain in form state', () => {
    const projected = proficienciesFromFormValues(baseProficiencies, 'categories', false)
    expect(projected.weapons).toEqual({ categories: ['martial'], items: [] })
    expect(baseProficiencies.weapons.items).toEqual(['club'])
  })

  it('persists specific items only when mode is specific', () => {
    const projected = proficienciesFromFormValues(baseProficiencies, 'specific', false)
    expect(projected.weapons).toEqual({ categories: [], items: ['club'] })
  })

  it('clears weapons when mode is none', () => {
    const projected = proficienciesFromFormValues(baseProficiencies, 'none', false)
    expect(projected.weapons).toEqual({ categories: [], items: [] })
  })

  it('does not treat transient dual-branch form state as mixed persistence', () => {
    expect(
      weaponProficiencyGrantSetFromMode('specific', {
        categories: ['martial'],
        items: ['club'],
      }),
    ).toEqual({ categories: [], items: ['club'] })
  })
})
