import { describe, expect, it } from 'vitest'
import { DEFAULT_DEPENDENT_CHROME, isContainer, type DependentConfig } from '@rpg/ui/form'

import { LEVEL_ZERO_NPCS_ENABLED, levelZeroNpcsFields } from './level-zero-npc-form-fields'

function expectAllowDependent(fields: ReturnType<typeof levelZeroNpcsFields>): DependentConfig {
  const section = fields[0]
  if (!section || !isContainer(section) || section.kind !== 'group') {
    throw new Error('Expected Level 0 NPCs group')
  }

  const dependent = section.fields[0]
  if (!dependent || !isContainer(dependent) || dependent.kind !== 'dependent') {
    throw new Error('Expected Allow dependent')
  }

  return dependent
}

describe('levelZeroNpcsFields', () => {
  it('keeps Allow dependents on the default nest at the group and dependent layers', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    expect(allow.controller).toMatchObject({
      type: 'switch',
      name: LEVEL_ZERO_NPCS_ENABLED,
      label: 'Allow',
    })
    expect(allow.dependents.chrome).toBeUndefined()
    expect(allow.dependents.inset).not.toBe(false)
    expect(
      allow.dependents.fields.some(
        (field) => isContainer(field) && field.kind === 'group' && 'chrome' in field,
      ),
    ).toBe(false)
  })

  it('keeps standard array and grant-set fields flat under Allow dependents', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    expect(allow.dependents.fields[0]).toMatchObject({
      kind: 'row',
      spacing: 'compact',
      heading: { label: 'Standard array' },
    })
    expect(
      allow.dependents.fields.some((field) => isContainer(field) && field.kind === 'dependent'),
    ).toBe(true)
  })

  it('keeps nested grant-set dependents on the default nest without panel chrome', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    const nestedDependents = allow.dependents.fields.filter(
      (field): field is DependentConfig => isContainer(field) && field.kind === 'dependent',
    )

    expect(nestedDependents.length).toBeGreaterThanOrEqual(2)
    for (const nested of nestedDependents) {
      expect(nested.dependents).toMatchObject({ chrome: DEFAULT_DEPENDENT_CHROME })
      expect(nested.dependents.inset).not.toBe(false)
      expect(nested.dependents).not.toHaveProperty('panel')
    }
  })
})
