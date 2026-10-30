import { useState } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArmorClassRules } from '@rpg/contracts'

import { renderWithDataRouter } from '@/lib/test-router'

import '../../../../equipment/lib/equipment-form-def'
import { ContentCreateShell } from './content-create-shell'

const harness = vi.hoisted(() => ({
  rules: { mode: 'ascending' as const, base: 10 as const } satisfies ArmorClassRules,
  mutateAsync: vi.fn(async () => ({ id: 'created', kind: 'adventuring_gear' })),
}))

vi.mock('../layout/content-authoring-gate', () => ({
  ContentAuthoringGate: ({ children }: { children: unknown }) => children,
}))

vi.mock('../layout/content-form-shell-layout', async () => {
  const actual = await vi.importActual('../layout/content-form-shell-layout')
  const { StaleCreateProbeLayout } = await import('./content-create-stale-persist.probe')
  return {
    ...actual,
    ContentFormLayout: StaleCreateProbeLayout,
  }
})

vi.mock('../../../form-options/content-form-options', async () => {
  const actual = await vi.importActual('../../../form-options/content-form-options')
  return {
    ...actual,
    useContentFormOptions: () => ({
      ctx: {
        campaignId: 'camp-1',
        mode: 'create' as const,
        armorClassRules: harness.rules,
      },
      isPending: false,
      isError: false,
      isRetrying: false,
      retryFailedQueries: async () => undefined,
    }),
  }
})

vi.mock('../../../list/use-content-mutations', async () => {
  const actual = await vi.importActual('../../../list/use-content-mutations')
  return {
    ...actual,
    useContentWriteMutation: () => ({
      mutateAsync: harness.mutateAsync,
      isPending: false,
    }),
  }
})

vi.mock('../../registry/content-form-serialize-input.lib', async () => {
  const actual = await vi.importActual('../../registry/content-form-serialize-input.lib')
  return {
    ...actual,
    serializeContentFormInput: () => ({ name: 'Shield' }),
  }
})

vi.mock('../../validation/content-publish-validation.lib', async () => {
  const actual = await vi.importActual('../../validation/content-publish-validation.lib')
  return {
    ...actual,
    applyContentPublishValidation: () => null,
  }
})

vi.mock('../../../campaign-access/create-with-deferred-campaign-access', async () => {
  const actual = await vi.importActual(
    '../../../campaign-access/create-with-deferred-campaign-access',
  )
  return {
    ...actual,
    createWithDeferredCampaignAccess: async ({
      mutateAsync,
      createInput,
    }: {
      mutateAsync: (input: unknown) => Promise<{ id: string; kind: string }>
      createInput: unknown
    }) => {
      const entity = await mutateAsync(createInput)
      return { entity, deferredAccessFailed: false }
    },
  }
})

function CreatePage() {
  const [, setGeneration] = useState(0)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          harness.rules = { mode: 'ascending', base: 9 }
          setGeneration((current) => current + 1)
        }}
      >
        Change rules
      </button>
      <ContentCreateShell
        contentType="equipment"
        campaignId="camp-1"
        heading="New equipment"
        backHref="/overview"
      />
    </>
  )
}

function renderCreate() {
  return renderWithDataRouter(
    [
      { path: '/', element: <CreatePage /> },
      { path: '*', element: <div>Edit</div> },
    ],
    { initialEntries: ['/'] },
  )
}

describe('stale armor class create persist', () => {
  beforeEach(() => {
    harness.rules = { mode: 'ascending', base: 10 }
    harness.mutateAsync.mockClear()
    harness.mutateAsync.mockResolvedValue({ id: 'created', kind: 'adventuring_gear' })
  })

  it('refuses draft and publish when a dirty create is on stale rules', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' +1')
    await user.click(screen.getByRole('button', { name: 'Change rules' }))

    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Bypass draft' }))
    await waitFor(() => {
      expect(screen.getByTestId('draft-settled')).toHaveTextContent('true')
    })
    await user.click(screen.getByRole('button', { name: 'Bypass publish' }))
    await waitFor(() => {
      expect(screen.getByTestId('publish-settled')).toHaveTextContent('true')
    })

    expect(harness.mutateAsync).not.toHaveBeenCalled()
  })

  it('persists a dirty create while the snapshotted rules still match', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' +1')
    await user.click(screen.getByRole('button', { name: 'Bypass publish' }))

    await waitFor(() => {
      expect(harness.mutateAsync).toHaveBeenCalledTimes(1)
    })
  })
})
