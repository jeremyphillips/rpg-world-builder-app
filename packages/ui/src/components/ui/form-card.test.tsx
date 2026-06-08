import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

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
    // Exactly the child form; FormCard adds none, so a nested <form> never occurs.
    expect(container.querySelectorAll('form')).toHaveLength(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FormCard {...baseProps}>
        <form>
          <input aria-label="Email" />
        </form>
      </FormCard>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
