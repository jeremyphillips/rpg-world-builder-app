import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

vi.mock('../api/subclasses-api', () => ({
  createSubclass: vi.fn(),
  updateSubclass: vi.fn(),
  deleteSubclass: vi.fn(),
}))

import { makeTestQueryClient } from '@/test/render'
import { makeSubclass } from '@/test/fixtures/factories/additional/subclass'
import { pickSubclass } from '../../lib/fixtures/pick'
import { createSubclass, updateSubclass } from '../api/subclasses-api'
import { useCreateSubclass, useUpdateSubclass } from './use-subclass-mutations'
import { subclassesQueryKey } from './use-subclasses'

const mockCreateSubclass = vi.mocked(createSubclass)
const mockUpdateSubclass = vi.mocked(updateSubclass)

function createTestWrapper() {
  const queryClient = makeTestQueryClient()
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { Wrapper, invalidateSpy }
}

describe('use-subclass-mutations', () => {
  beforeEach(() => {
    mockCreateSubclass.mockReset()
    mockUpdateSubclass.mockReset()
    mockCreateSubclass.mockResolvedValue(
      makeSubclass({
        ...pickSubclass('champion'),
        id: 'sub_new',
        slug: 'test-subclass',
        name: 'Test Subclass',
        source: 'homebrew',
        status: 'published',
        features: [],
      }),
    )
    mockUpdateSubclass.mockResolvedValue(
      makeSubclass({
        ...pickSubclass('champion'),
        id: 'sub_existing',
        name: 'Champion (edited)',
        source: 'homebrew',
        status: 'published',
      }),
    )
  })

  it('creates a subclass and invalidates the list query', async () => {
    const { Wrapper, invalidateSpy } = createTestWrapper()
    const { result } = renderHook(() => useCreateSubclass('camp_1', 'srd-cc-5.2.1:fighter'), {
      wrapper: Wrapper,
    })

    await result.current.mutateAsync({
      slug: 'test-subclass',
      name: 'Test Subclass',
      classId: 'srd-cc-5.2.1:fighter',
      features: [],
    })

    expect(mockCreateSubclass).toHaveBeenCalledWith('camp_1', 'srd-cc-5.2.1:fighter', {
      slug: 'test-subclass',
      name: 'Test Subclass',
      classId: 'srd-cc-5.2.1:fighter',
      features: [],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: subclassesQueryKey('camp_1', 'srd-cc-5.2.1:fighter'),
    })
  })

  it('updates a subclass with the full body payload', async () => {
    const { Wrapper, invalidateSpy } = createTestWrapper()
    const { result } = renderHook(() => useUpdateSubclass('camp_1', 'srd-cc-5.2.1:fighter'), {
      wrapper: Wrapper,
    })

    await result.current.mutateAsync({
      subclassId: 'sub_existing',
      input: { name: 'Champion (edited)' },
    })

    expect(mockUpdateSubclass).toHaveBeenCalledWith(
      'camp_1',
      'srd-cc-5.2.1:fighter',
      'sub_existing',
      { name: 'Champion (edited)' },
    )
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: subclassesQueryKey('camp_1', 'srd-cc-5.2.1:fighter'),
    })
  })
})
