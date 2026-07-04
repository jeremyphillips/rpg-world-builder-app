import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { Heading } from './heading'

describe('Heading', () => {
  it('renders with the requested semantic element', () => {
    render(
      <Heading variant="section" as="h2" id="traits-heading">
        Traits
      </Heading>,
    )
    const heading = screen.getByRole('heading', { level: 2, name: 'Traits' })
    expect(heading).toHaveAttribute('id', 'traits-heading')
  })

  it('defaults to h2', () => {
    render(<Heading variant="page">Account Settings</Heading>)
    expect(screen.getByRole('heading', { level: 2, name: 'Account Settings' })).toBeInTheDocument()
  })

  it('applies variant composite classes', () => {
    render(<Heading variant="display">Elf</Heading>)
    const heading = screen.getByRole('heading', { name: 'Elf' })
    expect(heading).toHaveClass('heading-style-display')
  })

  it('applies composite classes for compact and label variants', () => {
    render(<Heading variant="alert">Delete item?</Heading>)
    expect(screen.getByRole('heading', { name: 'Delete item?' })).toHaveClass('heading-style-alert')

    render(
      <Heading variant="label" as="p">
        Darkvision
      </Heading>,
    )
    expect(screen.getByText('Darkvision')).toHaveClass('heading-style-label')
  })

  it('applies subsection and group composite classes', () => {
    render(
      <Heading variant="subsection" as="h3">
        Heritage
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Heritage' })).toHaveClass(
      'heading-style-subsection',
    )

    render(
      <Heading variant="group" as="h4">
        Features
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 4, name: 'Features' })).toHaveClass(
      'heading-style-group',
    )
  })

  it('merges custom className', () => {
    render(
      <Heading variant="section" className="mb-4 capitalize">
        Traits
      </Heading>,
    )
    const heading = screen.getByRole('heading', { name: 'Traits' })
    expect(heading).toHaveClass('mb-4', 'heading-style-section')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <Heading variant="display" as="h1">
        Elf
      </Heading>,
    )
    await expectNoAxeViolations(container)
  })
})
