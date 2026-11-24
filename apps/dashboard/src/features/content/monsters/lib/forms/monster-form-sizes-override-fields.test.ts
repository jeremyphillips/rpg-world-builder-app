import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterFormSizesOverrideGroup } from './monster-form-sizes-override-fields'

const ctx = {
  entityCatalogLayer: 'homebrew',
  sizeVocabulary: {
    labelById: { medium: 'Medium', large: 'Large' },
    activeIds: new Set(['medium', 'large']),
  },
  creatureSizesSeedIds: [],
} as ContentFormCtx

describe('monsterFormSizesOverrideGroup', () => {
  const group = monsterFormSizesOverrideGroup(ctx) as FormItem & {
    optionalDisclosure?: {
      summary?: { dependsOn?: string[]; resolve?: (values: unknown) => string }
      sourcePreview?: { dependsOn?: string[]; resolve?: (values: unknown) => string }
      seedWhen?: (values: unknown) => unknown
    }
  }
  const disclosure = group.optionalDisclosure

  it('depends on root sizes via three parent hops from a defined-form row', () => {
    expect(disclosure?.summary?.dependsOn).toEqual(['../../../sizes'])
    expect(disclosure?.sourcePreview?.dependsOn).toEqual(['../../../sizes'])
  })

  it('resolves summary and source preview from watched root sizes', () => {
    const dependencyValues = {
      '../../../sizes': ['medium'],
    }

    expect(disclosure!.summary!.resolve!(dependencyValues, { open: false })).toBe(
      'Inherits: Medium',
    )
    expect(disclosure!.sourcePreview!.resolve!(dependencyValues)).toEqual({
      label: 'Base',
      text: 'Medium',
    })
  })

  it('omits source preview when base sizes are empty', () => {
    expect(disclosure!.sourcePreview!.resolve!({ '../../../sizes': [] })).toBeUndefined()
    expect(disclosure!.summary!.resolve!({ '../../../sizes': [] }, { open: false })).toBe(
      'Inherits base sizes.',
    )
  })
})
