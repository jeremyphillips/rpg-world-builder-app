import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { Heading } from './heading'

describe('Heading', () => {
  it('renders with the requested semantic element', () => {
    render(
      <Heading variant="section" as="h3" id="traits-heading">
        Traits
      </Heading>,
    )
    const heading = screen.getByRole('heading', { level: 3, name: 'Traits' })
    expect(heading).toHaveAttribute('id', 'traits-heading')
  })

  it('defaults to h2', () => {
    render(<Heading variant="page">Account Settings</Heading>)
    expect(screen.getByRole('heading', { level: 2, name: 'Account Settings' })).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Heading variant="display">Elf</Heading>)
    const heading = screen.getByRole('heading', { name: 'Elf' })
    expect(heading).toHaveClass('text-heading-display', 'font-bold', 'tracking-tight')
  })

  it('applies explicit size tokens for compact and label variants', () => {
    render(<Heading variant="alert">Delete item?</Heading>)
    expect(screen.getByRole('heading', { name: 'Delete item?' })).toHaveClass(
      'text-heading-compact',
    )

    render(
      <Heading variant="label" as="p">
        Darkvision
      </Heading>,
    )
    expect(screen.getByText('Darkvision')).toHaveClass('text-heading-label', 'font-medium')
  })

  it('merges custom className', () => {
    render(
      <Heading variant="section" className="mb-4 capitalize">
        Traits
      </Heading>,
    )
    const heading = screen.getByRole('heading', { name: 'Traits' })
    expect(heading).toHaveClass('mb-4', 'capitalize')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <Heading variant="display" as="h2">
        Elf
      </Heading>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})
