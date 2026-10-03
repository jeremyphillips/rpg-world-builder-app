import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  EntitySummaryDescription,
  EntitySummaryHeading,
  EntitySummaryStatus,
} from '../entity-summary'

describe('EntitySummaryHeading', () => {
  it('keeps classification immediately adjacent for short titles', () => {
    render(<EntitySummaryHeading density="compact" heading="Fire Bolt" classification="Spell" />)

    const name = screen.getByText('Fire Bolt')
    const classification = screen.getByText('Spell')
    const mixedHeadingRow = name.parentElement as HTMLElement

    expect(name.className).not.toMatch(/\bflex-1\b/)
    expect(classification.className).toMatch(/\bshrink-0\b/)
    expect(mixedHeadingRow.querySelector('[data-inline-metadata-separator]')?.textContent).toContain(
      '·',
    )
    expect(mixedHeadingRow).toHaveTextContent('Fire Bolt · Spell')
  })

  it('fills the content cell so the heading end value sits at the column end', () => {
    const { container } = render(
      <EntitySummaryHeading
        density="comfortable"
        heading="Fire Bolt"
        classification="Spell"
        headingEndValue={3}
      />,
    )

    expect(container.firstElementChild).toHaveClass('min-w-0', 'flex-1')
    expect(screen.getByText('3')).toHaveClass('tabular-nums')
  })

  it('truncates long titles in a narrow content column without percentage caps', () => {
    const { container } = render(
      <div className="w-32">
        <EntitySummaryHeading
          density="comfortable"
          heading="Very Long Spell Name That Eventually Truncates"
          classification="Spell"
        />
      </div>,
    )

    const name = screen.getByText('Very Long Spell Name That Eventually Truncates')
    expect(name).toHaveClass('truncate')
    expect(name.className).not.toMatch(/\bflex-1\b/)
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(container.querySelector('[class*="max-w-"]')).toBeNull()
  })

  it('selects typography by density only — no band or alignment wrappers', () => {
    const { container } = render(
      <EntitySummaryHeading density="compact" heading="Amulet" />,
    )

    expect(container.querySelector('[class*="min-h-control-action-compact"]')).toBeNull()
    expect(container.querySelector('[data-entity-summary-band]')).toBeNull()
  })
})

describe('EntitySummaryDescription', () => {
  it('maps density to supporting text size', () => {
    render(
      <>
        <EntitySummaryDescription density="compact">Compact copy</EntitySummaryDescription>
        <EntitySummaryDescription density="comfortable">Comfortable copy</EntitySummaryDescription>
      </>,
    )

    expect(screen.getByText('Compact copy')).toHaveClass('text-xs', 'truncate')
    expect(screen.getByText('Comfortable copy')).toHaveClass('text-sm', 'truncate')
  })
})

describe('EntitySummaryStatus', () => {
  it('renders compact status badges at sm density without its own top offset', () => {
    const { container } = render(
      <EntitySummaryStatus
        density="compact"
        items={[{ kind: 'badge', label: 'Spellcasting focus', appearance: 'soft' }]}
      />,
    )

    const statusRow = container.querySelector('[data-entity-summary-status-row]')
    expect(statusRow).not.toHaveClass('mt-1')
    expect(screen.getByText('Spellcasting focus').className).toMatch(/text-xs-meta/)
  })

  it('renders comfortable status badges at md density', () => {
    render(
      <EntitySummaryStatus
        density="comfortable"
        items={[{ kind: 'badge', label: 'Equipped', tone: 'success' }]}
      />,
    )

    expect(screen.getByText('Equipped').className).toMatch(/text-sm-meta/)
  })
})
