import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  characterBuilderAbilityRecommendationMessages,
  characterBuilderValidationMessages,
  formatFieldMessage,
} from '@rpg/contracts'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../../../../lib/fixtures/character-builder-fixtures'
import { AbilitiesStep } from './abilities-step.client'

const context = createStandaloneBuilderContextFixture()

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

describe('AbilitiesStep', () => {
  it('renders the fixed-scores assignment UI', () => {
    render(
      <AbilitiesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Abilities' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fixed scores' })).toBeInTheDocument()
    expect(screen.getByText('6 scores remaining')).toBeInTheDocument()
  })

  it('shows no-class recommendation helper when class is not selected', () => {
    render(
      <AbilitiesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(
      screen.getByText(formatFieldMessage(characterBuilderAbilityRecommendationMessages.noClass())),
    ).toBeInTheDocument()
  })

  it('hides no-class recommendation helper when the class step is not applicable', () => {
    render(
      <AbilitiesStep
        context={context}
        draft={{
          ...createEmptyCharacterBuilderDraft(),
          class: { classId: undefined, level: 0 },
        }}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(
      screen.queryByText(
        formatFieldMessage(characterBuilderAbilityRecommendationMessages.noClass()),
      ),
    ).not.toBeInTheDocument()
  })

  it('shows fighter recommendations when class is selected', () => {
    render(
      <AbilitiesStep
        context={createPopulatedStandaloneBuilderContextFixture()}
        draft={{
          ...createEmptyCharacterBuilderDraft(),
          class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
        }}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(
      screen.getByText(
        formatFieldMessage(
          characterBuilderAbilityRecommendationMessages.heading({ className: 'Fighter' }),
        ),
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/Strength is useful for Fighters\./)).toBeInTheDocument()
    expect(screen.getByText(/Suggested: 15 → Strength\./)).toBeInTheDocument()
  })

  it('surfaces step validation issues from the builder frame', () => {
    render(
      <AbilitiesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[
          {
            code: 'abilities_incomplete',
            message: 'Assign a score to every ability.',
            path: 'abilities.scores',
            stepId: 'abilities',
          },
        ]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      formatFieldMessage(characterBuilderValidationMessages.stepIncomplete()),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Assign a score to every ability.')
    expect(screen.getByRole('alert').textContent).not.toMatch(/\{"f":/)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <AbilitiesStep
        context={context}
        draft={{
          ...createEmptyCharacterBuilderDraft(),
          abilities: {
            method: 'standard-array',
            scores: { str: 15, con: 13 },
          },
        }}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
