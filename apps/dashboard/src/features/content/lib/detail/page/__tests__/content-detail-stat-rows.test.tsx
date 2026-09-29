import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContentDetailStatRows } from '../content-detail-stat-rows'
import { contentDetailStatRowsHostClasses } from '../../metadata/content-stat-row.variants'

describe('ContentDetailStatRows', () => {
  it('uses a flex-wrap host without equal-width column tracks and renders group dividers', () => {
    const { container } = render(
      <ContentDetailStatRows
        statRows={[
          { label: 'Hit Die', value: 'd10' },
          { label: 'Primary Abilities', value: 'Strength, Dexterity' },
          { label: 'Saving Throws', value: 'Strength, Constitution' },
          { label: 'Armor', value: 'All armor' },
        ]}
      />,
    )

    const host = container.querySelector('[data-slot="content-detail-stat-rows-host"]')
    expect(host).toHaveClass(contentDetailStatRowsHostClasses)
    expect(host?.className).toContain('flex-wrap')
    expect(host?.className).not.toMatch(/grid-cols-\[minmax\(0,1fr\)/)
    expect(container.querySelectorAll('[data-slot="content-detail-stat-rows-group"]')).toHaveLength(
      2,
    )
    expect(
      container.querySelector('[data-slot="content-detail-stat-rows-group-divider"]'),
    ).toBeNull()
  })

  it('splits into the requested column count', () => {
    const { container } = render(
      <ContentDetailStatRows
        columnCount={3}
        statRows={[
          { label: 'Category', value: 'Martial' },
          { label: 'Mode', value: 'Melee' },
          { label: 'Damage', value: '1d8 slashing' },
          { label: 'Properties', value: 'Versatile' },
          { label: 'Mastery', value: 'Sap' },
          { label: 'Cost', value: '15 GP' },
        ]}
      />,
    )

    expect(container.querySelectorAll('[data-slot="content-detail-stat-rows-group"]')).toHaveLength(
      3,
    )
  })

  it('renders a single group for three or fewer rows', () => {
    const { container } = render(
      <ContentDetailStatRows statRows={[{ label: 'AC', value: '+2' }]} />,
    )

    expect(container.querySelectorAll('[data-slot="content-detail-stat-rows-group"]')).toHaveLength(
      1,
    )
    expect(screen.getByText('AC')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
