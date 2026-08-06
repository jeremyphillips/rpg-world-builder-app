import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FormSaveFooter } from './form-save-footer'

describe('FormSaveFooter', () => {
  it('renders an enabled submit button with the submit label', () => {
    render(<FormSaveFooter submitLabel="Save profile" />)
    const button = screen.getByRole('button', { name: 'Save profile' })
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('disables the button and shows the pending label while pending', () => {
    render(<FormSaveFooter submitLabel="Save profile" pending />)
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  })

  it('announces the success message after a successful save', () => {
    render(<FormSaveFooter submitLabel="Save" isSuccess successMessage="Profile saved." />)
    expect(screen.getByRole('status')).toHaveTextContent('Profile saved.')
  })

  it('hides the success message until isSuccess is true', () => {
    render(<FormSaveFooter submitLabel="Save" successMessage="Profile saved." />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <FormSaveFooter submitLabel="Save" isSuccess successMessage="Saved." />,
    )
    await expectNoAxeViolations(container)
  })
})
