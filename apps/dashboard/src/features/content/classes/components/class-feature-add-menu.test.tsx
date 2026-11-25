import { ButtonDropdown } from '@rpg/ui'
import { classValidationMessages, formatFieldMessage } from '@rpg/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi } from 'vitest'

import { expectPlainDisplayCopy } from '@/test/expect-plain-display-copy'

import type { FeatureRowForm } from '../lib/class-feature-form-fields'
import { buildClassFeatureAcquisition } from '../lib/class-feature-acquisition'

const subclassChoiceRow: FeatureRowForm = {
  kind: 'subclass-choice',
  id: 'fighter-subclass',
  name: 'Fighter Subclass',
  level: 3,
  description: '',
  grants: [],
  tables: [],
  available: true,
}

describe('ClassFeatureAddMenu', () => {
  it('shows decoded subclass-choice duplicate copy when a milestone already exists', async () => {
    const user = userEvent.setup()
    const expectedDisplay = formatFieldMessage(
      classValidationMessages.subclassChoiceFeatureDuplicate(),
    )
    const transport = classValidationMessages.subclassChoiceFeatureDuplicate()

    render(
      <ButtonDropdown
        {...buildClassFeatureAcquisition({
          className: 'Fighter',
          classSlug: 'fighter',
          features: [subclassChoiceRow],
          onAddRows: vi.fn(),
        })}
        triggerPresentation="addIcon"
      />,
    )

    await user.click(screen.getByRole('button', { name: /Add feature/i }))

    const visible = screen.getByText(expectedDisplay).textContent ?? ''
    expectPlainDisplayCopy(visible, { transport, label: 'subclass-choice menu supporting copy' })
  })
})
