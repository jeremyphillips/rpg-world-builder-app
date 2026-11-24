import { describe, expect, it } from 'vitest'
import { resolveDependsOnWatchName, type FormItem } from '@rpg/ui/form'

import { monsterFormMovementOverrideGroup } from './monster-form-movement-override-fields'

describe('monsterFormMovementOverrideGroup', () => {
  const group = monsterFormMovementOverrideGroup() as FormItem & {
    optionalDisclosure?: {
      summary?: { dependsOn?: string[]; resolve?: (values: unknown, state: unknown) => string }
      sourcePreview?: { resolve?: (values: unknown) => { label: string; text: string } }
      seedWhen?: (values: unknown) => unknown
    }
  }
  const disclosure = group.optionalDisclosure

  it('depends on root movement via three parent hops from a defined-form row', () => {
    expect(disclosure?.summary?.dependsOn).toEqual(['../../../movement', '../../../hover'])
  })

  it('resolves movement override watches from a defined-form row prefix', () => {
    const rowPrefix = 'forms.definedForms.0'
    expect(resolveDependsOnWatchName('../../../movement', rowPrefix)).toBe('movement')
    expect(resolveDependsOnWatchName('../../../hover', rowPrefix)).toBe('hover')
  })

  it('resolves summary and source preview from watched root movement', () => {
    const dependencyValues = {
      '../../../movement': [{ mode: 'walk', feet: 30 }],
      '../../../hover': false,
    }

    expect(disclosure!.summary!.resolve!(dependencyValues, { open: false })).toBe(
      'Inherits: Walk 30 ft.',
    )
    expect(disclosure!.sourcePreview!.resolve!(dependencyValues)).toEqual({
      label: 'Base',
      text: 'Walk 30 ft.',
    })
  })

  it('seeds override rows from root movement via seedWhen', () => {
    expect(
      disclosure?.seedWhen?.({
        '../../../movement': [
          { mode: 'walk', feet: 30 },
          { mode: 'fly', feet: 60 },
        ],
        '../../../hover': true,
      }),
    ).toEqual({
      rows: [
        { mode: 'walk', feet: 30 },
        { mode: 'fly', feet: 60 },
      ],
      hover: true,
    })
  })
})
