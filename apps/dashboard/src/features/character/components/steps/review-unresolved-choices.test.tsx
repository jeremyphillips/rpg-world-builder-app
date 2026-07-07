import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ReviewUnresolvedChoices } from './review-unresolved-choices.client'

describe('ReviewUnresolvedChoices', () => {
  it('renders nothing when there are no unresolved choices', () => {
    const { container } = render(
      <ReviewUnresolvedChoices unresolvedChoices={[]} onNavigateToStep={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('lists unresolved choices with navigation to the owning step', async () => {
    const user = userEvent.setup()
    const onNavigateToStep = vi.fn()

    render(
      <ReviewUnresolvedChoices
        unresolvedChoices={[
          {
            choiceSetId: 'class:srd-cc-5.2.1:fighter:class-skills',
            label: 'Choose Skills',
            stepId: 'proficiencies',
            stepLabel: 'Proficiencies',
            min: 2,
            max: 2,
            selectedCount: 0,
            message: 'Choose at least 2 options for Choose Skills.',
          },
        ]}
        onNavigateToStep={onNavigateToStep}
      />,
    )

    expect(screen.getByText('Choose Skills')).toBeInTheDocument()
    expect(screen.getByText('Choose at least 2 options for Choose Skills.')).toBeInTheDocument()
    expect(screen.getByText('0 of 2 selected')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to Proficiencies' }))
    expect(onNavigateToStep).toHaveBeenCalledWith('proficiencies')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ReviewUnresolvedChoices
        unresolvedChoices={[
          {
            choiceSetId: 'class:srd-cc-5.2.1:fighter:class-skills',
            label: 'Choose Skills',
            stepId: 'proficiencies',
            stepLabel: 'Proficiencies',
            min: 2,
            max: 2,
            selectedCount: 1,
            message: 'Choose at least 2 options for Choose Skills.',
          },
        ]}
        onNavigateToStep={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
