import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ClassListItem, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'
import type * as RpgUiModule from '@rpg/ui'
import type { ComponentProps } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  classFilterSchema,
  type ClassesOverviewFilterState,
} from '../../classes/lib/classes-overview-columns'
import { buildContentColumns } from './content-table-config'
import { ContentOverviewTable } from './content-overview-table'
import { persistContentOverviewPreferences } from './content-overview-preferences'
import type * as ContentOverviewPreferencesModule from './content-overview-preferences'

let dataTableRenderCount = 0

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof RpgUiModule>()
  const ActualDataTable = actual.DataTable

  return {
    ...actual,
    DataTable: (props: ComponentProps<typeof ActualDataTable>) => {
      dataTableRenderCount += 1
      return <ActualDataTable {...props} />
    },
  }
})

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => true),
}))

const manageViewer = { kind: 'manage' as const }

vi.mock('./hooks/use-content-viewer', () => ({
  useContentViewer: vi.fn(() => manageViewer),
}))

vi.mock('./content-overview-preferences', async (importOriginal) => {
  const actual = await importOriginal<typeof ContentOverviewPreferencesModule>()
  return {
    ...actual,
    persistContentOverviewPreferences: vi.fn(actual.persistContentOverviewPreferences),
  }
})

vi.mock('./hooks/use-content-campaign-availability-toggle', () => ({
  useContentCampaignAvailabilityToggle: vi.fn(() => ({
    pending: false,
    blockedOpen: false,
    setBlockedOpen: vi.fn(),
    blockers: [],
    handleAvailableChange: vi.fn(),
  })),
}))

type ClassRow = WithCampaignAccess<ClassListItem>

const CAMPAIGN_ID = 'campaign-1'

const columns = buildContentColumns<ClassListItem>(
  [
    {
      accessorKey: 'hitDie',
      header: 'Hit Die',
      meta: { label: 'Hit Die' },
    },
  ],
  {
    contentType: 'classes',
    nameHref: (row) => `/classes/${row.id}`,
  },
) as ColumnDef<ClassRow, unknown>[]

function createRows(count: number): ClassRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `class-${index}`,
    name: `Class ${index}`,
    hitDie: 8,
    source: 'system',
    status: 'published',
    primaryAbilities: ['str'],
    subclasses: [],
    campaignAccess: {
      available: true,
      visibilityMode: 'player',
      effectiveAudience: 'player',
    },
  })) as unknown as ClassRow[]
}

function renderOverview() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <QueryClientProvider client={queryClient}>
            <ContentOverviewTable<ClassRow, ClassesOverviewFilterState>
              contentTypeKey="classes"
              campaignId={CAMPAIGN_ID}
              columns={columns}
              filterSchema={classFilterSchema}
              data={createRows(8)}
              getEditHref={(row) => `/classes/${row.id}/edit`}
            />
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  )

  const view = render(<RouterProvider router={router} />)

  return { router, view }
}

const persistPreferencesMock = vi.mocked(persistContentOverviewPreferences)

describe('ContentOverviewTable interactions', () => {
  beforeEach(() => {
    localStorage.clear()
    persistPreferencesMock.mockClear()
    dataTableRenderCount = 0
  })

  it('does not spam column preference writes when opening the Filters panel', async () => {
    const user = userEvent.setup()
    renderOverview()

    const callsAfterMount = persistPreferencesMock.mock.calls.length

    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))

    expect(persistPreferencesMock.mock.calls.length - callsAfterMount).toBeLessThanOrEqual(1)
  })

  it('does not spam column preference writes when opening the Columns panel', async () => {
    const user = userEvent.setup()
    renderOverview()

    const callsAfterMount = persistPreferencesMock.mock.calls.length

    await user.click(screen.getByRole('button', { name: /^Choose visible columns$/ }))

    expect(persistPreferencesMock.mock.calls.length - callsAfterMount).toBe(0)
  })

  it('does not spam column preference writes when toggling a column', async () => {
    const user = userEvent.setup()
    renderOverview()

    await user.click(screen.getByRole('button', { name: /^Choose visible columns$/ }))
    const callsAfterOpen = persistPreferencesMock.mock.calls.length

    await user.click(screen.getByRole('checkbox', { name: /Hit Die/i }))

    expect(persistPreferencesMock.mock.calls.length - callsAfterOpen).toBeLessThanOrEqual(1)
  })

  it('does not spam preference writes when toggling Filters repeatedly', async () => {
    const user = userEvent.setup()
    renderOverview()

    const callsAfterMount = persistPreferencesMock.mock.calls.length

    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))
    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))
    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))

    expect(persistPreferencesMock.mock.calls.length - callsAfterMount).toBeLessThanOrEqual(3)
  })

  it('does not rerender the data table when only the Filters panel toggles', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <QueryClientProvider client={queryClient}>
              <ContentOverviewTable<ClassRow, ClassesOverviewFilterState>
                contentTypeKey="classes"
                campaignId={CAMPAIGN_ID}
                columns={columns}
                filterSchema={classFilterSchema}
                data={createRows(80)}
                getEditHref={(row) => `/classes/${row.id}/edit`}
              />
            </QueryClientProvider>
          ),
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    const rendersAfterMount = dataTableRenderCount

    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))
    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))
    await user.click(screen.getByRole('button', { name: /Show more filters|Hide more filters/ }))

    expect(dataTableRenderCount - rendersAfterMount).toBe(0)
  })

  it('renders the utility bar with result count and columns control', () => {
    renderOverview()
    expect(screen.getByText('8 results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose visible columns' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
  })

  it('enters selection mode and announces the live region', async () => {
    const user = userEvent.setup()
    renderOverview()

    await user.click(screen.getByRole('button', { name: 'Select' }))

    expect(screen.getByText('0 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    expect(screen.getByText('Selection mode. 0 items selected.')).toBeInTheDocument()
  })

  it('uses contextual row checkbox labels in selection mode', async () => {
    const user = userEvent.setup()
    renderOverview()

    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('checkbox', { name: 'Select Class 0' })).toBeInTheDocument()
  })

  it('renders selection checkboxes when column order preferences are persisted', async () => {
    const user = userEvent.setup()
    persistContentOverviewPreferences('classes', {
      version: 2,
      columnOrder: ['hitDie', 'name'],
    })
    renderOverview()

    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('checkbox', { name: 'Select Class 0' })).toBeInTheDocument()
  })
})
