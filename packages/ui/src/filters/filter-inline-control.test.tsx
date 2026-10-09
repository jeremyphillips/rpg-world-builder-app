/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Checkbox } from '../components/ui/checkbox.client'
import { FilterInlineControl } from './filter-inline-control.client'

describe('FilterInlineControl', () => {
  it('renders checkbox and label inside the shell', () => {
    render(
      <FilterInlineControl>
        <Checkbox id="has-spellcasting" />
        <label htmlFor="has-spellcasting">Has Spellcasting</label>
      </FilterInlineControl>,
    )

    expect(screen.getByLabelText('Has Spellcasting')).toBeInTheDocument()
  })

  it('defaults to outline shell chrome', () => {
    const { container } = render(
      <FilterInlineControl>
        <Checkbox id="outline-shell" />
        <label htmlFor="outline-shell">Outline</label>
      </FilterInlineControl>,
    )

    expect(container.firstElementChild).toHaveClass('border-interactive-outline')
  })

  it('applies ghost shell chrome when variant is ghost', () => {
    const { container } = render(
      <FilterInlineControl variant="ghost">
        <Checkbox id="ghost-shell" />
        <label htmlFor="ghost-shell">Ghost</label>
      </FilterInlineControl>,
    )

    expect(container.firstElementChild).toHaveClass('hover:bg-accent')
    expect(container.firstElementChild).not.toHaveClass('border-interactive-outline')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FilterInlineControl>
        <Checkbox id="demo" defaultChecked />
        <label htmlFor="demo">Demo filter</label>
      </FilterInlineControl>,
    )

    await expectNoAxeViolations(container)
  })
})
