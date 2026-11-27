import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import { monsterFormDef } from '../../../monsters/lib/monster-form-def'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../monsters/lib/monster-form-values'
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

  it('returns nested cleanup provenance for monster serializePreparedWrite', () => {
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Scout',
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        skills: [
          { skill: 'stealth', rank: 'proficient' as const },
          { skill: 'stealth', rank: 'expertise' as const },
          { skill: 'perception', rank: 'proficient' as const },
        ],
      },
    }
    const form = {
      formState: { dirtyFields: {} },
    } as unknown as UseFormReturn<MonsterFormValues>

    const prepared = prepareSerializedContentFormWrite({
      def: monsterFormDef,
      values,
      form,
      inputCtx: undefined,
      validationIntent: 'draft',
      operation: 'create',
    })

    expect(prepared.provenance.pathMap).toEqual({ name: 'slug' })
    expect(prepared.provenance.filteredRowIndexBySourceIndex?.['proficiencies.skills']).toEqual({
      0: 0,
      2: 1,
    })
    expect(prepared.payload).toMatchObject({
      name: 'Scout',
      slug: 'scout',
    })
  })
})
