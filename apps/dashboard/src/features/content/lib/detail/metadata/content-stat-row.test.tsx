import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'
import { WEAPON_MASTERY_ENTRIES } from '@rpg/contracts'

import { ContentStatRow } from './content-stat-row'

describe('ContentStatRow', () => {
  it('renders label and value', () => {
    render(<ContentStatRow label="Category" value="Martial" />)

    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Martial')).toBeInTheDocument()
  })

  it('applies compact 14px typography when size is sm', () => {
    render(<ContentStatRow label="Category" value="Martial" size="sm" />)

    const row = screen.getByText('Category').closest('p')
    expect(row).toHaveClass('text-sm')
    expect(screen.getByText('Category')).toHaveClass('text-sm')
    expect(screen.getByText('Martial')).toHaveClass('text-sm')
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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ContentStatRow
        label="Mastery"
        value={WEAPON_MASTERY_ENTRIES.cleave.label}
        info={WEAPON_MASTERY_ENTRIES.cleave.description}
        infoAriaLabel="About Cleave"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
