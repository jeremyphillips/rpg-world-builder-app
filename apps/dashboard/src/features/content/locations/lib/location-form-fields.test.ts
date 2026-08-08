import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { buildLocationFields } from './location-form-fields'
import type { LocationFormCtx } from './location-form-ctx'

function collectFieldNames(items: FormItem[]): string[] {
  const names: string[] = []

  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') {
      names.push(item.name)
    }
    if ('fields' in item && Array.isArray(item.fields)) {
      names.push(...collectFieldNames(item.fields as FormItem[]))
    }
  }

  return names
}

describe('buildLocationFields', () => {
  it('includes type-specific classification fields for fixed building create', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: { authoringType: 'building', parentLocationId: 'location-parent' },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).not.toContain('authoringType')
    expect(names).not.toContain('parentLocationId')
    expect(names).toContain('classification.archetype')
    expect(names).toContain('description')
  })

  it('omits classification fields for fixed district create', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: { authoringType: 'district', parentLocationId: 'location-parent' },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).toEqual(['description'])
  })

  it('includes authoringType and parentLocationId for full create layout', () => {
    const ctx = makeContentFormCtx({ mode: 'create' })
    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).toContain('authoringType')
    expect(names).toContain('parentLocationId')
  })
})
