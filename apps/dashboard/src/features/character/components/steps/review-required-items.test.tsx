import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ReviewRequiredItems } from './review-required-items.client'

describe('ReviewRequiredItems', () => {
  it('renders nothing when there are no required items', () => {
    const { container } = render(
      <ReviewRequiredItems requiredItems={[]} onNavigateToStep={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('lists required items with navigation to the owning step', async () => {
    const user = userEvent.setup()
    const onNavigateToStep = vi.fn()

    render(
      <ReviewRequiredItems
        requiredItems={[
          {
            id: 'choiceSet:class:srd-cc-5.2.1:fighter:class-skills',
            kind: 'choiceSet',
            label: 'Choose Skills',
            message: 'Choose at least 2 options for Choose Skills.',
            stepId: 'proficiencies',
            stepLabel: 'Proficiencies',
            progress: { current: 0, total: 2, max: 2 },
          },
        ]}
        onNavigateToStep={onNavigateToStep}
      />,
    )

    expect(screen.getByText('Required items')).toBeInTheDocument()
    expect(screen.getByText('Choose Skills')).toBeInTheDocument()
    expect(screen.getByText('Choose at least 2 options for Choose Skills.')).toBeInTheDocument()
    expect(screen.getByText('0 of 2 selected')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to Proficiencies' }))
    expect(onNavigateToStep).toHaveBeenCalledWith('proficiencies')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ReviewRequiredItems
        requiredItems={[
          {
            id: 'stepField:abilities:abilities_incomplete',
            kind: 'stepField',
            label: 'Ability Scores',
            message: 'Assign a score to every ability.',
            stepId: 'abilities',
            stepLabel: 'Abilities',
            progress: { current: 4, total: 6 },
          },
        ]}
        onNavigateToStep={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
