import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
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
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import type { LocationCreateIntent } from '../lib/location-create-session'
import { createSettlementWithStartingDistricts } from '../lib/location-settlement-create-composition.lib'
import {
  SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
  SETTLEMENT_CREATE_SETUP_PROMPT,
} from '../lib/location-settlement-create-setup.lib'
import { LocationCreateModal } from './location-create-modal.client'

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
  ContentFormOptionsGate: ({ children }: { children: (ctx: object) => ReactNode }) =>
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

const buildingIntent = {
  authoringType: 'building',
  parentLocationId: HARBORFORD.id,
  parentKind: HARBORFORD.kind,
} as const satisfies LocationCreateIntent

const settlementIntent = {
  authoringType: 'settlement',
  parentLocationId: HARBORFORD.id,
  parentKind: HARBORFORD.kind,
} as const satisfies LocationCreateIntent

const regionIntent = {
  authoringType: 'region',
  parentLocationId: HARBORFORD.id,
  parentKind: HARBORFORD.kind,
} as const satisfies LocationCreateIntent

function renderModal(intent: LocationCreateIntent, onOpenChange = vi.fn(), open = true) {
  const queryClient = makeTestQueryClient()
  return {
    onOpenChange,
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <LocationCreateModal
          open={open}
          onOpenChange={onOpenChange}
          intent={intent}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    ),
  }
}

async function continueSettlementSetup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('City') }))
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  expect(await screen.findByRole('heading', { name: 'Create city' })).toBeInTheDocument()
}

async function continueBuildingSetup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'No organization' }))
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  expect(await screen.findByRole('heading', { name: 'Create building' })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
}

async function submitCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Harbor Inn')
  await user.click(screen.getByRole('button', { name: 'Create location' }))
}

describe('LocationCreateModal', () => {
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

  it('requires only operator intent and allows Form and Facility to remain unspecified', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    expect(screen.getByRole('heading', { name: 'Create building' })).toBeInTheDocument()
    expect(
      screen.getByRole('radiogroup', { name: 'What physical form does this building have?' }),
    ).toBeVisible()
    expect(
      screen.getByRole('radiogroup', { name: 'What is this building configured to be?' }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await continueBuildingSetup(user)
  })

  it('renders settlement-type create headings after setup continue', async () => {
    const user = userEvent.setup()
    renderModal(settlementIntent)

    expect(screen.getByRole('heading', { name: 'Create settlement' })).toBeInTheDocument()
    await continueSettlementSetup(user)

    expect(screen.getByRole('heading', { name: 'Create city' })).toBeInTheDocument()
    expect(screen.getByText('Structure')).toBeInTheDocument()
    expect(screen.getByText('No starting districts yet.')).toBeInTheDocument()
  })

  it('keeps setup → details in the same modal with a compact settlement summary', async () => {
    const user = userEvent.setup()
    renderModal(settlementIntent)

    expect(
      screen.getByRole('radiogroup', { name: SETTLEMENT_CREATE_SETUP_PROMPT }),
    ).toBeInTheDocument()

    await continueSettlementSetup(user)

    expect(
      screen.queryByRole('radiogroup', { name: SETTLEMENT_CREATE_SETUP_PROMPT }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(SETTLEMENT_CREATE_SETUP_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('shows setup navigation and the operator summary for Building details', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByText('No organization')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).toBeInTheDocument()
  })

  it('reapplies Building setup through canonical form values without losing the draft', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('House') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Brewery') }))
    await continueBuildingSetup(user)
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Copper Kettle')

    await user.click(screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }))
    const brewerySummary = screen.getByRole('heading', { name: 'Brewery' }).closest('article')
    expect(brewerySummary).not.toBeNull()
    await user.click(within(brewerySummary!).getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Temple') }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Copper Kettle')
    expect(screen.getByText('House · Temple · No organization')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create location' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())

    expect(mutateAsync.mock.calls[0]?.[0]).toMatchObject({
      name: 'Copper Kettle',
      classification: { form: 'house', facilityType: 'temple' },
    })
  })

  it('creates with default campaign access draft without PATCH and closes the modal', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)

    await user.click(screen.getByRole('button', { name: 'Use default campaign access' }))
    await submitCreateForm(user)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(updateRouteContentCampaignAccess).not.toHaveBeenCalled()
    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('PATCHes campaign access after create when draft is non-default and closes the modal', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)
    const pendingAccess = {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      available: false,
    }

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitCreateForm(user)

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
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    await submitCreateForm(user)

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
    expect(payload).not.toHaveProperty('classification')
  })

  it('closes after create when deferred access PATCH fails and warns without double-create', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    updateRouteContentCampaignAccess.mockRejectedValue(new Error('network'))
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitCreateForm(user)

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
    renderModal(settlementIntent, onOpenChange)

    await continueSettlementSetup(user)
    await submitCreateForm(user)

    await waitFor(() => {
      expect(createSettlementWithStartingDistricts).toHaveBeenCalledOnce()
      expect(mutateAsync).not.toHaveBeenCalled()
      expect(invalidateContentFormDefQueries).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
  })

  it('prompts on close when starting-district composition is dirty', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(settlementIntent, onOpenChange)

    await continueSettlementSetup(user)
    await user.click(screen.getByRole('button', { name: 'Add district' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('prompts when Cancel follows Back after dirty details edits', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(settlementIntent, onOpenChange)

    await continueSettlementSetup(user)
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Dockside')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes without discard confirmation after successful settlement create with dirty composition', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(settlementIntent, onOpenChange)

    await continueSettlementSetup(user)
    await user.click(screen.getByRole('button', { name: 'Add district' }))
    await user.type(screen.getByRole('textbox', { name: 'District name 1' }), 'Dock Ward')
    await submitCreateForm(user)

    await waitFor(() => {
      expect(createSettlementWithStartingDistricts).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('resets starting-district composition when the modal reopens', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const queryClient = makeTestQueryClient()

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <LocationCreateModal
          open
          onOpenChange={onOpenChange}
          intent={settlementIntent}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    await continueSettlementSetup(user)
    await user.click(screen.getByRole('button', { name: 'Add district' }))
    await user.type(screen.getByRole('textbox', { name: 'District name 1' }), 'Dock Ward')

    rerender(
      <QueryClientProvider client={queryClient}>
        <LocationCreateModal
          open={false}
          onOpenChange={onOpenChange}
          intent={settlementIntent}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    rerender(
      <QueryClientProvider client={queryClient}>
        <LocationCreateModal
          open
          onOpenChange={onOpenChange}
          intent={settlementIntent}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    await continueSettlementSetup(user)
    expect(screen.getByText('No starting districts yet.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('clears region type when classification changes via dependsOn', async () => {
    const user = userEvent.setup()
    renderModal(regionIntent)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    const regionTypeGroup = screen.getByRole('radiogroup', { name: 'Region type' })
    const firstRegionType = within(regionTypeGroup).getAllByRole('radio')[0]
    expect(firstRegionType).toBeTruthy()
    await user.click(firstRegionType!)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Geographic') }))

    const clearedRegionTypeGroup = screen.getByRole('radiogroup', { name: 'Region type' })
    expect(
      within(clearedRegionTypeGroup).queryByRole('radio', { checked: true }),
    ).not.toBeInTheDocument()
    expect(
      within(clearedRegionTypeGroup).getByRole('radio', {
        name: (name) => name.startsWith('Continent'),
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('shows multi-line region summary Change, returns to terminal setup, and preserves Name', async () => {
    const user = userEvent.setup()
    renderModal(regionIntent)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    const firstRegionType = within(
      screen.getByRole('radiogroup', { name: 'Region type' }),
    ).getAllByRole('radio')[0]
    expect(firstRegionType).toBeTruthy()
    const firstRegionTypeName = within(firstRegionType!).getByText(
      /^(Realm|Kingdom|Empire|Country|State|Province|Territory|Duchy|County|Frontier)$/,
    ).textContent
    expect(firstRegionTypeName).toBeTruthy()
    await user.click(firstRegionType!)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText(`Political · ${firstRegionTypeName}`)).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Westmark')
    await user.click(screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }))

    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Political' })).toBeInTheDocument()
    expect(
      screen.queryByRole('radiogroup', {
        name: (name) => name.startsWith('What kind of'),
      }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Westmark')
    expect(screen.getByText(`Political · ${firstRegionTypeName}`)).toBeInTheDocument()
  })
})
