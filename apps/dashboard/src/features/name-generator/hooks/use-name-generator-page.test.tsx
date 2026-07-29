import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'

import * as composeModule from '../model/compose-name-generator-conventions'
import type { ComposedNameGeneratorConventions } from '../model/compose-name-generator-conventions'
import * as generateNameBatchModule from '../model/generate-name-batch'
import type { SpeciesNamingOption } from '@rpg/name-generator-integrations'
import { setFilterValue } from '@rpg/ui/filters'

import { useNameGeneratorPage } from './use-name-generator-page'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useActiveCampaignId: () => 'camp_1',
  }
})

vi.mock('@/features/content/species/hooks/use-species', () => ({
  useSpecies: () => ({
    data: [
      {
        id: 'srd-cc-5.2.1:elf',
        slug: 'elf',
        name: 'Elf',
        source: 'system',
        status: 'published',
        languageAffinities: ['elvish'],
        culture: {
          id: 'elven',
          name: 'Elven',
          naming: { supported: true, personalNameComponents: ['family'] },
        },
      },
    ],
  }),
}))

const composed = {
  conventions: [ELVISH_PERSONAL_CONVENTION],
  speciesNamingOptions: [
    {
      speciesId: 'srd-cc-5.2.1:elf',
      label: 'Elf',
      disabled: false,
      cultureIds: ['elven'],
      subjectKinds: ['person'],
    },
  ] satisfies SpeciesNamingOption[],
  getConvention: (id: string) =>
    id === ELVISH_PERSONAL_CONVENTION.id ? ELVISH_PERSONAL_CONVENTION : undefined,
} satisfies ComposedNameGeneratorConventions

vi.spyOn(composeModule, 'composeNameGeneratorConventions').mockReturnValue(composed)
vi.spyOn(composeModule, 'buildCultureFilterContexts').mockReturnValue([
  { id: 'elven', label: 'Elven', languageIds: ['elvish'] },
])

describe('useNameGeneratorPage', () => {
  it('disables generation when no conventions match', () => {
    const { result } = renderHook(() => useNameGeneratorPage())

    act(() => {
      result.current.setFilters({ subjectKind: 'ship' })
    })

    expect(result.current.matchCount).toBe(0)
    expect(result.current.isGenerateDisabled).toBe(true)
  })

  it('resets filters to defaults', () => {
    const { result } = renderHook(() => useNameGeneratorPage())

    act(() => {
      result.current.setFilters(
        setFilterValue(result.current.filterSchema, result.current.filters, 'languageId', 'elvish'),
      )
      result.current.resetFilters()
    })

    expect(result.current.filters).toEqual({ subjectKind: 'person' })
  })

  it('preserves filters while regenerating with a new seed', async () => {
    const generateNameBatch = vi
      .spyOn(generateNameBatchModule, 'generateNameBatch')
      .mockResolvedValueOnce({
        results: [{ value: 'A', conventionId: 'elvish-personal', structureId: 'full', parts: {} }],
        seed: 'seed-a',
        matches: [{ conventionId: 'elvish-personal', score: 10, reasons: [] }],
      })
      .mockResolvedValueOnce({
        results: [{ value: 'B', conventionId: 'elvish-personal', structureId: 'full', parts: {} }],
        seed: 'seed-b',
        matches: [{ conventionId: 'elvish-personal', score: 10, reasons: [] }],
      })

    const { result } = renderHook(() => useNameGeneratorPage())

    act(() => {
      result.current.setFilters(
        setFilterValue(result.current.filterSchema, result.current.filters, 'cultureId', 'elven'),
      )
    })

    await waitFor(() => {
      expect(result.current.filters.cultureId).toBe('elven')
    })

    await act(async () => {
      await result.current.generate()
    })

    await act(async () => {
      await result.current.regenerate()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(generateNameBatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subjectKind: 'person',
        cultureId: 'elven',
      }),
      expect.objectContaining({ count: 10 }),
      expect.objectContaining({
        conventions: expect.any(Array),
        getConvention: expect.any(Function),
      }),
    )
    expect(generateNameBatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subjectKind: 'person',
        cultureId: 'elven',
      }),
      expect.objectContaining({ count: 10 }),
      expect.objectContaining({
        conventions: expect.any(Array),
        getConvention: expect.any(Function),
      }),
    )
    expect(result.current.filters).toEqual({ subjectKind: 'person', cultureId: 'elven' })
    expect(result.current.results[0]?.value).toBe('B')

    generateNameBatch.mockRestore()
  })
})
