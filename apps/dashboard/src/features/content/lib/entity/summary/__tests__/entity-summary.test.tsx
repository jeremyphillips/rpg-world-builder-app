import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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
    expect(
      mixedHeadingRow.querySelector('[data-inline-metadata-separator]')?.textContent,
    ).toContain('·')
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
    const { container } = render(<EntitySummaryHeading density="compact" heading="Amulet" />)

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

  it('defaults to the wrapped cluster without separators', () => {
    const { container } = render(
      <EntitySummaryStatus
        density="compact"
        items={[
          { kind: 'badge', label: 'Cannot afford', tone: 'destructive' },
          { kind: 'text', label: 'Required by class' },
        ]}
      />,
    )

    expect(container.querySelector('[data-entity-summary-status-row]')).not.toBeNull()
    expect(container.querySelector('[data-inline-metadata-separator]')).toBeNull()
    expect(screen.getByText('Required by class').tagName).toBe('DIV')
  })

  describe('metadata composition', () => {
    const items = [
      { kind: 'badge', label: 'Cannot afford', tone: 'destructive', appearance: 'soft' },
      { kind: 'text', variant: 'guidance', label: 'Required by class', title: 'Wizard class' },
      { kind: 'text', variant: 'guidance', label: 'Included in package option' },
    ] as const

    it('joins badges and guidance text with aria-hidden separators', () => {
      const { container } = render(
        <EntitySummaryStatus density="compact" composition="metadata" items={items} />,
      )

      const separators = container.querySelectorAll('[data-inline-metadata-separator]')
      expect(separators).toHaveLength(2)
      for (const separator of separators) {
        expect(separator).toHaveAttribute('aria-hidden', 'true')
      }
      expect(container.querySelector('[data-entity-summary-status-row]')).toBeNull()
    })

    it('renders guidance text as an inline non-truncating span with its title', () => {
      render(<EntitySummaryStatus density="compact" composition="metadata" items={items} />)

      const guidance = screen.getByText('Required by class')
      expect(guidance.tagName).toBe('SPAN')
      expect(guidance).toHaveClass('text-foreground', 'text-xs')
      expect(guidance).not.toHaveClass('truncate')
      expect(guidance).toHaveAttribute('title', 'Wizard class')
    })

    it('renders a single item without a separator', () => {
      const { container } = render(
        <EntitySummaryStatus
          density="comfortable"
          composition="metadata"
          items={[{ kind: 'badge', label: 'Not proficient', tone: 'warning' }]}
        />,
      )

      expect(container.querySelector('[data-inline-metadata-separator]')).toBeNull()
      expect(screen.getByText('Not proficient')).toBeInTheDocument()
    })

    it('keeps multiple badges on one line', () => {
      const { container } = render(
        <EntitySummaryStatus
          density="compact"
          composition="metadata"
          items={[
            { kind: 'badge', label: 'Cannot afford', tone: 'destructive' },
            { kind: 'badge', label: 'Not proficient', tone: 'warning' },
          ]}
        />,
      )

      expect(container.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(1)
      expect(container.querySelector('[data-entity-summary-status] button')).toBeNull()
    })

    itAxe('has no axe violations', async () => {
      const { container } = render(
        <EntitySummaryStatus density="compact" composition="metadata" items={items} />,
      )
      await expectNoAxeViolations(container)
    })
  })

  describe('provenance', () => {
    const provenance = [
      { kind: 'text', label: 'Package ×2' },
      {
        kind: 'action',
        key: 'release:uncommon',
        label: 'Release one',
        ariaLabel: 'Release one Uncommon choice',
        onAction: () => undefined,
      },
    ] as const

    it('renders the provenance group before the status group on one line', () => {
      const { container } = render(
        <EntitySummaryStatus
          density="compact"
          composition="metadata"
          provenance={provenance}
          items={[{ kind: 'badge', label: 'Not proficient', tone: 'warning' }]}
        />,
      )

      const segments = [...container.querySelectorAll('[data-entity-summary-provenance]')]
      expect(segments.map((segment) => segment.textContent)).toEqual(['Package ×2', 'Release one'])
      expect(segments[0]?.firstElementChild).toHaveClass('text-foreground')
      expect(segments[1]?.querySelector('button')).toHaveClass('text-action-standalone')
      expect(segments[1]?.querySelector('button')).not.toHaveClass('text-action-inline')
      expect(container.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(2)
      expect(
        segments[0]!.compareDocumentPosition(
          container.querySelector('[data-entity-summary-status]')!,
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })

    it('keeps inline actions out of the status group', () => {
      const { container } = render(
        <EntitySummaryStatus
          density="compact"
          composition="metadata"
          provenance={provenance}
          items={[{ kind: 'badge', label: 'Not proficient', tone: 'warning' }]}
        />,
      )

      expect(container.querySelector('[data-entity-summary-status] button')).toBeNull()
      expect(container.querySelector('[data-entity-summary-provenance] button')).not.toBeNull()
    })

    it('uses the metadata line even when composition defaults to cluster', () => {
      const { container } = render(
        <EntitySummaryStatus density="compact" items={[]} provenance={provenance} />,
      )

      expect(container.querySelector('[data-entity-summary-status-row]')).toBeNull()
      expect(screen.getByRole('button', { name: 'Release one Uncommon choice' })).toBeEnabled()
    })

    itAxe('has no axe violations', async () => {
      const { container } = render(
        <EntitySummaryStatus
          density="compact"
          composition="metadata"
          provenance={provenance}
          items={[{ kind: 'badge', label: 'Not proficient', tone: 'warning' }]}
        />,
      )
      await expectNoAxeViolations(container)
    })
  })
})
