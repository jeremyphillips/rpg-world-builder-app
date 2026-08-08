import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { filterLocationFieldsForAuthoringType } from './location-classification-form-fields'
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
      fixedCreate: {
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: 'location-parent' },
      },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).not.toContain('authoringType')
    expect(names).not.toContain('parentLocationId')
    expect(names).toContain('classification.archetype')
    expect(names).toContain('classification.specialization')
    expect(names).toContain('classification.functionOverride')
    expect(names).toContain('description')
  })

  it('includes region classification fields for fixed region create', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: {
        authoringType: 'region',
        parent: { kind: 'fixed', locationId: 'location-parent' },
      },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).toContain('classification.kind')
    expect(names).toContain('classification.type')
  })

  it('includes interior classification fields for fixed interior create', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: {
        authoringType: 'interior',
        parent: { kind: 'fixed', locationId: 'location-parent' },
      },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).toContain('interiorType')
    expect(names).toContain('classification.type')
  })

  it('omits authoringType-only fields for other types on fixed district create', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: {
        authoringType: 'district',
        parent: { kind: 'fixed', locationId: 'location-parent' },
      },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).toContain('description')
    expect(names).not.toContain('authoringType')
    expect(names).not.toContain('parentLocationId')
    expect(names).not.toContain('classification.archetype')
    expect(names).not.toContain('classification.kind')
    expect(names).not.toContain('interiorType')
    expect(names).not.toContain('planeType')
  })

  it('shows parent picker for overview fixed create with editable parent', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: { authoringType: 'building' },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).not.toContain('authoringType')
    expect(names).toContain('parentLocationId')
  })

  it('omits settlementType when fixed on the session', () => {
    const ctx: LocationFormCtx = {
      ...makeContentFormCtx(),
      mode: 'create',
      fixedCreate: { authoringType: 'settlement', settlementType: 'city' },
    }

    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).not.toContain('settlementType')
    expect(names).toContain('parentLocationId')
  })

  it('includes authoringType and parentLocationId for full create layout', () => {
    const ctx = makeContentFormCtx({ mode: 'create' })
    const names = collectFieldNames(buildLocationFields(ctx))

    expect(names).toContain('authoringType')
    expect(names).toContain('parentLocationId')
  })
})

describe('filterLocationFieldsForAuthoringType', () => {
  it('retains compound-dependency fields when only authoringType is known', () => {
    const fields = [
      {
        name: 'compound-field',
        visibility: {
          dependsOn: ['authoringType', 'foo'],
          visibleWhen: () => {
            throw new Error('should not evaluate without full dependency set')
          },
        },
      },
    ]

    expect(filterLocationFieldsForAuthoringType(fields, 'building')).toEqual(fields)
  })
})
