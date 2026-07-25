/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

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

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FilterInlineControl>
        <Checkbox id="demo" defaultChecked />
        <label htmlFor="demo">Demo filter</label>
      </FilterInlineControl>,
    )

    await expectNoAxeViolations(container)
  })
})
