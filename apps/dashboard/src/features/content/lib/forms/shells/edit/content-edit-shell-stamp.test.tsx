/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { ContentEditShell } from './content-edit-shell'

vi.mock('../../registry/resolve-catalog-seed-body.lib', () => ({
  resolveCatalogSeedBody: () => ({ name: 'Seed' }),
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
  const { StampEditProbeLayout } = await import('./content-edit-stamp.probe')
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
    ContentFormLayout: StampEditProbeLayout,
  }
})

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

vi.mock('../../submit/prepare-serialized-content-form-write.lib', () => ({
  prepareSerializedContentFormWrite: () => ({
    payload: { name: 'Feat' },
    provenance: null,
  }),
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

function homebrewFeat(id: string, name: string) {
  return {
    id,
    name,
    slug: name.toLowerCase(),
    catalogLayer: 'homebrew' as const,
    status: 'published' as const,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }
}

function makeDef(items: ReturnType<typeof homebrewFeat>[]) {
  return {
    routeKey: 'feats' as const,
    schema: z.object({ name: z.string().min(1) }),
    nameField: () => ({ name: 'name', label: 'Name', type: 'text' as const }),
    toFormValues: (row: { name: string }) => ({ name: row.name }),
    normalizeOverlayBody: undefined,
    buildTabs: undefined,
    buildFields: () => [{ name: 'name', label: 'Name', type: 'text' as const }],
    useListQueryResult: () => ({
      isPending: false,
      isError: false,
      data: { items, overlayFailures: [] },
    }),
    queryKey: () => ['feats', 'campaign-1'],
  }
}

function renderStampShell(entityId: string, items: ReturnType<typeof homebrewFeat>[]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const def = makeDef(items)
  return render(
    <QueryClientProvider client={client}>
      <ContentEditShell
        def={def as never}
        campaignId="campaign-1"
        entityId={entityId}
        isPending={false}
        isError={false}
        backHref="/feats"
        overviewHref="/feats"
      />
    </QueryClientProvider>,
  )
}

describe('ContentEditShell stamp and producer session', () => {
  it('drops stamp-N api projection after navigating to a different entity', async () => {
    const user = userEvent.setup()
    const featA = homebrewFeat('feat-a', 'Feat A')
    const featB = homebrewFeat('feat-b', 'Feat B')
    mutation.mutateAsync.mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )

    function SwitchEntityShell() {
      const [entityId, setEntityId] = useState('feat-a')
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      const def = makeDef([featA, featB])
      return (
        <QueryClientProvider client={client}>
          <button type="button" onClick={() => setEntityId('feat-b')}>
            Open feat B
          </button>
          <ContentEditShell
            def={def as never}
            campaignId="campaign-1"
            entityId={entityId}
            isPending={false}
            isError={false}
            backHref="/feats"
            overviewHref="/feats"
          />
        </QueryClientProvider>
      )
    }

    render(<SwitchEntityShell />)

    await user.type(screen.getByRole('textbox', { name: 'Name' }), '!')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: 'Open feat B' }))

    await waitFor(() => {
      expect(screen.queryByText(/Slug is already taken/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('api-issue-count')).toHaveTextContent('0')
    })
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Feat B')
  })
})
