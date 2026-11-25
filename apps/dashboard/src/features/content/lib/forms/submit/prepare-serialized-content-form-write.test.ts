import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import { organizationFormDef } from '../../../organizations/lib/organization-form-def'
import { prepareSerializedContentFormWrite } from './prepare-serialized-content-form-write.lib'

vi.mock('../registry/content-form-serialize-input.lib', () => ({
  serializeContentFormInput: vi.fn(() => ({ name: 'Wire Name', slug: 'wire-name' })),
}))

describe('prepareSerializedContentFormWrite', () => {
  it('returns payload and empty provenance for a serialized create body', () => {
    const form = {
      formState: { dirtyFields: { name: true } },
    } as unknown as UseFormReturn<Record<string, unknown>>

    const prepared = prepareSerializedContentFormWrite({
      def: organizationFormDef,
      values: { name: 'Wire Name' },
      form,
      inputCtx: undefined,
      validationIntent: 'publish',
      operation: 'create',
    })

    expect(prepared.payload).toEqual({ name: 'Wire Name', slug: 'wire-name' })
    expect(prepared.provenance).toEqual({})
  })
})
