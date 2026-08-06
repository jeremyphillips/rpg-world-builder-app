import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Button } from '../../components/ui/button.client'
import { FormFooterActions } from './form-footer-actions'

describe('FormFooterActions', () => {
  it('renders submit button right-aligned when no leading actions', () => {
    render(<FormFooterActions submitLabel="Save profile" />)
    const button = screen.getByRole('button', { name: 'Save profile' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button.parentElement).toHaveClass('ml-auto')
  })

  it('renders leading, secondary, and submit actions in one row', () => {
    render(
      <FormFooterActions
        leading={
          <Button type="button" variant="destructive">
            Delete
          </Button>
        }
        secondary={
          <Button type="button" variant="outline">
            Cancel
          </Button>
        }
        submitLabel="Save changes"
      />,
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('announces success message beside submit', () => {
    render(<FormFooterActions submitLabel="Save" isSuccess successMessage="Profile saved." />)
    expect(screen.getByRole('status')).toHaveTextContent('Profile saved.')
  })

  it('disables submit when submitDisabled is true', () => {
    render(<FormFooterActions submitLabel="Save changes" submitDisabled />)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('disables secondary actions while pending', () => {
    render(
      <FormFooterActions
        pending
        secondary={
          <Button type="button" variant="outline">
            Cancel
          </Button>
        }
        submitLabel="Save changes"
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('disables secondary when secondaryDisabled is true without pending', () => {
    render(
      <FormFooterActions
        secondary={
          <Button type="button" variant="outline">
            Discard changes
          </Button>
        }
        secondaryDisabled
        submitLabel="Save changes"
      />,
    )

    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeDisabled()
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <FormFooterActions
        secondary={
          <Button type="button" variant="outline">
            Cancel
          </Button>
        }
        submitLabel="Save"
        isSuccess
        successMessage="Saved."
      />,
    )
    await expectNoAxeViolations(container)
  })
})
