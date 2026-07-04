import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

vi.mock('./content-client', () => ({
  createContent: vi.fn(),
  updateContent: vi.fn(),
}))

import { makeTestQueryClient } from '@/test/render'
import { createContent, updateContent } from './content-client'
import {
  createContentMutationHooks,
  invalidateContentWriteQueries,
  useContentWriteMutation,
} from './use-content-mutations'

const mockCreateContent = vi.mocked(createContent)
const mockUpdateContent = vi.mocked(updateContent)

function makeTestWrapper() {
  const queryClient = makeTestQueryClient()
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { Wrapper, invalidateSpy }
}

describe('invalidateContentWriteQueries', () => {
  it('invalidates the primary list key and any extras', () => {
    const queryClient = makeTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const primaryKey = (id: string) => ['campaigns', id, 'content', 'classes'] as const
    const extraKey = (id: string) => ['campaigns', id, 'content', 'skill-proficiencies'] as const

    invalidateContentWriteQueries(queryClient, 'camp-1', primaryKey, (id) => [extraKey(id)])

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: primaryKey('camp-1') })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: extraKey('camp-1') })
  })
})

describe('createContentMutationHooks', () => {
  beforeEach(() => {
    mockCreateContent.mockReset()
    mockUpdateContent.mockReset()
    mockCreateContent.mockResolvedValue({ id: 'new-1' })
    mockUpdateContent.mockResolvedValue({ id: 'existing-1' })
  })

  it('invalidates the list query on create success', async () => {
    const queryKeyFn = (id: string) => ['campaigns', id, 'content', 'species'] as const
    const { useCreateContent } = createContentMutationHooks('species', queryKeyFn)
    const { Wrapper, invalidateSpy } = makeTestWrapper()

    const { result } = renderHook(() => useCreateContent('camp-1'), { wrapper: Wrapper })
    await result.current.mutateAsync({ name: 'Elf' })

    expect(mockCreateContent).toHaveBeenCalledWith('camp-1', 'species', { name: 'Elf' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeyFn('camp-1') })
  })

  it('invalidates the list query on update success', async () => {
    const queryKeyFn = (id: string) => ['campaigns', id, 'content', 'feats'] as const
    const { useUpdateContent } = createContentMutationHooks('feats', queryKeyFn)
    const { Wrapper, invalidateSpy } = makeTestWrapper()

    const { result } = renderHook(() => useUpdateContent('camp-2', 'feat-9'), { wrapper: Wrapper })
    await result.current.mutateAsync({ name: 'Grappler' })

    expect(mockUpdateContent).toHaveBeenCalledWith('camp-2', 'feats', 'feat-9', {
      name: 'Grappler',
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeyFn('camp-2') })
  })

  it('invalidates extra query keys when configured', async () => {
    const classesKey = (id: string) => ['campaigns', id, 'content', 'classes'] as const
    const skillsKey = (id: string) => ['campaigns', id, 'content', 'skill-proficiencies'] as const
    const { useCreateContent } = createContentMutationHooks('classes', classesKey, {
      invalidateQueryKeys: (id) => [skillsKey(id)],
    })
    const { Wrapper, invalidateSpy } = makeTestWrapper()

    const { result } = renderHook(() => useCreateContent('camp-1'), { wrapper: Wrapper })
    await result.current.mutateAsync({ name: 'Fighter' })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: classesKey('camp-1') })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: skillsKey('camp-1') })
  })
})

describe('useContentWriteMutation', () => {
  beforeEach(() => {
    mockCreateContent.mockReset()
    mockUpdateContent.mockReset()
    mockCreateContent.mockResolvedValue({ id: 'new-1' })
    mockUpdateContent.mockResolvedValue({ id: 'existing-1' })
  })

  const speciesDef = {
    routeKey: 'species',
    queryKey: (id: string) => ['campaigns', id, 'content', 'species'] as const,
  }

  it('creates when entityId is omitted', async () => {
    const { Wrapper, invalidateSpy } = makeTestWrapper()
    const { result } = renderHook(() => useContentWriteMutation(speciesDef, 'camp-3'), {
      wrapper: Wrapper,
    })

    await result.current.mutateAsync({ name: 'Dwarf' })

    expect(mockCreateContent).toHaveBeenCalledWith('camp-3', 'species', { name: 'Dwarf' })
    expect(mockUpdateContent).not.toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: speciesDef.queryKey('camp-3') })
  })

  it('updates when entityId is provided', async () => {
    const { Wrapper, invalidateSpy } = makeTestWrapper()
    const { result } = renderHook(() => useContentWriteMutation(speciesDef, 'camp-4', 'sp-1'), {
      wrapper: Wrapper,
    })

    await result.current.mutateAsync({ name: 'Renamed Dwarf' })

    expect(mockUpdateContent).toHaveBeenCalledWith('camp-4', 'species', 'sp-1', {
      name: 'Renamed Dwarf',
    })
    expect(mockCreateContent).not.toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: speciesDef.queryKey('camp-4') })
  })

  it('uses def.invalidateQueryKeys on success', async () => {
    const skillsKey = (id: string) => ['campaigns', id, 'content', 'skill-proficiencies'] as const
    const classDef = {
      routeKey: 'classes',
      queryKey: (id: string) => ['campaigns', id, 'content', 'classes'] as const,
      invalidateQueryKeys: (id: string) => [skillsKey(id)],
    }
    const { Wrapper, invalidateSpy } = makeTestWrapper()
    const { result } = renderHook(() => useContentWriteMutation(classDef, 'camp-5', 'cls-1'), {
      wrapper: Wrapper,
    })

    await result.current.mutateAsync({ name: 'Wizard' })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: classDef.queryKey('camp-5') })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: skillsKey('camp-5') })
  })
})
