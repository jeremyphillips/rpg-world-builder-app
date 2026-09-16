import { describe, expect, it } from 'vitest'

import { resolveFieldInstruction } from './field-instruction.lib'
import type { FieldCopyContext } from './field-copy-context.lib'

const primaryAbilitiesContext: FieldCopyContext = {
  category: 'multi',
  label: 'Primary abilities',
  noun: {
    singular: 'primary ability',
    plural: 'primary abilities',
  },
}

describe('resolveFieldInstruction', () => {
  it.each([
    [{ min: 1 }, 'Choose at least one primary ability.'],
    [{ min: 2 }, 'Choose at least 2 primary abilities.'],
    [{ max: 2 }, 'Choose up to 2 primary abilities.'],
    [{ min: 2, max: 2 }, 'Choose 2 primary abilities.'],
    [{ min: 1, max: 2 }, 'Choose 1–2 primary abilities.'],
  ] as const)('derives constraint hints %#', (constraints, expected) => {
    expect(
      resolveFieldInstruction({
        ...primaryAbilitiesContext,
        ...constraints,
      }),
    ).toBe(expected)
  })

  it('returns undefined for non-multi categories', () => {
    expect(
      resolveFieldInstruction({
        category: 'choice',
        label: 'Armor',
        noun: { singular: 'armor' },
        max: 1,
      }),
    ).toBeUndefined()
  })

  it('returns undefined when no bounds are configured', () => {
    expect(resolveFieldInstruction(primaryAbilitiesContext)).toBeUndefined()
  })
})
