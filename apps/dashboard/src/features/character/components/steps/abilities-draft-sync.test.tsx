import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { AbilitiesStep } from './abilities-step.client'

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

describe('AbilitiesDraftSync', () => {
  it('seeds the form from an externally restored draft without clobbering the store', async () => {
    const onDraftChange = vi.fn()
    const emptyDraft = createEmptyCharacterBuilderDraft()
    const restoredDraft = {
      ...emptyDraft,
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    const { rerender } = render(
      <AbilitiesStep
        draft={emptyDraft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
      />,
    )

    onDraftChange.mockClear()

    rerender(
      <AbilitiesStep
        draft={restoredDraft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/^Strength$/i)).toHaveTextContent('15')
    })

    expect(onDraftChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({ scores: {} }),
      }),
    )
  })

  it('mirrors score edits into the builder draft', async () => {
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()

    render(
      <AbilitiesStep
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
      />,
    )

    const strengthSelect = screen.getByLabelText(/^Strength$/i)
    await userEvent.click(strengthSelect)
    await userEvent.click(screen.getByRole('option', { name: '15' }))

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({
          abilities: expect.objectContaining({
            scores: expect.objectContaining({ str: 15 }),
          }),
        }),
      )
    })
  })
})
