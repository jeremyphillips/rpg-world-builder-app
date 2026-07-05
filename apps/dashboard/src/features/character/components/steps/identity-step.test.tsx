import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { IdentityStep } from './identity-step.client'

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

describe('IdentityStep', () => {
  it('renders identity and narrative fields', async () => {
    render(
      <IdentityStep
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Character name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Alignment/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Backstory/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add trait/i })).toBeInTheDocument()
  })

  it('surfaces step validation issues from the builder frame', () => {
    render(
      <IdentityStep
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[
          {
            code: 'identity.name.required',
            message: 'Name is required.',
            stepId: 'identity',
          },
        ]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <IdentityStep
        draft={{
          ...createEmptyCharacterBuilderDraft(),
          identity: {
            name: 'Verna',
            alignment: 'ng',
            narrative: { personalityTraits: ['Steady'] },
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
