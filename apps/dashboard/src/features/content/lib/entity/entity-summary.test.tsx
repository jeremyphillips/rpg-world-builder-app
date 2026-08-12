import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EntitySummary } from './entity-summary.client'

describe('EntitySummary mixed heading', () => {
  it('keeps classification immediately adjacent for short titles', () => {
    render(
      <EntitySummary
        density="compact"
        entity={{
          heading: 'Fire Bolt',
          classification: 'Spell',
        }}
      />,
    )

    const name = screen.getByText('Fire Bolt')
    const classification = screen.getByText('Spell')
    const mixedHeadingRow = name.parentElement as HTMLElement

    expect(name.className).not.toMatch(/\bflex-1\b/)
    expect(classification.className).toMatch(/\bshrink-0\b/)
    expect(mixedHeadingRow.childNodes[0]).toBe(name)
    expect(mixedHeadingRow.childNodes[2]).toBe(classification)
  })

  it('preserves outer summary flex-1 for EntityItem content column ownership', () => {
    const { container } = render(
      <EntitySummary
        entity={{
          heading: 'Fire Bolt',
          classification: 'Spell',
        }}
      />,
    )

    expect(container.firstElementChild).toHaveClass('min-w-0', 'flex-1')
  })

  it('truncates long titles in a narrow content column without percentage caps', () => {
    const { container } = render(
      <div className="w-32">
        <EntitySummary
          entity={{
            heading: 'Very Long Spell Name That Eventually Truncates',
            classification: 'Spell',
          }}
        />
      </div>,
    )

    const name = screen.getByText('Very Long Spell Name That Eventually Truncates')
    expect(name).toHaveClass('truncate')
    expect(name.className).not.toMatch(/\bflex-1\b/)
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(container.querySelector('[class*="max-w-"]')).toBeNull()
  })
})
