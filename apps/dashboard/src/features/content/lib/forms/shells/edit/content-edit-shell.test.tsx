import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  SYSTEM_OVERLAY_INTENT_FIELD,
  type OverlayReadDiagnostics,
} from '@rpg/contracts'

import { ContentEditShell } from './content-edit-shell'

const ORPHAN_COPY = 'Some stored seed overrides no longer match the current catalog seed.'
const IDENTITY_COPY =
  'This record has overlay identity conflicts. Review before publishing changes.'

vi.mock('../../registry/resolve-catalog-seed-body.lib', () => ({
  resolveCatalogSeedBody: () => ({
    name: 'Seed Monster',
    traits: [{ id: 'seed-trait', kind: 'custom', name: 'Seed Trait', description: 'Seed.' }],
  }),
}))

vi.mock('../layout/content-authoring-gate', () => ({
  ContentAuthoringGate: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../session/armor-class-authoring-session', () => ({
  ArmorClassAuthoringNotice: () => null,
  ArmorClassAuthoringProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../session/armor-class-authoring-session.lib', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../session/armor-class-authoring-session.lib')>()
  return {
    ...actual,
    useArmorClassAuthoringSession: () => ({
      sensitive: false,
      live: undefined,
      snapshot: undefined,
      generation: 0,
      keptValues: null,
      saveWithoutDirty: false,
      adoptLive: vi.fn(),
      keepValues: vi.fn(),
    }),
  }
})

vi.mock('./content-edit-entity-form-dialogs', () => ({
  ContentEditEntityFormDialogs: () => null,
}))

vi.mock('./content-edit-entity-form-state', () => ({
  useContentEditEntityFormState: () => ({
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    setCampaignAccess: vi.fn(),
    publishSchema: z.object({ name: z.string() }),
    deleteFlow: {
      deleteError: null,
      checkAvailabilityPending: false,
      confirmOpen: false,
      setConfirmOpen: vi.fn(),
      runDelete: vi.fn(),
    },
    publishFlow: { publishError: null, publishPending: false, runPublishMutation: vi.fn() },
    demoteFlow: { demoteError: null, demotePending: false },
    handlePublish: vi.fn(),
    handleCoordinatedSaveSuccess: vi.fn(),
    headerError: null,
    showLifecycleActions: false,
  }),
}))

vi.mock('../layout/content-form-shell-layout', async () => {
  const { DiagnosticsEditProbeLayout } = await import('./content-edit-diagnostics.probe')
  return {
    ContentFormOptionsGate: ({
      children,
      campaignId,
    }: {
      children: (ctx: Record<string, unknown>) => React.ReactNode
      campaignId: string
    }) =>
      children({
        options: {},
        campaignId,
        mode: 'edit',
        rulesetId: 'srd-cc-5.2.1',
        armorClassRules: { mode: 'ascending', base: 10 },
      }),
    ContentFormLayout: DiagnosticsEditProbeLayout,
  }
})

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

const mutation = vi.hoisted(() => ({ mutateAsync: vi.fn() }))

beforeEach(() => {
  mutation.mutateAsync.mockReset()
})

vi.mock('../../../list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../list/use-content-mutations')>()
  return {
    ...actual,
    useContentWriteMutation: vi.fn(() => ({ ...mutation, isPending: false })),
  }
})

function renderEditShell(entity: Record<string, unknown>, listData: Record<string, unknown>) {
  const def = {
    routeKey: 'feats' as const,
    overlayParticipantId: 'feats' as const,
    schema: z.object({ name: z.string() }),
    nameField: () => ({ name: 'name', label: 'Name', type: 'text' as const }),
    toFormValues: (row: { name: string }) => ({ name: row.name }),
    normalizeOverlayBody: (values: Record<string, unknown>) => values,
    buildTabs: undefined,
    buildFields: () => [],
    useListQueryResult: () => ({
      isPending: false,
      isError: false,
      data: listData,
    }),
    queryKey: () => ['feats'],
  }

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={client}>
      <ContentEditShell
        def={def as never}
        campaignId="campaign-1"
        entityId={entity.id as string}
        isPending={false}
        isError={false}
        backHref="/feats"
        overviewHref="/feats"
      />
    </QueryClientProvider>,
  )
}

function systemEntity(overlayReadDiagnostics?: OverlayReadDiagnostics) {
  return {
    id: 'srd-cc-5.2.1:alert',
    name: 'Alert',
    slug: 'alert',
    catalogLayer: 'system' as const,
    status: 'published' as const,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    overlayRevision: 0,
    seedRowIdsByPath: {},
    ...(overlayReadDiagnostics ? { overlayReadDiagnostics } : {}),
  }
}

describe('ContentEditShell overlay failure gate', () => {
  it('shows destructive alert and blocks the form when list overlayFailures match entityId', () => {
    const failure = {
      targetId: 'feat-broken',
      slug: 'broken-feat',
      name: 'Broken Feat',
      code: 'unsupported_overlay_version' as const,
      message: 'System overlay patch is missing a supported version.',
    }

    const def = {
      routeKey: 'feats' as const,
      useListQueryResult: () => ({
        isPending: false,
        isError: false,
        data: { items: [], overlayFailures: [failure] },
      }),
      queryKey: () => ['feats'],
    }

    render(
      <ContentEditShell
        def={def as never}
        campaignId="campaign-1"
        entityId="feat-broken"
        isPending={false}
        isError={false}
        backHref="/feats"
        overviewHref="/feats"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(failure.message)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Item not found.')).not.toBeInTheDocument()
  })
})

describe('ContentEditShell overlay read diagnostics', () => {
  it('submits diagnostic-safe intent, resets from the response, and uses its revision next', async () => {
    const user = userEvent.setup()
    const seedTrait = {
      id: 'seed-trait',
      kind: 'custom' as const,
      name: 'Seed Trait',
      description: 'Seed.',
    }
    const homebrewTrait = {
      id: 'homebrew-trait',
      kind: 'custom' as const,
      name: 'Homebrew Trait',
      description: 'Homebrew.',
    }
    const entity = {
      ...systemEntity({ orphanedSeedOverrides: ['orphan-trait'], identityConflicts: [] }),
      name: 'Seed Monster',
      overlayRevision: 4,
      seedRowIdsByPath: { traits: [seedTrait.id] },
      traits: [seedTrait, homebrewTrait],
    }
    const firstSaved = { ...entity, name: 'Renamed Monster', overlayRevision: 5 }
    const secondSaved = { ...firstSaved, traits: [seedTrait], overlayRevision: 6 }
    mutation.mutateAsync.mockResolvedValueOnce(firstSaved).mockResolvedValueOnce(secondSaved)

    const queryKey = ['monsters', 'campaign-1']
    const def = {
      routeKey: 'monsters' as const,
      overlayParticipantId: 'monsters' as const,
      schema: z.object({
        name: z.string(),
        traits: z.array(z.object({ id: z.string(), kind: z.string(), name: z.string() })),
      }),
      nameField: () => ({ name: 'name', label: 'Name', type: 'text' as const }),
      toFormValues: (row: typeof entity) => ({ name: row.name, traits: row.traits }),
      normalizeOverlayBody: (values: Record<string, unknown>) => ({
        name: values.name,
        traits: values.traits,
      }),
      buildTabs: undefined,
      buildFields: () => [],
      useListQueryResult: () =>
        useQuery({
          queryKey,
          queryFn: async () => ({ items: [entity], overlayFailures: [] }),
          initialData: { items: [entity], overlayFailures: [] },
        }),
      queryKey: () => queryKey,
    }
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={client}>
        <ContentEditShell
          def={def as never}
          campaignId="campaign-1"
          entityId={entity.id}
          isPending={false}
          isError={false}
          backHref="/monsters"
          overviewHref="/monsters"
        />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(ORPHAN_COPY)
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Renamed Monster')
    await user.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledTimes(1))
    const firstPayload = mutation.mutateAsync.mock.calls[0]![0] as Record<string, unknown>
    expect(firstPayload.expectedOverlayRevision).toBe(4)
    expect(firstPayload[SYSTEM_OVERLAY_INTENT_FIELD]).toEqual({
      set: { name: 'Renamed Monster' },
    })
    expect(firstPayload).not.toHaveProperty('overlayReadDiagnostics')
    expect(firstPayload).not.toHaveProperty('seedRowIdsByPath')

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Renamed Monster'),
    )
    await user.click(screen.getByRole('button', { name: 'Remove persisted homebrew trait' }))
    await user.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledTimes(2))
    const secondPayload = mutation.mutateAsync.mock.calls[1]![0] as Record<string, unknown>
    expect(secondPayload.expectedOverlayRevision).toBe(5)
    expect(secondPayload[SYSTEM_OVERLAY_INTENT_FIELD]).toEqual({
      collections: { traits: { reset: true } },
    })
  })

  it('shows a warning for orphaned seed overrides and keeps save enabled', () => {
    renderEditShell(
      systemEntity({ orphanedSeedOverrides: ['orphan-trait'], identityConflicts: [] }),
      {
        items: [systemEntity({ orphanedSeedOverrides: ['orphan-trait'], identityConflicts: [] })],
      },
    )

    const warning = screen.getByRole('status')
    expect(warning).toHaveTextContent(ORPHAN_COPY)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a warning for identity conflicts and keeps save enabled', () => {
    renderEditShell(
      systemEntity({ orphanedSeedOverrides: [], identityConflicts: ['collision-id'] }),
      {
        items: [systemEntity({ orphanedSeedOverrides: [], identityConflicts: ['collision-id'] })],
      },
    )

    expect(screen.getByRole('status')).toHaveTextContent(IDENTITY_COPY)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('joins orphan and identity diagnostic copy', () => {
    renderEditShell(
      systemEntity({
        orphanedSeedOverrides: ['orphan-trait'],
        identityConflicts: ['collision-id'],
      }),
      {
        items: [
          systemEntity({
            orphanedSeedOverrides: ['orphan-trait'],
            identityConflicts: ['collision-id'],
          }),
        ],
      },
    )

    const warning = screen.getByRole('status')
    expect(warning).toHaveTextContent(IDENTITY_COPY)
    expect(warning).toHaveTextContent(ORPHAN_COPY)
  })

  it('renders no diagnostic warning when diagnostics are absent', () => {
    renderEditShell(systemEntity(), { items: [systemEntity()] })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('does not treat a resolved diagnostic entity as an overlay failure gate', () => {
    const unrelatedFailure = {
      targetId: 'other-broken',
      slug: 'other-broken',
      name: 'Other Broken',
      code: 'unsupported_overlay_version' as const,
      message: 'System overlay patch is missing a supported version.',
    }
    const entity = systemEntity({ orphanedSeedOverrides: ['orphan-trait'], identityConflicts: [] })

    renderEditShell(entity, {
      items: [entity],
      overlayFailures: [unrelatedFailure],
    })

    expect(screen.getByRole('status')).toHaveTextContent(ORPHAN_COPY)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.queryByText(unrelatedFailure.message)).not.toBeInTheDocument()
    expect(screen.queryByText('Item not found.')).not.toBeInTheDocument()
  })
})
