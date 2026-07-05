import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
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
  it('renders the standard-array assignment UI', () => {
    render(
      <AbilitiesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Abilities' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Standard Array' })).toBeInTheDocument()
    expect(screen.getByText('6 scores remaining')).toBeInTheDocument()
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
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Assign a score to every ability.')
  })

  it('has no axe accessibility violations', async () => {
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
      />,
    )

    await expectNoAxeViolations(container)
  })
})
