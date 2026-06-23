import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { WEAPON_MASTERY_ENTRIES } from '@rpg/contracts'

import { ContentStatRow } from './content-stat-row.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('ContentStatRow', () => {
  it('renders label and value', () => {
    render(<ContentStatRow label="Category" value="Martial" />)

    expect(screen.getByText(/Category:/)).toHaveTextContent('Martial')
  })

  it('renders an info tooltip trigger when info is provided', () => {
    render(
      <ContentStatRow
        label="Mastery"
        value={WEAPON_MASTERY_ENTRIES.sap.label}
        info={WEAPON_MASTERY_ENTRIES.sap.description}
        infoAriaLabel="About Sap"
      />,
    )

    expect(screen.getByRole('button', { name: 'About Sap' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ContentStatRow
        label="Mastery"
        value={WEAPON_MASTERY_ENTRIES.cleave.label}
        info={WEAPON_MASTERY_ENTRIES.cleave.description}
        infoAriaLabel="About Cleave"
      />,
    )

    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
