import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'

import { useOrganizationMembersDetail } from './use-organization-members-detail'

const invalidateMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: () => true,
  useCampaignCharacters: () => ({ data: [], isPending: false }),
}))

vi.mock('@/features/character', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  invalidateCharacterOrganizationMembershipQueries: (...args: unknown[]) => invalidateMock(...args),
  useCampaignNpcBuildContext: () => ({
    catalogIndex: { species: new Map(), classes: new Map() },
    context: { catalog: {}, characterKind: 'npc' },
    isError: false,
    unavailable: null,
  }),
  useNpcs: () => ({ data: [], isPending: false }),
}))

vi.mock('./use-organization-members', () => ({
  useOrganizationMembers: () => ({ data: { items: [], total: 0 } }),
}))

const organization = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as const,
  functions: [],
  practices: [],
  members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
}

describe('useOrganizationMembersDetail Quick NPC handoff', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    invalidateMock.mockClear()
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('opens and cancels the createNpc overlay without closing the add drawer', () => {
    const { result } = renderHook(
      () => useOrganizationMembersDetail('campaign-test-1', organization),
      {
        wrapper,
      },
    )

    act(() => {
      result.current.openAddDrawer()
    })
    expect(result.current.drawerState).toEqual({ mode: 'add' })

    act(() => {
      result.current.openCreateNpcModal()
    })
    expect(result.current.drawerState).toEqual({ mode: 'createNpc' })

    act(() => {
      result.current.cancelCreateNpcModal()
    })
    expect(result.current.drawerState).toEqual({ mode: 'add' })
  })

  it('invalidates membership reads and closes all overlays when Quick NPC creation succeeds', async () => {
    const { result } = renderHook(
      () => useOrganizationMembersDetail('campaign-test-1', organization),
      {
        wrapper,
      },
    )

    act(() => {
      result.current.openCreateNpcModal()
    })

    await act(async () => {
      await result.current.handleQuickNpcContentCreated({
        contentType: 'npcs',
        id: 'npc-character-1',
      })
    })

    await waitFor(() => {
      expect(invalidateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          campaignId: 'campaign-test-1',
          characterId: 'npc-character-1',
          subjectKind: 'npc',
          organizationIds: [organization.id],
        }),
      )
    })
    expect(result.current.drawerState).toBeNull()
  })

  it('ignores non-npc CreatedContentResult payloads', async () => {
    const { result } = renderHook(
      () => useOrganizationMembersDetail('campaign-test-1', organization),
      {
        wrapper,
      },
    )

    act(() => {
      result.current.openCreateNpcModal()
    })

    await act(async () => {
      await result.current.handleQuickNpcContentCreated({
        contentType: 'locations',
        id: 'location-1',
      })
    })

    expect(invalidateMock).not.toHaveBeenCalled()
    expect(result.current.drawerState).toEqual({ mode: 'createNpc' })
  })

  it('exposes build context readiness for the Add member picker', () => {
    const { result } = renderHook(
      () => useOrganizationMembersDetail('campaign-test-1', organization),
      {
        wrapper,
      },
    )

    expect(result.current.quickNpc).toMatchObject({
      campaignId: 'campaign-test-1',
      buildContextFailed: false,
    })
    expect(result.current.quickNpc.buildContext).toBeTruthy()
  })
})
