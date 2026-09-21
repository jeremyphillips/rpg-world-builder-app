import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChoiceGrantedRow } from './choice-granted-row'

describe('ChoiceGrantedRow', () => {
  it('renders a BadgeCheck leading icon with grant-card provenance copy', () => {
    render(
      <ChoiceGrantedRow
        row={{
          id: 'tool:thieves-tools',
          label: "Thieves' Tools",
          sourceLabel: 'Granted by Rogue',
        }}
      />,
    )

    expect(screen.getByText("Thieves' Tools")).toBeInTheDocument()
    expect(screen.getByText('Granted by Rogue')).toBeInTheDocument()
    const icon = document.querySelector('svg.lucide-badge-check')
    expect(icon).toBeTruthy()
    expect(icon).toHaveClass('size-6')
    expect(icon?.closest('[data-entity-item-slot="leading"]')).toBeTruthy()
    expect(document.querySelector('[class*="size-10"]')).toBeNull()
  })
})
