import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import * as generateNameBatchModule from '../model/generate-name-batch'
import { useNameGeneratorPage } from './use-name-generator-page'

describe('useNameGeneratorPage', () => {
  it('disables generation when no conventions match', () => {
    const { result } = renderHook(() => useNameGeneratorPage())

    act(() => {
      result.current.setFilter('subjectKind', 'ship')
    })

    expect(result.current.matchCount).toBe(0)
    expect(result.current.isGenerateDisabled).toBe(true)
  })

  it('resets filters to defaults', () => {
    const { result } = renderHook(() => useNameGeneratorPage())

    act(() => {
      result.current.setFilter('languageId', 'elvish')
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
      result.current.setFilter('languageId', 'elvish')
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
        languageId: 'elvish',
      }),
      expect.objectContaining({ count: 10 }),
    )
    expect(generateNameBatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subjectKind: 'person',
        languageId: 'elvish',
      }),
      expect.objectContaining({ count: 10 }),
    )
    expect(result.current.filters).toEqual({ subjectKind: 'person', languageId: 'elvish' })
    expect(result.current.results[0]?.value).toBe('B')

    generateNameBatch.mockRestore()
  })
})
