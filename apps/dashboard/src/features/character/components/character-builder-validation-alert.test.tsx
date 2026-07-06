import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CharacterBuilderValidationAlert } from './character-builder-validation-alert.client'

describe('CharacterBuilderValidationAlert', () => {
  it('renders nothing when there are no issues', () => {
    const { container } = render(<CharacterBuilderValidationAlert issues={[]} />)
    expect(container).toBeEmptyDOMElement()
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

  it('has no axe accessibility violations', async () => {
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
