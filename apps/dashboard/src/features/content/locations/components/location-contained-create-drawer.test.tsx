import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS, type ContentCampaignAccessPatch } from '@rpg/contracts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from '@rpg/ui'

import type * as RpgUi from '@rpg/ui'

import { notifyContentCreated } from '@/lib/notify'
import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING } from '../../lib/campaign-access/campaign-access-labels'
import { HARBORFORD } from '../fixtures'
import { LocationContainedCreateDrawer } from './location-contained-create-drawer.client'

const mutateAsync = vi.fn()
const updateRouteContentCampaignAccess = vi.fn()

vi.mock('../../lib/list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useContentWriteMutation: () => ({
      mutateAsync,
      isPending: false,
    }),
  }
})

vi.mock('../../lib/campaign-access/campaign-access-api', () => ({
  updateRouteContentCampaignAccess: (...args: unknown[]) =>
    updateRouteContentCampaignAccess(...args),
}))

vi.mock('../../lib/forms/shells/content-form-shell-layout', () => ({
  ContentFormOptionsGate: ({ children }: { children: (ctx: object) => React.ReactNode }) =>
    children({
      campaignId: STORY_CAMPAIGN_ID,
      campaignRules: {},
      options: { locationEntities: [] },
    }),
}))

vi.mock('../../lib/campaign-access/campaign-access-section.client', () => ({
  CampaignAccessSection: ({
    onDraftChange,
  }: {
    onDraftChange?: (patch: ContentCampaignAccessPatch) => void
  }) => (
    <div>
      <button type="button" onClick={() => onDraftChange?.(DEFAULT_CONTENT_CAMPAIGN_ACCESS)}>
        Use default campaign access
      </button>
      <button
        type="button"
        onClick={() =>
          onDraftChange?.({
            ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
            available: false,
          })
        }
      >
        Use restricted campaign access
      </button>
    </div>
  ),
}))

vi.mock('../lib/location-create-shortcuts', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  const buildLocationCreateInitialValues = actual.buildLocationCreateInitialValues as (
    ...args: unknown[]
  ) => Record<string, unknown> | undefined

  return {
    ...actual,
    buildLocationCreateInitialValues: (...args: unknown[]) => ({
      ...buildLocationCreateInitialValues(...args),
      planeType: 'material',
      settlementType: 'city',
      interiorType: 'room',
    }),
  }
})

vi.mock('@/lib/notify', () => ({
  notifyContentCreated: vi.fn(),
}))

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof RpgUi>()
  return {
    ...actual,
    toast: {
      ...actual.toast,
      warning: vi.fn(),
    },
  }
})

function renderDrawer(onOpenChange = vi.fn()) {
  const queryClient = makeTestQueryClient()
  return {
    onOpenChange,
    ...render(
      <QueryClientProvider client={queryClient}>
        <LocationContainedCreateDrawer
          open
          onOpenChange={onOpenChange}
          fixedCreate={{
            authoringType: 'building',
            parent: { kind: 'fixed', locationId: HARBORFORD.id },
          }}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    ),
  }
}

async function submitDrawer(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Harbor Inn')
  await user.click(screen.getByRole('button', { name: 'Create location' }))
}

describe('LocationContainedCreateDrawer', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    updateRouteContentCampaignAccess.mockReset()
    vi.mocked(notifyContentCreated).mockReset()
    vi.mocked(toast.warning).mockReset()
    mutateAsync.mockResolvedValue({ id: 'location-new' })
    updateRouteContentCampaignAccess.mockResolvedValue(undefined)
  })

  it('renders the contextual add heading', () => {
    renderDrawer()
    expect(screen.getByRole('heading', { name: 'Add building' })).toBeInTheDocument()
  })

  it('creates with default campaign access draft without PATCH and closes the drawer', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDrawer(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'Use default campaign access' }))
    await submitDrawer(user)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(updateRouteContentCampaignAccess).not.toHaveBeenCalled()
    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('PATCHes campaign access after create when draft is non-default and closes the drawer', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDrawer(onOpenChange)
    const pendingAccess = {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      available: false,
    }

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitDrawer(user)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce()
      expect(updateRouteContentCampaignAccess).toHaveBeenCalledWith(
        STORY_CAMPAIGN_ID,
        'locations',
        'location-new',
        pendingAccess,
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('submits fixed building context without leaking incompatible form values', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await submitDrawer(user)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce()
    })

    const payload = mutateAsync.mock.calls[0]?.[0] as Record<string, unknown>
    expect(payload).toMatchObject({
      name: 'Harbor Inn',
      parentLocationId: HARBORFORD.id,
      kind: 'structure',
      structureType: 'building',
      status: 'published',
    })
    expect(payload).not.toHaveProperty('planeType')
    expect(payload).not.toHaveProperty('settlementType')
    expect(payload).not.toHaveProperty('interiorType')
  })

  it('closes after create when deferred access PATCH fails and warns without double-create', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    updateRouteContentCampaignAccess.mockRejectedValue(new Error('network'))
    renderDrawer(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitDrawer(user)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(toast.warning).toHaveBeenCalledWith(CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING)
    expect(notifyContentCreated).not.toHaveBeenCalled()
  })
})
