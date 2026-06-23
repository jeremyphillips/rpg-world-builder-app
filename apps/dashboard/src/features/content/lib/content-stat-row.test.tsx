import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { WEAPON_MASTERY_ENTRIES } from '@rpg/contracts'

import { ContentStatRow } from './content-stat-row.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('ContentStatRow', () => {
  it('renders label and value', () => {
    render(<ContentStatRow label="Category" value="Martial" />)

    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Martial')).toBeInTheDocument()
  })

  it('renders an info tooltip trigger beside the value by default', () => {
    render(
      <ContentStatRow
        label="Mastery"
        value={WEAPON_MASTERY_ENTRIES.sap.label}
        info={WEAPON_MASTERY_ENTRIES.sap.description}
        infoAriaLabel="About Sap"
      />,
    )

    expect(screen.getByRole('button', { name: 'About Sap' })).toBeInTheDocument()
    expect(screen.getByText('Mastery')).toBeInTheDocument()
    expect(screen.getByText(WEAPON_MASTERY_ENTRIES.sap.label)).toBeInTheDocument()
  })

  it('renders an info tooltip trigger beside the label when infoPlacement is label', () => {
    render(
      <ContentStatRow
        label="Ritual"
        value="No"
        info="Ritual casting rules."
        infoPlacement="label"
      />,
    )

    expect(screen.getByRole('button', { name: 'About Ritual' })).toBeInTheDocument()
    expect(screen.getByText('Ritual')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
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
