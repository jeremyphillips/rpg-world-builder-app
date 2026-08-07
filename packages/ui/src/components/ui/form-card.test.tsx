import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FormCard } from './form-card'

const baseProps = {
  title: 'Sign in',
  description: 'Enter your details to continue.',
}

describe('FormCard', () => {
  it('renders the title, description, and body', () => {
    render(
      <FormCard {...baseProps}>
        <p>Body content</p>
      </FormCard>,
    )
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Enter your details to continue.')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('renders chrome only — no form element of its own', () => {
    const { container } = render(
      <FormCard {...baseProps}>
        <form aria-label="inner">
          <input aria-label="Email" />
        </form>
      </FormCard>,
    )
    expect(container.firstElementChild).toHaveClass('shadow-surface-raised')
    // Exactly the child form; FormCard adds none, so a nested <form> never occurs.
    expect(container.querySelectorAll('form')).toHaveLength(1)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FormCard {...baseProps}>
        <form>
          <input aria-label="Email" />
        </form>
      </FormCard>,
    )
    await expectNoAxeViolations(container)
  })
})
