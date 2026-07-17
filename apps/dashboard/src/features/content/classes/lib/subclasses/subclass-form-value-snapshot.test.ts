import { describe, expect, it } from 'vitest'

import {
  isSubclassFormValuesLike,
  serializeSubclassFormValues,
} from './subclass-form-value-snapshot'
import type { SubclassFormValues } from './subclass-form-fields'

const emptyValues: SubclassFormValues = {
  name: '',
  tagline: '',
  description: '',
  features: [],
}

describe('serializeSubclassFormValues', () => {
  it('serializes only schema-backed fields', () => {
    expect(
      serializeSubclassFormValues({
        name: 'Champion',
        tagline: 'Mighty',
        description: 'A fighter path',
        features: [{ name: 'Improved Critical', level: 3, grants: [] }],
      }),
    ).toBe(
      JSON.stringify({
        name: 'Champion',
        tagline: 'Mighty',
        description: 'A fighter path',
        features: [{ name: 'Improved Critical', level: 3, grants: [] }],
      }),
    )
  })

  it('does not throw when extra non-serializable keys are present', () => {
    const circular: { name: string; self?: unknown } = { name: 'Champion' }
    circular.self = circular
    const polluted = {
      ...emptyValues,
      name: 'Champion',
      extra: circular,
    } as SubclassFormValues & { extra: { name: string; self?: unknown } }

    expect(() => serializeSubclassFormValues(polluted)).not.toThrow()
    expect(serializeSubclassFormValues(polluted)).toBe(
      JSON.stringify({
        name: 'Champion',
        slug: undefined,
        tagline: '',
        description: '',
        features: [],
      }),
    )
  })
})

describe('isSubclassFormValuesLike', () => {
  it('rejects DOM events and other non-form payloads', () => {
    expect(isSubclassFormValuesLike({ name: 'Champion', features: [] })).toBe(true)
    expect(isSubclassFormValuesLike({ target: {} })).toBe(false)
    expect(isSubclassFormValuesLike({})).toBe(false)
    expect(isSubclassFormValuesLike(null)).toBe(false)
  })
})
