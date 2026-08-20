import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  BUILDING_FORM_ENTRIES,
  buildContentPurposeSelectors,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  getEffectiveBuildingFunctions,
  type BuildingClassification,
  type BuildingForm,
  type ContentCampaignAccessPatch,
} from '@rpg/contracts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from '@rpg/ui'

import type * as RpgUi from '@rpg/ui'

import { notifyContentCreated } from '@/lib/notify'
import type { OnContentCreated } from '@/lib/create-flow'
import {
  makeBuildingLocationCreateIntent,
  makeLocationCreateIntent,
  makeRegionLocationCreateIntent,
  makeSettlementLocationCreateIntent,
} from '@/test/fixtures/factories/additional/location-create-intent'
import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { HARBORFORD } from '../fixtures'
import {
  BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL,
  BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL,
} from '../lib/building-organizations-create-tab.lib'
import { BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL } from '../lib/location-building-create-setup.lib'
import type { LocationCreateIntent } from '../lib/location-create-session'
import { createSettlementWithStartingDistricts } from '../lib/location-settlement-create-composition.lib'
import {
  completeBuildingCreateComposition,
  applyDeferredBuildingCampaignAccess,
} from '../lib/location-building-create-composition.lib'
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

vi.mock('../lib/location-building-create-composition.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    completeBuildingCreateComposition: vi.fn(async () => ({
      buildingId: 'building-1',
      toast: { kind: 'success' as const },
    })),
    invalidateBuildingCreateCompositionQueries: vi.fn(),
    applyDeferredBuildingCampaignAccess: vi.fn(async () => false),
  }
})

vi.mock('../../organizations', () => ({
  useOrganizations: () => ({ data: [], isPending: false, isError: false }),
}))

vi.mock('../../lib/campaign-access/campaign-access-api', () => ({
  updateRouteContentCampaignAccess: (...args: unknown[]) =>
    updateRouteContentCampaignAccess(...args),
}))

vi.mock('../../lib/forms/shells/content-form-shell-layout', () => ({
  ContentFormOptionsGate: ({ children }: { children: (ctx: object) => ReactNode }) =>
    children({
      campaignId: STORY_CAMPAIGN_ID,
      campaignRules: {},
      options: { locations: buildContentPurposeSelectors([]) },
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

const buildingIntent = makeBuildingLocationCreateIntent({
  parentLocationId: HARBORFORD.id,
  parentKind: HARBORFORD.kind,
})

const settlementIntent = makeSettlementLocationCreateIntent({
  parentLocationId: HARBORFORD.id,
  parentKind: HARBORFORD.kind,
})

const regionIntent = makeRegionLocationCreateIntent({
  parentLocationId: HARBORFORD.id,
  parentKind: HARBORFORD.kind,
})

const mockedCompleteBuildingCreateComposition = vi.mocked(completeBuildingCreateComposition)
const mockedApplyDeferredBuildingCampaignAccess = vi.mocked(applyDeferredBuildingCampaignAccess)

function renderModal(
  intent: LocationCreateIntent,
  onOpenChange = vi.fn(),
  open = true,
  options?: {
    onCreated?: OnContentCreated
    createContext?: import('@/lib/create-flow').ContentCreateContext
  },
) {
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
          createContext={options?.createContext}
          onCreated={options?.onCreated}
        />
      </QueryClientProvider>,
    ),
  }
}

async function continueSettlementSetup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('City') }))
  expect(await screen.findByRole('heading', { name: 'Create city' })).toBeInTheDocument()
}

async function chooseBuildingForm(user: ReturnType<typeof userEvent.setup>, form: BuildingForm) {
  const label = BUILDING_FORM_ENTRIES[form].label
  await user.click(screen.getByRole('radio', { name: (name) => name.startsWith(label) }))
}

async function skipBuildingForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /skip \/ not specified/i }))
}

async function chooseBuildingFacilityGroup(
  user: ReturnType<typeof userEvent.setup>,
  label: 'Browse all' | 'Commercial' | 'Production' | 'Religious' | 'Residence' | 'Civic',
) {
  await user.click(screen.getByRole('radio', { name: (name) => name.startsWith(label) }))
}

async function chooseBuildingFacilityType(
  user: ReturnType<typeof userEvent.setup>,
  label:
    | 'Brewery'
    | 'Temple'
    | 'Town hall'
    | 'Residence'
    | 'Barracks'
    | 'Shop'
    | 'Watch post'
    | 'Beacon station'
    | 'Checkpoint'
    | 'Guildhall'
    | 'Armory'
    | 'Archive',
) {
  await user.click(screen.getByRole('combobox', { name: 'Facility type' }))
  await user.click(screen.getByRole('option', { name: (name) => name.startsWith(label) }))
}

async function continueBuildingSetup(
  user: ReturnType<typeof userEvent.setup>,
  facilityGroup: Parameters<typeof chooseBuildingFacilityGroup>[1] = 'Browse all',
) {
  const skipButton = screen.queryByRole('button', { name: /skip \/ not specified/i })
  if (skipButton) {
    await user.click(skipButton)
  }
  await chooseBuildingFacilityGroup(user, facilityGroup)
  expect(await screen.findByRole('heading', { name: 'Create building' })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
}

async function submitCreateForm(
  user: ReturnType<typeof userEvent.setup>,
  label = 'Create location',
) {
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Harbor Inn')
  await user.click(screen.getByRole('button', { name: label }))
}

async function submitBuildingCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await submitCreateForm(user, 'Create building')
}

describe('LocationCreateModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    updateRouteContentCampaignAccess.mockReset()
    invalidateContentFormDefQueries.mockReset()
    vi.mocked(createSettlementWithStartingDistricts).mockReset()
    mockedCompleteBuildingCreateComposition.mockReset()
    mockedApplyDeferredBuildingCampaignAccess.mockReset()
    vi.mocked(notifyContentCreated).mockReset()
    vi.mocked(toast.warning).mockReset()
    mutateAsync.mockResolvedValue({ id: 'location-new' })
    updateRouteContentCampaignAccess.mockResolvedValue(undefined)
    vi.mocked(createSettlementWithStartingDistricts).mockResolvedValue({
      settlement: { id: 'settlement-new' },
      deferredAccessFailed: false,
      districts: { created: [], failed: [] },
    })
    mockedApplyDeferredBuildingCampaignAccess.mockResolvedValue(false)
    mockedCompleteBuildingCreateComposition.mockResolvedValue({
      buildingId: 'building-1',
      toast: { kind: 'success' },
    })
  })

  it('requires Facility discovery intent while Form remains optional', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    expect(screen.getByRole('heading', { name: 'Create building' })).toBeInTheDocument()
    expect(
      screen.getByRole('radiogroup', { name: 'What physical form does this building have?' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('radiogroup', { name: 'What kind of facility are you creating?' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()

    await skipBuildingForm(user)
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
    expect(screen.getByRole('button', { name: 'Change settlement type' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('shows intrinsic setup summary and Organizations tab for Building details', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByText('Browse all')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Organizations (optional)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change facility' })).toBeInTheDocument()
  })

  it('suppresses Organizations composition for relationship-target Building create', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent, vi.fn(), true, {
      createContext: {
        kind: 'relationship-target',
        source: { contentType: 'organizations', id: 'org-1' },
        relationshipVocabulary: 'organization_location_connection',
      },
    })
    await continueBuildingSetup(user)

    expect(screen.queryByRole('tab', { name: /Organizations/i })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('submits relationship-target Building create without organization drafts', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent, vi.fn(), true, {
      createContext: {
        kind: 'relationship-target',
        source: { contentType: 'organizations', id: 'org-1' },
        relationshipVocabulary: 'organization_location_connection',
      },
    })
    await continueBuildingSetup(user)

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Guild Hall')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => {
      expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce()
    })
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      organizations: [],
      relationships: [],
    })
  })

  it('keeps Organizations composition available for contained Building create', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    expect(screen.getByRole('tab', { name: 'Organizations (optional)' })).toBeInTheDocument()
  })

  it('preserves Organization editor state through Change-to-Setup and includes it in dismissal guards', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)

    await user.click(screen.getByRole('tab', { name: 'Organizations (optional)' }))
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL }))
    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL }))
    await user.click(
      screen.getByRole('button', {
        name: `Change ${BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL.toLowerCase()}`,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      screen.getByRole('button', { name: '← Choose existing organization' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disables Create building while the Organizations composer is in progress', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ash House')
    await user.click(screen.getByRole('tab', { name: 'Organizations (optional)' }))
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL }))

    const createButton = screen.getByRole('button', { name: 'Create building' })
    expect(createButton).toBeDisabled()
    expect(mockedCompleteBuildingCreateComposition).not.toHaveBeenCalled()
  })

  it('preserves the bounded modal scroll chain when Building details expand', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    const form = screen.getAllByRole('textbox', { name: 'Name' })[0]?.closest('form')
    const visibilityWrapper = form?.parentElement
    const modalBody = document.querySelector('[data-create-modal-body]')
    const formScrollRegion = form?.firstElementChild
    const footer = screen
      .getByRole('button', { name: 'Create building' })
      .closest('.border-border-faint')

    expect(visibilityWrapper).toHaveClass('flex', 'min-h-0', 'flex-1', 'flex-col')
    expect(form).toHaveClass('flex', 'min-h-0', 'flex-1', 'flex-col')
    expect(modalBody).toHaveClass('flex', 'min-h-0', 'flex-1', 'overflow-hidden')
    expect(formScrollRegion).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto')
    expect(footer).toHaveClass('shrink-0')
  })

  it('creates the House flow with form as its only persisted classification', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(buildingIntent, onOpenChange)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('House') }))
    await continueBuildingSetup(user)

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('House')).toBeInTheDocument()
    expect(screen.getByText('Browse all')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Form' })).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ash House')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => {
      expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          name: 'Ash House',
          classification: { form: 'house' },
        }),
      },
    })
    expect(
      mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request.building.input,
    ).not.toHaveProperty('facilityAuthoringGroup')
  })

  it('creates the Tower form-only flow with Browse all', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'tower')
    await continueBuildingSetup(user)

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('Tower')).toBeInTheDocument()
    expect(screen.getByText('Browse all')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'North Spire')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          name: 'North Spire',
          classification: { form: 'tower' },
        }),
      },
    })
  })

  it('creates the Hall form-only flow with Browse all', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'hall')
    await continueBuildingSetup(user)

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('Hall')).toBeInTheDocument()
    expect(screen.getByText('Browse all')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Great Hall')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          name: 'Great Hall',
          classification: { form: 'hall' },
        }),
      },
    })
  })

  it('creates the Keep form-only flow with Browse all', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'keep')
    await continueBuildingSetup(user)

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
    expect(screen.getByText('Browse all')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Stone Keep')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          name: 'Stone Keep',
          classification: { form: 'keep' },
        }),
      },
    })
  })

  it('creates Keep + Residence without stereotypical pairing restrictions', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'keep')
    await continueBuildingSetup(user, 'Residence')
    await chooseBuildingFacilityType(user, 'Residence')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Lord Keep')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'keep', facilityType: 'residence' },
        }),
      },
    })
  })

  it('creates Keep + Barracks without stereotypical pairing restrictions', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'keep')
    await continueBuildingSetup(user, 'Civic')
    await chooseBuildingFacilityType(user, 'Barracks')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Garrison Keep')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'keep', facilityType: 'barracks' },
        }),
      },
    })
  })

  it('creates House + Shop as an open composition', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'house')
    await continueBuildingSetup(user, 'Commercial')
    await chooseBuildingFacilityType(user, 'Shop')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner Shop')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'house', facilityType: 'shop' },
        }),
      },
    })
  })

  it('creates Tower + Watch post as an open composition', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'tower')
    await continueBuildingSetup(user, 'Civic')
    await chooseBuildingFacilityType(user, 'Watch post')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Border Watch')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'tower', facilityType: 'watchtower' },
        }),
      },
    })
  })

  it('creates Hall + Guildhall without axis collision', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'hall')
    await continueBuildingSetup(user, 'Civic')
    await chooseBuildingFacilityType(user, 'Guildhall')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Smiths Hall')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'hall', facilityType: 'guildhall' },
        }),
      },
    })
  })

  it('creates Keep + Armory as an open composition', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'keep')
    await continueBuildingSetup(user, 'Civic')
    await chooseBuildingFacilityType(user, 'Armory')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Castle Armory')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'keep', facilityType: 'armory' },
        }),
      },
    })
  })

  it('creates House + Archive as an open composition', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'house')
    await continueBuildingSetup(user, 'Civic')
    await chooseBuildingFacilityType(user, 'Archive')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Record House')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'house', facilityType: 'archive' },
        }),
      },
    })
  })

  it('creates Tower + Temple without stereotypical pairing restrictions', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'tower')
    await continueBuildingSetup(user, 'Religious')
    await chooseBuildingFacilityType(user, 'Temple')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Temple Spire')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'tower', facilityType: 'temple' },
        }),
      },
    })
  })

  it('creates Hall + Town Hall without axis collision', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'hall')
    await continueBuildingSetup(user, 'Civic')
    await chooseBuildingFacilityType(user, 'Town hall')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Civic Hall')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'hall', facilityType: 'town_hall' },
        }),
      },
    })
  })

  it('creates House + Temple as a non-stereotypical composition', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'house')
    await continueBuildingSetup(user, 'Religious')
    await chooseBuildingFacilityType(user, 'Temple')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Shrine House')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'house', facilityType: 'temple' },
        }),
      },
    })
  })

  it('creates Tower + Residence as a non-stereotypical composition', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await chooseBuildingForm(user, 'tower')
    await continueBuildingSetup(user, 'Residence')
    await chooseBuildingFacilityType(user, 'Residence')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Tower Residence')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    expect(mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request).toMatchObject({
      building: {
        input: expect.objectContaining({
          classification: { form: 'tower', facilityType: 'residence' },
        }),
      },
    })
  })

  it('creates the Brewery flow from the selected Facility', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await continueBuildingSetup(user, 'Production')
    await chooseBuildingFacilityType(user, 'Brewery')

    expect(screen.getByText('Production')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Facility type' })).toHaveTextContent('Brewery')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Red Dragon Brewery')
    await user.click(screen.getByRole('button', { name: 'Create building' }))

    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())
    const submission =
      mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request.building.input
    expect(submission).toMatchObject({
      classification: { facilityType: 'brewery' },
    })
    expect(submission).not.toHaveProperty('facilityAuthoringGroup')
    const classification = (submission as { classification?: BuildingClassification })
      .classification
    expect(getEffectiveBuildingFunctions(classification)).toEqual(['production'])
  })

  it('reapplies Building setup through canonical form values without losing the draft', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('House') }))
    await continueBuildingSetup(user, 'Production')
    await chooseBuildingFacilityType(user, 'Brewery')
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Copper Kettle')
    const description = screen.getByRole('textbox', { name: 'Description' })
    description.innerHTML = '<p>A landmark by the quay.</p>'
    fireEvent.input(description)

    await user.click(
      screen.getByRole('button', {
        name: `Change ${BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL.toLowerCase()}`,
      }),
    )
    await chooseBuildingFacilityGroup(user, 'Religious')

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Copper Kettle')
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveTextContent(
      'A landmark by the quay.',
    )
    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('House')).toBeInTheDocument()
    expect(screen.getByText('Religious')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Facility type' })).not.toHaveTextContent('Brewery')

    await user.click(screen.getByRole('button', { name: 'Create building' }))
    await waitFor(() => expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce())

    expect(
      mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request.building.input,
    ).toMatchObject({
      name: 'Copper Kettle',
      classification: { form: 'house' },
    })
  })

  it('preserves a Facility when Change selects another compatible authoring group', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user, 'Production')
    await chooseBuildingFacilityType(user, 'Brewery')

    await user.click(
      screen.getByRole('button', {
        name: `Change ${BUILDING_CREATE_SETUP_FACILITY_FIELD_LABEL.toLowerCase()}`,
      }),
    )
    await chooseBuildingFacilityGroup(user, 'Commercial')

    expect(screen.getByText('Commercial')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Facility type' })).toHaveTextContent('Brewery')
  })

  it('creates with default campaign access draft without PATCH and closes the modal', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)

    await user.click(screen.getByRole('button', { name: 'Use default campaign access' }))
    await submitBuildingCreateForm(user)

    await waitFor(() => {
      expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: STORY_CAMPAIGN_ID,
        pendingAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      }),
    )
    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('PATCHes campaign access after create when draft is non-default and closes the modal', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitBuildingCreateForm(user)

    await waitFor(() => {
      expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: STORY_CAMPAIGN_ID,
        pendingAccess: {
          ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
          available: false,
        },
      }),
    )
    expect(notifyContentCreated).toHaveBeenCalledWith('locations')
    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('submits fixed building context without leaking incompatible form values', async () => {
    const user = userEvent.setup()
    renderModal(buildingIntent)
    await continueBuildingSetup(user)

    await submitBuildingCreateForm(user)

    await waitFor(() => {
      expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce()
    })

    const payload = mockedCompleteBuildingCreateComposition.mock.calls[0]?.[0].request.building
      .input as Record<string, unknown>
    expect(payload).toMatchObject({
      name: 'Harbor Inn',
      parentLocationId: HARBORFORD.id,
      kind: 'structure',
      structureType: 'building',
    })
    expect(payload).not.toHaveProperty('planeType')
    expect(payload).not.toHaveProperty('settlementType')
    expect(payload).not.toHaveProperty('interiorType')
    expect(payload).not.toHaveProperty('classification')
  })

  it('closes after create when deferred access PATCH fails and warns without double-create', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    mockedCompleteBuildingCreateComposition.mockResolvedValueOnce({
      buildingId: 'building-1',
      toast: {
        kind: 'warning',
        message: 'Building created, but campaign access could not be updated.',
      },
    })
    renderModal(buildingIntent, onOpenChange)
    await continueBuildingSetup(user)

    await user.click(screen.getByRole('button', { name: 'Use restricted campaign access' }))
    await submitBuildingCreateForm(user)

    await waitFor(() => {
      expect(mockedCompleteBuildingCreateComposition).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(toast.warning).toHaveBeenCalledWith(
      'Building created, but campaign access could not be updated.',
    )
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

  it('shows partial Selections summary after classification before region type completes', async () => {
    const user = userEvent.setup()
    renderModal(regionIntent)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Political')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change classification' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('clears region type when classification changes via dependsOn', async () => {
    const user = userEvent.setup()
    renderModal(regionIntent)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    const regionTypeGroup = screen.getByRole('radiogroup', { name: 'Region type' })
    const firstRegionType = within(regionTypeGroup).getAllByRole('radio')[0]
    expect(firstRegionType).toBeTruthy()
    await user.click(firstRegionType!)

    await user.click(screen.getByRole('button', { name: 'Change classification' }))
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
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('shows multi-line region summary row actions, returns to details on same-value dismiss, and preserves Name', async () => {
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

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('Political')).toBeInTheDocument()
    expect(screen.getByText(firstRegionTypeName!)).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Westmark')
    await user.click(screen.getByRole('button', { name: 'Change region type' }))

    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.getByText('Political')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change classification' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { checked: true }))

    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Westmark')
    expect(screen.getByText('Political')).toBeInTheDocument()
    expect(screen.getByText(firstRegionTypeName!)).toBeInTheDocument()
  })

  it('calls onCreated after settlement create succeeds and closes the modal', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    const onOpenChange = vi.fn()

    renderModal(settlementIntent, onOpenChange, true, { onCreated })

    await continueSettlementSetup(user)
    await submitCreateForm(user)

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith({ contentType: 'locations', id: 'settlement-new' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('does not call onCreated when Cancel closes the modal', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    const onOpenChange = vi.fn()

    renderModal(makeLocationCreateIntent({ authoringType: 'fortification' }), onOpenChange, true, {
      onCreated,
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('leaves contained create behavior unchanged when onCreated is omitted', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderModal(settlementIntent, onOpenChange)

    await continueSettlementSetup(user)
    await submitCreateForm(user)

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
