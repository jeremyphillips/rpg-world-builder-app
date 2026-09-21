import type { ComponentProps } from 'react'
import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  clearBuilderFormContinueHandlersForTests,
  runBuilderFormContinueHandler,
} from '../../../../lib/builder/builder-form-continue-registry'
import { mergeCharacterBuilderDraft } from '../../../../lib/draft/merge-character-builder-draft'
import { IdentityStep } from './identity-step'
import { identityStepTestContext } from './identity-step.fixtures'

const generateCharacterSpeciesNameMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../lib/naming/character-species-name-generation.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    generateCharacterSpeciesName: generateCharacterSpeciesNameMock,
  }
})

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

function renderIdentityStep(overrides: Partial<ComponentProps<typeof IdentityStep>> = {}) {
  return render(
    <IdentityStep
      context={identityStepTestContext}
      draft={createEmptyCharacterBuilderDraft()}
      validationIssues={[]}
      onDraftChange={vi.fn()}
      onStepComplete={vi.fn()}
      onFormContinueValidationFailed={vi.fn()}
      {...overrides}
    />,
  )
}

describe('IdentityStep', () => {
  afterEach(() => {
    clearBuilderFormContinueHandlersForTests()
    generateCharacterSpeciesNameMock.mockReset()
  })

  it('registers a continue handler that surfaces validation failure without a silent no-op', async () => {
    const onFormContinueValidationFailed = vi.fn()

    renderIdentityStep({ onFormContinueValidationFailed })

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
    renderIdentityStep()

    expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Character name/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument()
    expect(await screen.findByLabelText(/Backstory/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add trait/i })).toBeInTheDocument()
  })

  it('shows an inline species picker and naming hint before species is chosen', () => {
    renderIdentityStep()

    expect(screen.getByRole('combobox', { name: 'Species' })).toBeInTheDocument()
    expect(screen.getByText('Choose a species to generate a name.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('enables Generate after species is selected on the identity step', async () => {
    const user = userEvent.setup()
    let draft = createEmptyCharacterBuilderDraft()
    const onDraftChange = vi.fn((patch) => {
      draft = mergeCharacterBuilderDraft(draft, patch)
    })

    const { rerender } = renderIdentityStep({ draft, onDraftChange })

    await user.click(screen.getByRole('combobox', { name: 'Species' }))
    await user.click(screen.getByRole('option', { name: 'Dwarf' }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        species: expect.objectContaining({ speciesId: 'srd-cc-5.2.1:dwarf' }),
      }),
    )

    rerender(
      <IdentityStep
        context={identityStepTestContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onStepComplete={vi.fn()}
        onFormContinueValidationFailed={vi.fn()}
      />,
    )

    expect(screen.queryByRole('combobox', { name: 'Species' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled()
  })

  it('populates the name field when Generate is clicked', async () => {
    const user = userEvent.setup()
    generateCharacterSpeciesNameMock.mockResolvedValue({ ok: true, name: 'Thorin Stonehelm' })

    renderIdentityStep({
      draft: {
        ...createEmptyCharacterBuilderDraft(),
        species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      },
    })

    await user.click(screen.getByRole('button', { name: 'Generate' }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Character name/i })).toHaveValue(
        'Thorin Stonehelm',
      )
    })
    expect(generateCharacterSpeciesNameMock).toHaveBeenCalledWith({
      speciesId: 'srd-cc-5.2.1:dwarf',
      context: identityStepTestContext,
    })
  })

  it('treats alignment chips as single-select', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()

    renderIdentityStep({ onDraftChange })

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
    renderIdentityStep({
      validationIssues: [
        {
          code: 'identity.name.required',
          message: 'Name is required.',
          stepId: 'identity',
        },
      ],
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderIdentityStep({
      draft: {
        ...createEmptyCharacterBuilderDraft(),
        identity: {
          name: 'Verna',
          alignment: 'ng',
          narrative: { personalityTraits: ['Steady'] },
        },
      },
    })

    await expectNoAxeViolations(container)
  })
})
