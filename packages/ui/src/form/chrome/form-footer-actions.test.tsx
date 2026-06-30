import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

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

  it('has no axe violations', async () => {
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
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
