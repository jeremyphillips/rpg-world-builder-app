import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { campaignCharacterQueryKey } from '@/features/campaign'
import { organizationMembersQueryKey } from '@/features/content'

import {
  createCharacterRelationship,
  deleteCharacterRelationship,
  updateCharacterRelationship,
} from '../api/character-relationship-client'
import { characterRelationshipsQueryKey } from './use-character-relationships'
import { useCharacterRelationshipMutations } from './use-character-relationship-mutations'

vi.mock('../api/character-relationship-client', () => ({
  createCharacterRelationship: vi.fn(),
  updateCharacterRelationship: vi.fn(),
  deleteCharacterRelationship: vi.fn(),
  createCharacterRelationshipIdempotencyKey: vi.fn(() => 'idem-1'),
}))

const createMock = vi.mocked(createCharacterRelationship)
const updateMock = vi.mocked(updateCharacterRelationship)
const deleteMock = vi.mocked(deleteCharacterRelationship)

describe('useCharacterRelationshipMutations', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    createMock.mockReset()
    updateMock.mockReset()
    deleteMock.mockReset()
    createMock.mockResolvedValue({
      relationship: {
        id: 'edge-1',
        campaignId: 'camp-1',
        revision: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        createdByUserId: 'user-1',
        visibility: 'dm_only',
        participantIds: [],
        kind: 'organizationMembership',
        characterId: 'char-1',
        organizationId: 'org-1',
        details: { lifecycle: 'current', priority: 50 },
      },
    })
    updateMock.mockResolvedValue({
      relationship: {
        id: 'edge-1',
        campaignId: 'camp-1',
        revision: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        createdByUserId: 'user-1',
        visibility: 'dm_only',
        participantIds: [],
        kind: 'organizationMembership',
        characterId: 'char-1',
        organizationId: 'org-1',
        details: { lifecycle: 'current', priority: 50, title: 'Captain' },
      },
    })
    deleteMock.mockResolvedValue({ ok: true })
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('invalidates relationship, detail, organization members, and connected-party queries', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () =>
        useCharacterRelationshipMutations('camp-1', {
          characters: [{ characterId: 'char-1', subjectKind: 'pc' }],
          organizationIds: ['org-1'],
          locationIds: ['loc-1'],
        }),
      { wrapper },
    )

    await result.current.createRelationship({
      idempotencyKey: 'idem-1',
      relationship: {
        kind: 'organizationMembership',
        characterId: 'char-1',
        organizationId: 'org-1',
      },
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: characterRelationshipsQueryKey('camp-1', 'char-1'),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: campaignCharacterQueryKey('camp-1', 'char-1'),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: organizationMembersQueryKey('camp-1', 'org-1'),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['campaigns', 'camp-1', 'locations', 'loc-1', 'connected-parties'],
      })
    })

    invalidateSpy.mockClear()
    await result.current.updateRelationship('edge-1', {
      expectedRevision: 1,
      details: { title: 'Captain' },
    })
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: characterRelationshipsQueryKey('camp-1', 'char-1'),
      })
    })

    invalidateSpy.mockClear()
    await result.current.deleteRelationship('edge-1', { expectedRevision: 2 })
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: characterRelationshipsQueryKey('camp-1', 'char-1'),
      })
    })
  })
})
