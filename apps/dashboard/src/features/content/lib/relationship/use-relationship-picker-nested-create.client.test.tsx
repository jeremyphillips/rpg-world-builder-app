import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

import { resolveRelationshipPickerCreateIntents } from './relationship-picker-create-intents.lib'
import { useRelationshipPickerNestedCreate } from './use-relationship-picker-nested-create.client'

const resolveHandoffMock = vi.fn()

vi.mock('@/features/content/organizations/components/organization-create-modal.client', () => ({
  OrganizationCreateModal: ({
    open,
    onCreated,
  }: {
    open: boolean
    onCreated?: (result: { contentType: 'organizations'; id: string }) => void
  }) =>
    open ? (
      <button
        type="button"
        onClick={async () => {
          try {
            await onCreated?.({ contentType: 'organizations', id: 'org-new' })
          } catch {
            // Handoff failures reject onCreated — callers catch at the persist boundary.
          }
        }}
      >
        Submit mock organization
      </button>
    ) : null,
}))

vi.mock('./relationship-picker-nested-create.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    resolveRelationshipPickerNestedCreateHandoff: (...args: unknown[]) =>
      resolveHandoffMock(...args),
  }
})

vi.mock('../../locations/components/location-create-modal.client', () => ({
  LocationCreateModal: ({
    open,
    createContext,
  }: {
    open: boolean
    createContext?: { kind: string }
  }) =>
    open ? (
      <div data-testid="location-create-context">{createContext?.kind ?? 'missing'}</div>
    ) : null,
}))

describe('useRelationshipPickerNestedCreate', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    resolveHandoffMock.mockReset()
    resolveHandoffMock.mockResolvedValue({ status: 'selected', organizationId: 'org-new' })
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  function renderNestedCreateHook(onSelectCreatedOrganization = vi.fn()) {
    return renderHook(
      () =>
        useRelationshipPickerNestedCreate({
          campaignId: STORY_CAMPAIGN_ID,
          createIntents: resolveRelationshipPickerCreateIntents({ target: 'organization' }),
          onSelectCreatedOrganization,
        }),
      { wrapper },
    )
  }

  it('exposes phase and nestedCreateBusy without picker-loading exports', () => {
    const { result } = renderNestedCreateHook()

    expect(result.current.phase).toBe('idle')
    expect(result.current.nestedCreateBusy).toBe(false)
    expect(result.current.auxiliaryAction).toEqual(
      expect.objectContaining({
        state: 'action',
        label: 'Create organization',
        disabled: false,
      }),
    )
    expect(result.current).not.toHaveProperty('nestedCreateResolving')
    expect(result.current).not.toHaveProperty('nestedCreatePickerLoading')
  })

  it('enters creating with nestedCreateBusy without implying catalog loading', () => {
    const { result } = renderNestedCreateHook()
    const auxiliaryAction = result.current.auxiliaryAction
    expect(auxiliaryAction?.state).toBe('action')

    act(() => {
      if (auxiliaryAction?.state === 'action') {
        auxiliaryAction.onAction()
      }
    })

    expect(result.current.phase).toBe('creating')
    expect(result.current.nestedCreateBusy).toBe(true)
    expect(
      result.current.auxiliaryAction?.state === 'action' && result.current.auxiliaryAction.disabled,
    ).toBe(true)
  })

  it('resets to idle when nested create is cancelled during creating', () => {
    const { result } = renderNestedCreateHook()
    const auxiliaryAction = result.current.auxiliaryAction
    expect(auxiliaryAction?.state).toBe('action')

    act(() => {
      if (auxiliaryAction?.state === 'action') {
        auxiliaryAction.onAction()
      }
    })

    act(() => {
      result.current.resetNestedCreate()
    })

    expect(result.current.phase).toBe('idle')
    expect(result.current.nestedCreateBusy).toBe(false)
    expect(
      result.current.auxiliaryAction?.state === 'action' && result.current.auxiliaryAction.disabled,
    ).toBe(false)
  })

  it('resolves the created target and returns to idle on success', async () => {
    const user = userEvent.setup()
    const onSelectCreatedOrganization = vi.fn()

    function Harness() {
      const nestedCreate = useRelationshipPickerNestedCreate({
        campaignId: STORY_CAMPAIGN_ID,
        createIntents: resolveRelationshipPickerCreateIntents({ target: 'organization' }),
        onSelectCreatedOrganization,
      })
      const auxiliaryAction = nestedCreate.auxiliaryAction

      return (
        <>
          {nestedCreate.modals}
          <button
            type="button"
            onClick={() => {
              if (auxiliaryAction?.state === 'action') {
                auxiliaryAction.onAction()
              }
            }}
          >
            Launch create organization
          </button>
          <div data-testid="phase">{nestedCreate.phase}</div>
          <div data-testid="busy">{String(nestedCreate.nestedCreateBusy)}</div>
        </>
      )
    }

    render(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Launch create organization' }))
    expect(screen.getByTestId('phase')).toHaveTextContent('creating')
    expect(screen.getByTestId('busy')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'Submit mock organization' }))

    await waitFor(() => {
      expect(screen.getByTestId('phase')).toHaveTextContent('idle')
    })
    expect(screen.getByTestId('busy')).toHaveTextContent('false')
    expect(onSelectCreatedOrganization).toHaveBeenCalledWith('org-new')
    expect(resolveHandoffMock).toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'Submit mock organization' }),
    ).not.toBeInTheDocument()
  })

  it('keeps nested create open and rejects when handoff is ineligible', async () => {
    resolveHandoffMock.mockResolvedValue({ status: 'ineligible' })
    const user = userEvent.setup()
    const onSelectCreatedOrganization = vi.fn()

    function Harness() {
      const nestedCreate = useRelationshipPickerNestedCreate({
        campaignId: STORY_CAMPAIGN_ID,
        createIntents: resolveRelationshipPickerCreateIntents({ target: 'organization' }),
        onSelectCreatedOrganization,
      })
      const auxiliaryAction = nestedCreate.auxiliaryAction

      return (
        <>
          {nestedCreate.modals}
          <button
            type="button"
            onClick={() => {
              if (auxiliaryAction?.state === 'action') {
                auxiliaryAction.onAction()
              }
            }}
          >
            Launch create organization
          </button>
          <div data-testid="phase">{nestedCreate.phase}</div>
        </>
      )
    }

    render(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Launch create organization' }))
    await user.click(screen.getByRole('button', { name: 'Submit mock organization' }))

    await waitFor(() => {
      expect(screen.getByTestId('phase')).toHaveTextContent('creating')
    })
    expect(onSelectCreatedOrganization).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Submit mock organization' })).toBeInTheDocument()
  })

  it('snapshots nested create context when launching location create', async () => {
    const user = userEvent.setup()

    function Harness() {
      const nestedCreate = useRelationshipPickerNestedCreate({
        campaignId: STORY_CAMPAIGN_ID,
        createIntents: resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'headquarters',
        }),
        nestedCreateContext: {
          kind: 'relationship-target',
          source: { contentType: 'organizations', id: 'org-1' },
          relationshipVocabulary: 'organization_location_connection',
        },
      })

      return (
        <>
          {nestedCreate.modals}
          <button
            type="button"
            onClick={() => {
              const action = nestedCreate.auxiliaryAction
              if (action?.state === 'menu') {
                action.items.find((item) => item.label === 'Building')?.onAction()
              }
            }}
          >
            Launch location create
          </button>
        </>
      )
    }

    render(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Launch location create' }))
    expect(screen.getByTestId('location-create-context')).toHaveTextContent('relationship-target')
  })
})
