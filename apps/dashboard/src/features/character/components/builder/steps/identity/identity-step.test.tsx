import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  clearBuilderFormContinueHandlersForTests,
  runBuilderFormContinueHandler,
} from '../../../../lib/builder/builder-form-continue-registry'
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
  afterEach(() => {
    clearBuilderFormContinueHandlersForTests()
  })

  it('registers a continue handler that surfaces validation failure without a silent no-op', async () => {
    const onFormContinueValidationFailed = vi.fn()

    render(
      <IdentityStep
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={onFormContinueValidationFailed}
      />,
    )

    await waitFor(() => {
      expect(runBuilderFormContinueHandler('identity')).toBeDefined()
    })

    await runBuilderFormContinueHandler('identity')!()

    expect(onFormContinueValidationFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: expect.any(Object),
      }),
    )
  })

  it('renders identity and narrative fields', async () => {
    render(
      <IdentityStep
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Character name/i)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument()
    expect(await screen.findByLabelText(/Backstory/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add trait/i })).toBeInTheDocument()
  })

  it('treats alignment chips as single-select', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()

    render(
      <IdentityStep
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Neutral Good' }))

    await waitFor(() => {
      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({
          identity: expect.objectContaining({ alignment: 'ng' }),
        }),
      )
    })

    expect(screen.queryByText('Choose a valid alignment.')).not.toBeInTheDocument()
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
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
  })

  itAxe('has no axe accessibility violations', async () => {
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
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
