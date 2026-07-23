import { describe, expect, it } from 'vitest'
import type { Subclass } from '@rpg/contracts'

import { applySubclassFormEdits } from './apply-subclass-form-edits'
import type { SubclassFormValues } from './subclass-form-fields'

const emptyValues: SubclassFormValues = {
  name: '',
  tagline: '',
  description: '',
  features: [],
}

describe('applySubclassFormEdits', () => {
  it('ignores non-form payloads instead of throwing', () => {
    const current = {}

    expect(
      applySubclassFormEdits(
        current,
        'draft-1',
        { target: {} } as unknown as SubclassFormValues,
        [],
        [],
      ),
    ).toBe(current)
  })

  it('stores edits when values differ from the base entity', () => {
    const values: SubclassFormValues = { ...emptyValues, name: 'Champion' }

    expect(
      applySubclassFormEdits(
        {},
        'draft-1',
        values,
        [],
        [{ id: 'draft-1', classId: 'class-1', source: 'homebrew' }],
      ),
    ).toEqual({
      'draft-1': values,
    })
  })

  it('clears edits when values match the merged base', () => {
    const subclass = {
      id: 'sub-1',
      classId: 'class-1',
      source: 'homebrew' as const,
      status: 'published',
      name: 'Champion',
      slug: 'champion',
      features: [],
    } as unknown as Subclass

    const values: SubclassFormValues = {
      name: 'Champion',
      slug: 'champion',
      tagline: '',
      description: '',
      features: [],
    }

    expect(
      applySubclassFormEdits({ 'sub-1': { name: 'Old name' } }, 'sub-1', values, [subclass], []),
    ).toEqual({})
  })
})
