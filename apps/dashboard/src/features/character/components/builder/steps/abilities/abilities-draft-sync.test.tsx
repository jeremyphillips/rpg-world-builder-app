import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { abilitiesFormCopy } from '../../../../lib/steps/abilities-form-labels'
import { AbilitiesStep } from './abilities-step.client'

const context = createStandaloneBuilderContextFixture()

function getChooseScoreButton(abilityLabel: string) {
  return screen.getByRole('button', {
    name: new RegExp(`${abilitiesFormCopy.chooseScore} for ${abilityLabel}`, 'i'),
  })
}

async function assignStrengthScore(score: number) {
  await userEvent.click(getChooseScoreButton('Strength'))
  await userEvent.click(screen.getByRole('menuitem', { name: String(score) }))
}

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
        context={context}
        draft={emptyDraft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    onDraftChange.mockClear()

    rerender(
      <AbilitiesStep
        context={context}
        draft={restoredDraft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Strength score 15')).toBeInTheDocument()
    })

    expect(onDraftChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({ scores: {} }),
      }),
    )
  })

  it('mirrors score edits into the builder draft with the resolved method', async () => {
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()

    render(
      <AbilitiesStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await assignStrengthScore(15)

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({
          abilities: expect.objectContaining({
            method: 'standard-array',
            scores: expect.objectContaining({ str: 15 }),
          }),
        }),
      )
    })
  })

  it('does not patch the draft again when the form already matches the stored draft', async () => {
    const onDraftChange = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    const { rerender } = render(
      <AbilitiesStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(onDraftChange).not.toHaveBeenCalledWith(
        expect.objectContaining({
          abilities: expect.objectContaining({ scores: {} }),
        }),
      )
    })

    onDraftChange.mockClear()

    rerender(
      <AbilitiesStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(onDraftChange).not.toHaveBeenCalled()
    })
  })

  it('flushes score edits to the draft when the step unmounts', async () => {
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()

    const { unmount } = render(
      <AbilitiesStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await assignStrengthScore(15)
    onDraftChange.mockClear()

    unmount()

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          method: 'standard-array',
          scores: expect.objectContaining({ str: 15 }),
        }),
      }),
    )
  })
})
