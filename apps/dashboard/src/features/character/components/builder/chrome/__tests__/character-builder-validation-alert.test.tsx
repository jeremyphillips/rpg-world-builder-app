import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { characterBuilderValidationMessages, formatFieldMessage } from '@rpg/contracts'

import { CharacterBuilderValidationAlert } from '../character-builder-validation-alert'

describe('CharacterBuilderValidationAlert', () => {
  it('renders nothing when there are no issues', () => {
    const { container } = render(<CharacterBuilderValidationAlert issues={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows only the user-facing message', () => {
    render(
      <CharacterBuilderValidationAlert
        issues={[
          {
            code: 'invalid_type',
            message: 'Spell access is required.',
            path: 'spells.0.access',
            source: 'api',
            stepId: 'spells',
          },
        ]}
      />,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Spell access is required.')
    expect(alert).not.toHaveTextContent('Spells')
    expect(alert).not.toHaveTextContent('spells.0.access')
    expect(alert).not.toHaveTextContent('invalid_type')
    expect(screen.queryByRole('button', { name: 'Technical details' })).not.toBeInTheDocument()
  })

  it('lists validation issues in an alert', () => {
    render(
      <CharacterBuilderValidationAlert
        issues={[
          {
            code: 'identity_name_required',
            message: 'Name is required.',
            path: 'identity.name',
            stepId: 'identity',
          },
        ]}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
  })

  it('decodes structured validation headings before rendering', () => {
    render(
      <CharacterBuilderValidationAlert
        heading={characterBuilderValidationMessages.completeRequiredFields()}
        issues={[
          {
            code: 'abilities_incomplete',
            message: characterBuilderValidationMessages.abilitiesIncomplete(),
            path: 'abilities.scores',
            stepId: 'abilities',
          },
        ]}
      />,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(
      formatFieldMessage(characterBuilderValidationMessages.completeRequiredFields()),
    )
    expect(alert).toHaveTextContent(
      formatFieldMessage(characterBuilderValidationMessages.abilitiesIncomplete()),
    )
    expect(alert.textContent).not.toMatch(/\{"f":/)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterBuilderValidationAlert
        issues={[
          {
            code: 'identity_name_required',
            message: 'Name is required.',
            path: 'identity.name',
            stepId: 'identity',
          },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
