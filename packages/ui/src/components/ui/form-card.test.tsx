import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { FormCard } from './form-card'

const baseProps = {
  title: 'Sign in',
  description: 'Enter your details to continue.',
  footer: <button type="submit">Continue</button>,
}

describe('FormCard', () => {
  it('renders the title and description', () => {
    render(
      <FormCard {...baseProps} onSubmit={(event) => event.preventDefault()}>
        <input aria-label="Email" />
      </FormCard>,
    )
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Enter your details to continue.')).toBeInTheDocument()
  })

  it('renders a form-level alert only when formError is set', () => {
    const { rerender } = render(
      <FormCard {...baseProps} onSubmit={(event) => event.preventDefault()}>
        <input aria-label="Email" />
      </FormCard>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    rerender(
      <FormCard
        {...baseProps}
        onSubmit={(event) => event.preventDefault()}
        formError="Invalid email or password."
      >
        <input aria-label="Email" />
      </FormCard>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
  })

  it('calls onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault())
    render(
      <FormCard {...baseProps} onSubmit={onSubmit}>
        <input aria-label="Email" />
      </FormCard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FormCard {...baseProps} onSubmit={(event) => event.preventDefault()}>
        <input aria-label="Email" />
      </FormCard>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
