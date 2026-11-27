/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { persistContentEditUpdate } from './content-edit-persist.lib'
import { StampEditProbeLayout } from './content-edit-stamp.probe'
import { useContentFormSubmit } from '../submit/content-form-submit'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'

const prepareWriteMock = vi.hoisted(() =>
  vi.fn(() => ({
    payload: { name: 'Feat A!' },
    provenance: null as { pathMap?: Record<string, string> } | null,
  })),
)

vi.mock('../../submit/prepare-serialized-content-form-write.lib', () => ({
  prepareSerializedContentFormWrite: (...args: unknown[]) => prepareWriteMock(...args),
}))

const mutateAsync = vi.hoisted(() => vi.fn())

const featDef = {
  routeKey: 'feats' as const,
  schema: z.object({ name: z.string().min(1) }),
  nameField: () => ({ name: 'name', label: 'Name', type: 'text' as const }),
  buildFields: () => [{ name: 'name', label: 'Name', type: 'text' as const }],
} as unknown as AnyContentFormDef

const layoutCtx = {
  campaignId: 'campaign-1',
  mode: 'edit',
  rulesetId: 'srd-cc-5.2.1',
} as ContentFormCtx

function renderEditPersistHarness() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  function Harness() {
    const contentSubmit = useContentFormSubmit<Record<string, unknown>>({
      def: featDef,
      ctx: layoutCtx,
      commitValidationIntent: 'publish',
      fallbackMessage: 'Could not save.',
      invalidPresentation: {
        resolverFields: [{ name: 'name', label: 'Name', type: 'text' }],
        formId: 'feat-a-harness',
      },
      prepareWrite: () => prepareWriteMock(),
      persist: async (wireInput, form, meta) =>
        persistContentEditUpdate({
          def: featDef,
          entity: { id: 'feat-a', catalogLayer: 'homebrew', name: 'Feat A' },
          campaignId: 'campaign-1',
          layoutCtx,
          wireInput,
          form,
          mutation: { mutateAsync },
          queryClient: client,
          setOverlayBaseline: vi.fn(),
          validationIntent: 'publish',
          isAttemptCurrent: meta?.isAttemptCurrent,
        }),
    })

    return (
      <StampEditProbeLayout
        schema={z.object({ name: z.string().min(1) })}
        defaultValues={{ name: 'Feat A' }}
        formKey="feat-a-harness"
        formError={contentSubmit.formError ?? null}
        onSubmit={contentSubmit.onSubmit}
        producerBoundary={contentSubmit.ProducerBoundary}
      />
    )
  }

  return render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  )
}

describe('edit shell failed persist producer projection', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    prepareWriteMock.mockReset()
    prepareWriteMock.mockReturnValue({
      payload: { name: 'Feat A!' },
      provenance: null,
    })
  })

  it('keeps api producer issues and field copy after persistContentEditUpdate rejection', async () => {
    const user = userEvent.setup()
    mutateAsync.mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )

    renderEditPersistHarness()

    await user.type(screen.getByRole('textbox', { name: 'Name' }), '!')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save changes/i }))
    })

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/Slug is already taken/i)).toBeInTheDocument()
      expect(screen.getByTestId('api-issue-count')).toHaveTextContent('1')
    })
  })
})
