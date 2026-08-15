import { describe, expect, it } from 'vitest'
import { isContainer, type DependentConfig } from '@rpg/ui/form'

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
  it('owns a single inset rail on the Allow dependents region', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    expect(allow.controller).toMatchObject({
      type: 'switch',
      name: LEVEL_ZERO_NPCS_ENABLED,
      label: 'Allow',
    })
    expect(allow.dependents).toMatchObject({ chrome: 'inset' })
    expect(
      allow.dependents.fields.some(
        (field) =>
          isContainer(field) && field.kind === 'group' && field.chrome?.variant === 'inset',
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
})
