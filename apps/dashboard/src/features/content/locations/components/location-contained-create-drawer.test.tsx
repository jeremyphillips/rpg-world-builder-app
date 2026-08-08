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
import { createSettlementWithStartingDistricts } from '../lib/location-settlement-create-composition.lib'
import { LocationContainedCreateDrawer } from './location-contained-create-drawer.client'

const mutateAsync = vi.fn()
const updateRouteContentCampaignAccess = vi.fn()
const invalidateContentFormDefQueries = vi.fn()

vi.mock('../../lib/list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useContentWriteMutation: () => ({
      mutateAsync,
      isPending: false,
    }),
    invalidateContentFormDefQueries: (...args: unknown[]) =>
      invalidateContentFormDefQueries(...args),
  }
})

vi.mock('../lib/location-settlement-create-composition.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    createSettlementWithStartingDistricts: vi.fn(),
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

function renderDrawer(
  fixedCreate: {
    authoringType: 'building' | 'settlement'
    parent: { kind: 'fixed'; locationId: string }
    settlementType?: 'city'
  },
  onOpenChange = vi.fn(),
) {
  const queryClient = makeTestQueryClient()
  return {
    onOpenChange,
    ...render(
      <QueryClientProvider client={queryClient}>
        <LocationContainedCreateDrawer
          open
          onOpenChange={onOpenChange}
          fixedCreate={fixedCreate}
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
    invalidateContentFormDefQueries.mockReset()
    vi.mocked(createSettlementWithStartingDistricts).mockReset()
    vi.mocked(notifyContentCreated).mockReset()
    vi.mocked(toast.warning).mockReset()
    mutateAsync.mockResolvedValue({ id: 'location-new' })
    updateRouteContentCampaignAccess.mockResolvedValue(undefined)
    vi.mocked(createSettlementWithStartingDistricts).mockResolvedValue({
      settlement: { id: 'settlement-new' },
      deferredAccessFailed: false,
      districts: { created: [], failed: [] },
    })
  })

  it('renders the contextual add heading', () => {
    renderDrawer({
      authoringType: 'building',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    })
    expect(screen.getByRole('heading', { name: 'Add building' })).toBeInTheDocument()
  })

  it('renders settlement-type add headings for fixed settlement create', () => {
    renderDrawer({
      authoringType: 'settlement',
      settlementType: 'city',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    })
    expect(screen.getByRole('heading', { name: 'Add city' })).toBeInTheDocument()
    expect(screen.getByText('Structure')).toBeInTheDocument()
    expect(screen.getByText('No starting districts yet.')).toBeInTheDocument()
  })

  it('creates with default campaign access draft without PATCH and closes the drawer', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDrawer(
      {
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
      onOpenChange,
    )

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
    renderDrawer(
      {
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
      onOpenChange,
    )
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
    renderDrawer({
      authoringType: 'building',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    })

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
    renderDrawer(
      {
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
      onOpenChange,
    )

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitDrawer(user)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(toast.warning).toHaveBeenCalledWith(CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING)
    expect(notifyContentCreated).not.toHaveBeenCalled()
  })

  it('uses the settlement workflow instead of the form mutation hook', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDrawer(
      {
        authoringType: 'settlement',
        settlementType: 'city',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
      onOpenChange,
    )

    await submitDrawer(user)

    await waitFor(() => {
      expect(createSettlementWithStartingDistricts).toHaveBeenCalledOnce()
      expect(mutateAsync).not.toHaveBeenCalled()
      expect(invalidateContentFormDefQueries).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
  })

  it('prompts on cancel when starting-district composition is dirty', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDrawer(
      {
        authoringType: 'settlement',
        settlementType: 'city',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
      onOpenChange,
    )

    await user.click(screen.getByRole('button', { name: 'Add district' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes without discard confirmation after successful settlement create with dirty composition', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDrawer(
      {
        authoringType: 'settlement',
        settlementType: 'city',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
      onOpenChange,
    )

    await user.click(screen.getByRole('button', { name: 'Add district' }))
    await user.type(screen.getByRole('textbox', { name: 'District name 1' }), 'Dock Ward')
    await submitDrawer(user)

    await waitFor(() => {
      expect(createSettlementWithStartingDistricts).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('resets starting-district composition when the drawer reopens', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const queryClient = makeTestQueryClient()
    const fixedCreate = {
      authoringType: 'settlement' as const,
      settlementType: 'city' as const,
      parent: { kind: 'fixed' as const, locationId: HARBORFORD.id },
    }

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <LocationContainedCreateDrawer
          open
          onOpenChange={onOpenChange}
          fixedCreate={fixedCreate}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add district' }))
    await user.type(screen.getByRole('textbox', { name: 'District name 1' }), 'Dock Ward')

    rerender(
      <QueryClientProvider client={queryClient}>
        <LocationContainedCreateDrawer
          open={false}
          onOpenChange={onOpenChange}
          fixedCreate={fixedCreate}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    rerender(
      <QueryClientProvider client={queryClient}>
        <LocationContainedCreateDrawer
          open
          onOpenChange={onOpenChange}
          fixedCreate={fixedCreate}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByText('No starting districts yet.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
