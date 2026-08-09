import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'

import { organizationConnectedCharactersQueryKey } from '@/features/content'
import { campaignCharacterQueryKey } from '@/features/campaign'

import { characterOrganizationReferencesQueryKey } from './use-character-organization-references'
import { useCharacterOrganizationMembershipMutations } from './use-character-organization-membership-mutations'

vi.mock('../api/organization-membership-client', () => ({
  createCharacterOrganizationMembership: vi.fn(),
  updateCharacterOrganizationMembership: vi.fn(),
  deleteCharacterOrganizationMembership: vi.fn(),
}))

import {
  createCharacterOrganizationMembership,
  deleteCharacterOrganizationMembership,
  updateCharacterOrganizationMembership,
} from '../api/organization-membership-client'

const createMock = vi.mocked(createCharacterOrganizationMembership)
const updateMock = vi.mocked(updateCharacterOrganizationMembership)
const deleteMock = vi.mocked(deleteCharacterOrganizationMembership)

describe('useCharacterOrganizationMembershipMutations', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    createMock.mockReset()
    updateMock.mockReset()
    deleteMock.mockReset()
    createMock.mockResolvedValue({
      organizationMembership: { organizationId: 'org-1', title: 'Boss' },
    })
    updateMock.mockResolvedValue({
      organizationMembership: { organizationId: 'org-1' },
    })
    deleteMock.mockResolvedValue({ ok: true })
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('invalidates references, detail, and only the affected organization connected-characters key', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () => useCharacterOrganizationMembershipMutations('camp-1', 'char-1', 'pc'),
      { wrapper },
    )

    await result.current.addMembership({ organizationId: 'org-1', title: 'Boss' })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: characterOrganizationReferencesQueryKey('camp-1', 'char-1'),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: campaignCharacterQueryKey('camp-1', 'char-1'),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: organizationConnectedCharactersQueryKey('camp-1', 'org-1'),
      })
    })

    invalidateSpy.mockClear()
    await result.current.updateMembership('org-1', { title: null })
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: organizationConnectedCharactersQueryKey('camp-1', 'org-1'),
      })
    })

    invalidateSpy.mockClear()
    await result.current.removeMembership('org-1')
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: organizationConnectedCharactersQueryKey('camp-1', 'org-1'),
      })
    })

    expect(createMock).toHaveBeenCalledWith('camp-1', 'char-1', {
      organizationId: 'org-1',
      title: 'Boss',
    })
    expect(updateMock).toHaveBeenCalledWith('camp-1', 'char-1', 'org-1', { title: null })
    expect(deleteMock).toHaveBeenCalledWith('camp-1', 'char-1', 'org-1')
  })
})
