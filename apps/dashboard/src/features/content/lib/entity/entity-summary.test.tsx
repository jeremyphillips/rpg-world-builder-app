import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EntityItemAnatomy } from './entity-item.client'
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

describe('EntitySummary status lane', () => {
  it('renders compact status badges at sm density with canonical row spacing', () => {
    const { container } = render(
      <EntitySummary
        density="compact"
        entity={{
          heading: 'Amulet',
          classification: 'Adventuring Gear',
          description: 'Holy symbol',
          status: [{ kind: 'badge', label: 'Spellcasting focus', appearance: 'accent-outline' }],
        }}
      />,
    )

    const statusRow = container.querySelector('[data-entity-summary-status-row]')
    expect(statusRow).toHaveClass('mt-1')
    expect(screen.getByText('Spellcasting focus').className).toMatch(/text-xs-meta/)
  })

  it('renders comfortable status badges at md density', () => {
    render(
      <EntitySummary
        density="comfortable"
        entity={{
          heading: 'Amulet',
          status: [{ kind: 'badge', label: 'Equipped', tone: 'success' }],
        }}
      />,
    )

    expect(screen.getByText('Equipped').className).toMatch(/text-sm-meta/)
  })

  it('renders status below heading when description is absent', () => {
    const { container } = render(
      <EntitySummary
        entity={{
          heading: 'Brock',
          status: [{ kind: 'badge', label: 'Member', tone: 'success' }],
        }}
      />,
    )

    expect(container.querySelector('[data-entity-summary-status-row]')).toHaveClass('mt-1')
    expect(screen.getByText('Member')).toBeInTheDocument()
  })

  it('keeps status in the summary column when trailing action is present', () => {
    render(
      <EntityItemAnatomy
        density="compact"
        entity={{
          heading: 'Amulet',
          classification: 'Adventuring Gear',
          description: 'Holy symbol',
          status: [{ kind: 'badge', label: 'Spellcasting focus' }],
        }}
        trailing={{
          kind: 'action',
          content: <button type="button">Add</button>,
        }}
      />,
    )

    expect(screen.getByText('Spellcasting focus')).toBeInTheDocument()
    expect(document.querySelector('[data-entity-summary-status-row]')).toBeTruthy()
    expect(document.querySelector('[data-entity-item-slot="trailing"]')).toBeTruthy()
  })
})
