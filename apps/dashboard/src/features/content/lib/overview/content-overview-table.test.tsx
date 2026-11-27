import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ClassListItem, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'
import type * as RpgUiModule from '@rpg/ui'
import type { ComponentProps } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  classColumns,
  classFilterSchema,
  type ClassesOverviewFilterState,
} from '../../classes/lib/classes-overview-columns'
import { useOverviewColumnsWithNameContext } from './content-overview-columns'
import { buildContentColumns } from './content-table-config'
import { ContentOverviewTable } from './content-overview-table'
import { mergeContentListOverviewRows } from '../list/create-content-list'
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
    catalogLayer: 'system',
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

function renderOverview(data: ClassRow[] = createRows(8)) {
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
              data={data}
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

function hitDieValuesInTableRows(): string[] {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).queryByText(/^d\d+$/)?.textContent ?? '—')
}

function campaignNameLinkInRow(row: HTMLElement): HTMLElement | null {
  const links = within(row).getAllByRole('link')
  return links.find((link) => link.getAttribute('href')?.includes('/campaigns/')) ?? null
}

describe('ContentOverviewTable interactions', () => {
  beforeEach(() => {
    localStorage.clear()
    persistPreferencesMock.mockClear()
    dataTableRenderCount = 0
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = () => false
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = () => undefined
    }
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('does not spam column preference writes when opening the Filters panel', async () => {
    const user = userEvent.setup()
    renderOverview()

    const callsAfterMount = persistPreferencesMock.mock.calls.length

    await user.click(screen.getByRole('button', { name: /additional filters/i }))

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

    await user.click(screen.getByRole('button', { name: /additional filters/i }))
    await user.click(screen.getByRole('button', { name: /additional filters/i }))
    await user.click(screen.getByRole('button', { name: /additional filters/i }))

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

    await user.click(screen.getByRole('button', { name: /additional filters/i }))
    await user.click(screen.getByRole('button', { name: /additional filters/i }))
    await user.click(screen.getByRole('button', { name: /additional filters/i }))

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

  it('shows a merged overlay failure row without duplicate, selection, or row mutation', async () => {
    const user = userEvent.setup()
    const data = mergeContentListOverviewRows(createRows(2), [
      {
        targetId: 'class-broken',
        slug: 'broken-class',
        name: 'Broken Class',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
    ])
    renderOverview(data as ClassRow[])

    expect(screen.getByRole('link', { name: 'Class 0' })).toBeInTheDocument()

    const failureName = screen.getByRole('link', { name: 'Broken Class' })
    expect(screen.getByText('Overlay unresolved')).toBeInTheDocument()
    expect(failureName).toHaveAttribute('href', '/classes/class-broken')
    const failureRow = failureName.closest('tr')
    expect(failureRow).not.toBeNull()
    if (!failureRow) return
    expect(within(failureRow).queryByText(/Unavailable/i)).not.toBeInTheDocument()
    expect(within(failureRow).getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/classes/class-broken/edit',
    )
    expect(within(failureRow).queryByRole('button', { name: 'Duplicate' })).not.toBeInTheDocument()
    expect(
      within(failureRow).queryByRole('button', { name: /Open actions for this class/i }),
    ).not.toBeInTheDocument()

    const healthyRow = screen.getByRole('link', { name: 'Class 0' }).closest('tr')
    expect(healthyRow).not.toBeNull()
    if (!healthyRow) return
    expect(within(healthyRow).getByRole('button', { name: 'Duplicate' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(within(failureRow).getByRole('checkbox', { name: 'Select Broken Class' })).toBeDisabled()
    expect(within(healthyRow).getByRole('checkbox', { name: 'Select Class 0' })).toBeEnabled()
  })

  it('hides overlay failures from the unavailable filter and surfaces the overlay supplement', () => {
    const unavailable = {
      ...createRows(1)[0]!,
      id: 'class-off',
      name: 'Unavailable Class',
      campaignAccess: {
        available: false,
        visibilityMode: 'dm_only' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'none' as const,
      },
    }
    const data = mergeContentListOverviewRows(
      [unavailable],
      [
        {
          targetId: 'class-broken',
          slug: 'broken-class',
          name: 'Broken Class',
          code: 'unsupported_overlay_version',
          message: 'System overlay patch is missing a supported version.',
        },
      ],
    ) as ClassRow[]

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
                data={data}
                getEditHref={(row) => `/classes/${row.id}/edit`}
              />
            </QueryClientProvider>
          ),
        },
      ],
      { initialEntries: ['/?availability=unavailable'] },
    )
    render(<RouterProvider router={router} />)

    expect(screen.queryByRole('link', { name: 'Broken Class' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Unavailable Class' })).toBeInTheDocument()
    expect(screen.getByText('1 unresolved overlay row hidden by this filter')).toBeInTheDocument()
  })

  it('sorts healthy class rows by Hit Die while keeping unresolved rows last with placeholders', async () => {
    const user = userEvent.setup()
    const healthyRows = [
      {
        ...createRows(1)[0]!,
        id: 'class-d10',
        name: 'Ten Die',
        hitDie: 10,
        features: [],
        primaryAbilities: ['str'],
        spellcasting: undefined,
      },
      {
        ...createRows(1)[0]!,
        id: 'class-d6',
        name: 'Six Die',
        hitDie: 6,
        features: [],
        primaryAbilities: ['dex'],
        spellcasting: undefined,
      },
    ]
    const data = mergeContentListOverviewRows(healthyRows, [
      {
        targetId: 'class-broken',
        slug: 'broken-class',
        name: 'Broken Class',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
    ]) as ClassRow[]

    function OverviewWithClassColumns() {
      const guarded = useOverviewColumnsWithNameContext(
        classColumns(CAMPAIGN_ID) as ColumnDef<ClassRow, unknown>[],
        {
          canManage: true,
          campaignId: CAMPAIGN_ID,
          contentTypeKey: 'classes',
          viewer: manageViewer,
          getEditHref: (row) => `/classes/${row.id}/edit`,
        },
      )
      return (
        <ContentOverviewTable<ClassRow, ClassesOverviewFilterState>
          contentTypeKey="classes"
          campaignId={CAMPAIGN_ID}
          columns={guarded}
          filterSchema={classFilterSchema}
          data={data}
          getEditHref={(row) => `/classes/${row.id}/edit`}
        />
      )
    }

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <QueryClientProvider client={queryClient}>
              <OverviewWithClassColumns />
            </QueryClientProvider>
          ),
        },
      ],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('link', { name: 'Broken Class' })).toBeInTheDocument()
    const brokenRow = screen.getByRole('link', { name: 'Broken Class' }).closest('tr')
    expect(brokenRow).not.toBeNull()
    if (!brokenRow) return
    expect(within(brokenRow).getAllByText('—').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Sort by Hit Die' }))

    expect(hitDieValuesInTableRows()).toEqual(['d6', 'd10', '—'])
    const lastRow = screen.getAllByRole('row').at(-1)
    expect(lastRow).toBeDefined()
    if (lastRow) {
      expect(campaignNameLinkInRow(lastRow)?.textContent).toBe('Broken Class')
    }

    await user.click(screen.getByRole('button', { name: 'Sort by Hit Die' }))

    expect(hitDieValuesInTableRows()).toEqual(['d10', 'd6', '—'])
    expect(screen.getByRole('link', { name: 'Broken Class' })).toBeInTheDocument()
  })

  it('hides unresolved rows from explicit Hit Die filters but keeps them visible by default', async () => {
    const user = userEvent.setup()
    const data = mergeContentListOverviewRows(
      [
        {
          ...createRows(1)[0]!,
          id: 'class-d10',
          name: 'Ten Die',
          hitDie: 10,
          features: [],
          primaryAbilities: ['str'],
          spellcasting: undefined,
        },
      ],
      [
        {
          targetId: 'class-broken',
          slug: 'broken-class',
          name: 'Broken Class',
          code: 'unsupported_overlay_version',
          message: 'System overlay patch is missing a supported version.',
        },
      ],
    ) as ClassRow[]

    function OverviewWithClassColumns() {
      const guarded = useOverviewColumnsWithNameContext(
        classColumns(CAMPAIGN_ID) as ColumnDef<ClassRow, unknown>[],
        {
          canManage: true,
          campaignId: CAMPAIGN_ID,
          contentTypeKey: 'classes',
          viewer: manageViewer,
          getEditHref: (row) => `/classes/${row.id}/edit`,
        },
      )
      return (
        <ContentOverviewTable<ClassRow, ClassesOverviewFilterState>
          contentTypeKey="classes"
          campaignId={CAMPAIGN_ID}
          columns={guarded}
          filterSchema={classFilterSchema}
          data={data}
          getEditHref={(row) => `/classes/${row.id}/edit`}
        />
      )
    }

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <QueryClientProvider client={queryClient}>
              <OverviewWithClassColumns />
            </QueryClientProvider>
          ),
        },
      ],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('link', { name: 'Broken Class' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ten Die' })).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Hit Die' }))
    await user.click(within(document.body).getByRole('option', { name: 'd10' }))

    expect(screen.getByRole('link', { name: 'Ten Die' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Broken Class' })).not.toBeInTheDocument()
  })
})
