/**
 * @vitest-environment jsdom
 *
 * Mounted ContentEditShell + real monsterFormDef → persist rejection + api slot projection.
 */
import { getMonsterBySlug } from '@rpg/catalog/monsters'
import { ApiError, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { TEST_CAMPAIGN_ID } from '../../../fixtures/content-form-ctx'
import { monsterFormDef } from '../../../../monsters/lib/monster-form-def'
import { ContentEditShell } from './content-edit-shell'

const { RULESET_ID } = vi.hoisted(() => ({ RULESET_ID: 'srd-cc-5.2.1' as const }))

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

vi.mock('../../registry/resolve-catalog-seed-body.lib', async () => {
  const { getMonsterBySlug: getMonster } = await import('@rpg/catalog/monsters')
  return {
    resolveCatalogSeedBody: () => getMonster('srd-cc-5.2.1', 'swarm-of-insects'),
  }
})

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
  const React = await import('react')
  const { StampEditProbeLayout } = await import('./content-edit-stamp.probe')
  const { makeContentFormCtx } = await import('../../../fixtures/content-form-ctx')
  const optionsCtx = makeContentFormCtx({
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    skillCatalogStatus: 'ready',
    skillCatalogBySlug: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
    rulesetId: 'srd-cc-5.2.1',
  })

  function MergeDefaultsEditProbeLayout(props: Record<string, unknown>) {
    const { defaultValues, onSubmit, ...rest } = props
    const handleSubmit = async (values: Record<string, unknown>, form: unknown) => {
      await (onSubmit as (v: Record<string, unknown>, f: unknown) => Promise<void>)(
        { ...(defaultValues as Record<string, unknown>), ...values },
        form,
      )
    }
    return React.createElement(StampEditProbeLayout, {
      ...rest,
      defaultValues,
      onSubmit: handleSubmit,
    })
  }

  return {
    ContentFormOptionsGate: ({
      children,
      campaignId,
    }: {
      children: (ctx: Record<string, unknown>) => React.ReactNode
      campaignId: string
    }) => children({ ...optionsCtx, campaignId, mode: 'edit' as const }),
    ContentFormLayout: MergeDefaultsEditProbeLayout,
  }
})

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

const mutation = vi.hoisted(() => ({ mutateAsync: vi.fn() }))
const useMonstersListResultMock = vi.hoisted(() => vi.fn())

beforeEach(() => {
  mutation.mutateAsync.mockReset()
  useMonstersListResultMock.mockReset()
})

vi.mock('../../../list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../list/use-content-mutations')>()
  return {
    ...actual,
    useContentWriteMutation: vi.fn(() => ({ ...mutation, isPending: false })),
  }
})

vi.mock('@/features/content/monsters/hooks/use-monsters', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/content/monsters/hooks/use-monsters')>()
  return {
    ...actual,
    useMonstersListResult: (...args: unknown[]) => useMonstersListResultMock(...args),
  }
})

function systemSwarmEntity() {
  const catalog = getMonsterBySlug(RULESET_ID, 'swarm-of-insects')
  expect(catalog).toBeDefined()
  return {
    ...catalog!,
    catalogLayer: 'system' as const,
    status: 'published' as const,
    overlayRevision: 0,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    seedRowIdsByPath: {
      traits: catalog!.traits?.map((trait) => trait.id) ?? [],
    },
  }
}

function renderMonsterEditShell(entity = systemSwarmEntity()) {
  useMonstersListResultMock.mockReturnValue({
    isPending: false,
    isError: false,
    data: { items: [entity], overlayFailures: [] },
  })

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={client}>
      <ContentEditShell
        def={monsterFormDef as never}
        campaignId={TEST_CAMPAIGN_ID}
        entityId={entity.id}
        isPending={false}
        isError={false}
        backHref="/monsters"
        overviewHref="/monsters"
      />
    </QueryClientProvider>,
  )
}

describe('ContentEditShell monster failed persist producer projection', () => {
  it('keeps api producer slot issues and field copy after persist rejection', async () => {
    const user = userEvent.setup({ delay: null })
    mutation.mutateAsync.mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid monster', {
        issues: [{ path: 'name', message: 'Name is already in use.', code: 'duplicate' }],
      }),
    )

    renderMonsterEditShell()

    const nameField = await screen.findByRole('textbox', { name: 'Name' })
    await user.type(nameField, 'x')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mutation.mutateAsync).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/Name is already in use/i)).toBeInTheDocument()
      expect(screen.getByTestId('api-slot-issue-count')).toHaveTextContent('1')
      const paintedName = screen.getByRole('textbox', { name: 'Name' })
      expect(paintedName).toHaveAttribute('aria-invalid', 'true')
      const describedBy = paintedName.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()
      if (describedBy) {
        describedBy.split(/\s+/).forEach((id) => {
          expect(document.getElementById(id)).toBeTruthy()
        })
      }
    })
  })
})
