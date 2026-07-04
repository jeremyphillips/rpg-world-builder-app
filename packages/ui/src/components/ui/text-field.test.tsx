import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { TextField } from './text-field'

describe('TextField', () => {
  it('associates the label with the input via id', () => {
    render(<TextField id="email" label="Email" type="email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('forwards arbitrary input props', () => {
    render(
      <TextField id="email" label="Email" placeholder="you@example.com" autoComplete="email" />,
    )
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('renders the hint and no aria-invalid when there is no error', () => {
    render(<TextField id="pw" label="Password" hint="At least 8 characters." />)
    expect(screen.getByText('At least 8 characters.')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid')
  })

  it('renders the error, sets aria-invalid, and hides the hint', () => {
    render(<TextField id="email" label="Email" hint="Work email is fine." error="Required." />)
    expect(screen.getByText('Required.')).toBeInTheDocument()
    expect(screen.queryByText('Work email is fine.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('uses compact error text for sm fields', () => {
    render(<TextField id="email" label="Email" error="Required." size="sm" />)
    expect(screen.getByRole('alert')).toHaveClass('text-xs')
  })

  it('forwards the ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<TextField id="email" label="Email" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Email'))
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<TextField id="email" label="Email" type="email" />)
    await expectNoAxeViolations(container)
  })
})
