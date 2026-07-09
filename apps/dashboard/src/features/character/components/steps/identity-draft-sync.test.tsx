import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { IdentityStep } from './identity-step.client'

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
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await userEvent.type(screen.getByLabelText(/Character name/i), 'Verna')

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({ identity: expect.objectContaining({ name: 'Verna' }) }),
      )
    })
  })

  it('mirrors narrative ideal edits into the builder draft', async () => {
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()

    render(
      <IdentityStep
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Add ideal/i }))
    await userEvent.type(screen.getByLabelText(/^Ideals$/i), 'Protect the weak.')

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
