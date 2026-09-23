import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { IdentityStep } from './identity-step'
import { identityStepTestContext } from './identity-step.fixtures'

vi.mock('@/features/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/content')>()
  return {
    ...actual,
    useLocations: () => ({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    }),
  }
})

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/campaign')>()
  return {
    ...actual,
    useCampaignCharacters: () => ({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    }),
  }
})

describe('IdentityDraftSync', () => {
  it('seeds the form from an externally restored draft without clobbering the store', async () => {
    const onDraftChange = vi.fn()
    const emptyDraft = createEmptyCharacterBuilderDraft()
    const restoredDraft = {
      ...emptyDraft,
      identity: { name: 'Verna', narrative: { personalityTraits: ['Steady'] } },
    }

    const { rerender } = render(
      <IdentityStep
        context={identityStepTestContext}
        draft={emptyDraft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    onDraftChange.mockClear()

    rerender(
      <IdentityStep
        context={identityStepTestContext}
        draft={restoredDraft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(await screen.findByDisplayValue('Verna')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Steady')).toBeInTheDocument()

    await waitFor(() => {
      expect(onDraftChange).not.toHaveBeenCalledWith(
        expect.objectContaining({ identity: expect.objectContaining({ name: '' }) }),
      )
    })
  })

  it('mirrors user edits into the builder draft', async () => {
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()

    render(
      <IdentityStep
        context={identityStepTestContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await userEvent.type(screen.getByRole('textbox', { name: /Character name/i }), 'Verna')

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({ identity: expect.objectContaining({ name: 'Verna' }) }),
      )
    })
  })

  it('preserves saved identity media when another identity field changes', async () => {
    const onDraftChange = vi.fn()
    const savedMedia = {
      revision: 1,
      images: [{ id: 'image-0', assetId: 'asset-0' }],
      roles: {},
    }
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: {
        name: 'Verna',
        media: savedMedia,
      },
    }

    render(
      <IdentityStep
        context={identityStepTestContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('radio', { name: 'Female' }))

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({
          identity: expect.objectContaining({
            gender: 'female',
            media: savedMedia,
          }),
        }),
      )
    })
  })

  it('mirrors narrative ideal edits into the builder draft', async () => {
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()

    render(
      <IdentityStep
        context={identityStepTestContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await userEvent.type(
      screen.getByPlaceholderText(/What principle drives your character/i),
      'Protect the weak.',
    )

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({
          identity: expect.objectContaining({
            narrative: expect.objectContaining({ ideals: ['Protect the weak.'] }),
          }),
        }),
      )
    })
  })
})
