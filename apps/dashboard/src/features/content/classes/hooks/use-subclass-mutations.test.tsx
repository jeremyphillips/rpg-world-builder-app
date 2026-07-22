import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

vi.mock('../api/subclasses-api', () => ({
  createSubclass: vi.fn(),
  updateSubclass: vi.fn(),
  updateSubclassAvailability: vi.fn(),
  deleteSubclass: vi.fn(),
}))

import { makeTestQueryClient } from '@/test/render'
import { pickSubclass } from '../../lib/fixtures/pick'
import { createSubclass, updateSubclass, updateSubclassAvailability } from '../api/subclasses-api'
import {
  useCreateSubclass,
  useUpdateSubclass,
  useUpdateSubclassAvailability,
} from './use-subclass-mutations'
import { subclassesQueryKey } from './use-subclasses'

const mockCreateSubclass = vi.mocked(createSubclass)
const mockUpdateSubclass = vi.mocked(updateSubclass)
const mockUpdateSubclassAvailability = vi.mocked(updateSubclassAvailability)

function makeTestWrapper() {
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
    mockUpdateSubclassAvailability.mockReset()
    mockCreateSubclass.mockResolvedValue({
      ...pickSubclass('champion'),
      id: 'sub_new',
      slug: 'test-subclass',
      name: 'Test Subclass',
      source: 'homebrew',
      status: 'published',
      features: [],
    })
    mockUpdateSubclass.mockResolvedValue({
      ...pickSubclass('champion'),
      id: 'sub_existing',
      name: 'Champion (edited)',
      source: 'homebrew',
      status: 'published',
    })
    mockUpdateSubclassAvailability.mockResolvedValue({
      campaignId: 'camp_1',
      targetId: 'sub_existing',
      activeInCampaign: false,
    })
  })

  it('creates a subclass and invalidates the list query', async () => {
    const { Wrapper, invalidateSpy } = makeTestWrapper()
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
    const { Wrapper, invalidateSpy } = makeTestWrapper()
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

  it('updates availability via the dedicated route', async () => {
    const { Wrapper, invalidateSpy } = makeTestWrapper()
    const { result } = renderHook(
      () => useUpdateSubclassAvailability('camp_1', 'srd-cc-5.2.1:fighter'),
      { wrapper: Wrapper },
    )

    await result.current.mutateAsync({
      subclassId: 'sub_existing',
      activeInCampaign: false,
    })

    expect(mockUpdateSubclassAvailability).toHaveBeenCalledWith(
      'camp_1',
      'srd-cc-5.2.1:fighter',
      'sub_existing',
      false,
    )
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: subclassesQueryKey('camp_1', 'srd-cc-5.2.1:fighter'),
    })
  })
})
