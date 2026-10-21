import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  identityRowClassificationVariants,
  identityRowHeadingEndVariants,
  identityRowHeadingClusterVariants,
  identityRowHeadingLineVariants,
  identityRowHeadingVariants,
} from './identity-row.variants'
import { IdentityRow, IdentityRowHeadingLine } from './identity-row.client'

const copyScaleCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'copy-scale.css'),
  'utf8',
)
  .replace('@layer components {', '')
  .replace(/\n}\s*$/, '')
const identityRowCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'identity-row.css'),
  'utf8',
)
const SURFACE_TEST_TOKENS = `:root { --spacing: 4px; --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-heading-card: 19px; --text-xs--line-height: --text-sm--line-height: 20px; --text-base--line-height: 24px; }`

function resolveAnatomyRowGapPx(element: Element): string {
  let node: Element | null = element
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue('--ui-anatomy-row-gap').trim()
    const multiplier = specified.match(/\*\s*([\d.]+)\)/)?.[1]
    if (multiplier != null) {
      return `${4 * Number.parseFloat(multiplier)}px`
    }
    node = node.parentElement
  }
  return '4px'
}

describe('IdentityRow', () => {
  it('truncates a long heading while classification stays shrink-0', () => {
    render(
      <div className="w-40">
        <IdentityRow
          heading="Very Long Location Name That Should Truncate"
          classification="District"
          density="comfortable"
        />
      </div>,
    )

    const heading = screen.getByText('Very Long Location Name That Should Truncate')
    const classification = screen.getByText('District')

    expect(heading).toHaveClass('truncate')
    expect(heading.className).toContain(identityRowHeadingVariants())
    expect(classification).toHaveClass('shrink-0')
    expect(classification.className).toContain(identityRowClassificationVariants())
    expect(screen.getByText('District')).toBeInTheDocument()
  })

  it('keeps long classification shrink-0 without heading truncate classes', () => {
    render(
      <IdentityRow
        heading="Harborford"
        classification="Very Long Classification Label Here"
        density="comfortable"
      />,
    )

    const classification = screen.getByText('Very Long Classification Label Here')
    expect(classification).toHaveClass('shrink-0')
    expect(classification.className).not.toMatch(/\btruncate\b/)
  })

  it('wraps supporting copy when supportingWrap is set', () => {
    render(
      <IdentityRow
        heading="Building"
        supporting="A contained structure such as a tavern, temple, or guild hall."
        supportingWrap
        density="comfortable"
      />,
    )

    const supporting = screen.getByText(
      'A contained structure such as a tavern, temple, or guild hall.',
    )
    expect(supporting).toHaveClass('ui-identity-row__supporting--wrap')
    expect(supporting).not.toHaveClass('ui-identity-row__supporting--truncate')
  })

  it('truncates supporting copy by default', () => {
    render(<IdentityRow heading="Building" supporting="Secondary metadata line" />)

    const supporting = screen.getByText('Secondary metadata line')
    expect(supporting).toHaveClass('ui-identity-row__supporting--truncate')
  })

  it('omits supporting line when absent', () => {
    render(<IdentityRow heading="Only heading" />)

    expect(screen.getByText('Only heading')).toBeInTheDocument()
    expect(screen.queryByText('Secondary')).not.toBeInTheDocument()
  })

  it('keeps headingEnd shrink-0 beside a truncated heading', () => {
    render(
      <div className="w-40">
        <IdentityRow
          heading="Very Long Weapon Name That Should Truncate Before The Quantity"
          classification="Weapon"
          headingEnd={<span>x2</span>}
          density="compact"
        />
      </div>,
    )

    const heading = screen.getByText(
      'Very Long Weapon Name That Should Truncate Before The Quantity',
    )
    const quantity = screen.getByText('x2')
    expect(heading).toHaveClass('truncate')
    expect(quantity.parentElement).toHaveClass('shrink-0')
    expect(quantity.parentElement?.className).toContain(identityRowHeadingEndVariants())
    expect(screen.getByText('Weapon')).toHaveClass('shrink-0')
  })

  it('marks an explicit compact density on the row', () => {
    const { container } = render(
      <IdentityRow heading="Compact row" classification="Tag" density="compact" />,
    )

    expect(container.firstElementChild).toHaveClass('ui-identity-row--compact')
    expect(screen.getByText('Compact row')).toHaveClass('ui-identity-row__title', 'ui-copy-title')
  })

  it('keeps classification on the shared title class', () => {
    expect(identityRowClassificationVariants()).toContain('ui-identity-row__classification')
  })

  describe('anatomy row gap', () => {
    let styleEl: HTMLStyleElement

    beforeAll(() => {
      styleEl = document.createElement('style')
      styleEl.textContent = `${SURFACE_TEST_TOKENS}\n${copyScaleCss}\n${identityRowCss}`
      document.head.appendChild(styleEl)
    })

    afterAll(() => {
      styleEl.remove()
    })

    it('uses the shared row-gap on the stack without extra status offset', () => {
      const { container } = render(
        <IdentityRow
          heading="Item"
          supporting="Details"
          status={<span data-testid="status">Ready</span>}
          density="compact"
        />,
      )

      const stack = container.querySelector('.ui-identity-row__stack')
      expect(stack).not.toBeNull()
      expect(identityRowCss).toMatch(/row-gap:\s*var\(--ui-anatomy-row-gap\)/)
      expect(resolveAnatomyRowGapPx(container.firstElementChild!)).toBe('2px')
      expect(screen.getByTestId('status').parentElement).not.toHaveClass('mt-1')
    })
  })
})

describe('IdentityRowHeadingLine semantics', () => {
  it('merges title classes onto a single heading element and keeps the end slot outside it', () => {
    render(<IdentityRowHeadingLine heading={<h3>Verna</h3>} headingEnd={<span>Inactive</span>} />)

    const heading = screen.getByRole('heading', { name: 'Verna', level: 3 })
    expect(heading).toHaveClass('ui-identity-row__title', 'truncate')
    expect(heading).not.toContainElement(screen.getByText('Inactive'))
  })

  it('truncates a long title beside a trailing badge', () => {
    render(
      <div className="w-32">
        <IdentityRowHeadingLine
          heading="Very Long Character Name That Should Truncate"
          headingEnd={<span>Inactive</span>}
        />
      </div>,
    )

    const title = screen.getByText('Very Long Character Name That Should Truncate')
    expect(title).toHaveClass('truncate', 'min-w-0')
    expect(screen.getByText('Inactive').parentElement).toHaveClass('shrink-0')
  })

  it('centers headingEnd on the cross axis while the title cluster stays baseline-aligned', () => {
    const { container } = render(
      <IdentityRowHeadingLine heading="Verna" headingEnd={<span>Inactive</span>} />,
    )

    const line = container.firstElementChild
    expect(line).toHaveClass(identityRowHeadingLineVariants())
    expect(line?.firstElementChild).toHaveClass(identityRowHeadingClusterVariants())
  })
})

describe('IdentityRowHeadingLine headingInline', () => {
  it('places headingInline beside a truncating title without a separator', () => {
    render(
      <IdentityRowHeadingLine
        heading="An extraordinarily long equipment name that should truncate in narrow layouts"
        headingInline={<span data-testid="inline-slot">toggle</span>}
      />,
    )
    expect(screen.getByTestId('inline-slot')).toBeInTheDocument()
    expect(screen.getByTestId('inline-slot').closest('.gap-1')).not.toBeNull()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
  })
})

describe('IdentityRowHeadingLine classification copy scale', () => {
  let styleEl: HTMLStyleElement

  beforeAll(() => {
    styleEl = document.createElement('style')
    styleEl.textContent = `${SURFACE_TEST_TOKENS}\n${copyScaleCss}\n${identityRowCss}`
    document.head.appendChild(styleEl)
  })

  afterAll(() => {
    styleEl.remove()
  })

  const TOKEN_PX: Record<string, string> = {
    '--text-xs': '12px',
    '--text-sm': '14px',
    '--text-base': '16px',
  }

  function resolvedClassificationSize(label: string): string {
    let node: Element | null = screen.getByText(label)
    while (node) {
      const specified = getComputedStyle(node)
        .getPropertyValue('--ui-copy-classification-size')
        .trim()
      const token = specified.match(/^var\((--[^)]+)\)$/)?.[1]
      if (token && TOKEN_PX[token]) return TOKEN_PX[token]
      node = node.parentElement
    }
    return '14px'
  }

  it('resolves classification size from ui-identity-row density', () => {
    const { rerender } = render(
      <div className="ui-identity-row--compact">
        <IdentityRowHeadingLine heading="Greataxe" classification="Weapon" />
      </div>,
    )
    expect(resolvedClassificationSize('Weapon')).toBe('12px')

    rerender(
      <div className="ui-identity-row--comfortable">
        <IdentityRowHeadingLine heading="Greataxe" classification="Weapon" />
      </div>,
    )
    expect(resolvedClassificationSize('Weapon')).toBe('14px')

    rerender(
      <div className="ui-identity-row--spacious">
        <IdentityRowHeadingLine heading="Greataxe" classification="Weapon" />
      </div>,
    )
    expect(resolvedClassificationSize('Weapon')).toBe('16px')
  })

  it('uses comfortable classification on a standalone row without density', () => {
    render(<IdentityRow heading="Harborford" classification="District" />)
    expect(resolvedClassificationSize('District')).toBe('14px')
  })

  it('inherits compact classification from a generic card shell', () => {
    render(
      <div className="ui-card ui-card--compact">
        <IdentityRowHeadingLine heading="Greataxe" classification="Weapon" />
      </div>,
    )
    expect(resolvedClassificationSize('Weapon')).toBe('12px')
  })
})

describe('IdentityRow in InteractiveListRow shell', () => {
  it('preserves heading truncate with start and end slots in a narrow row', async () => {
    const { InteractiveListRow } = await import('./interactive-list-row.client')

    render(
      <div className="w-48">
        <InteractiveListRow
          name="Very Long Spell Name That Eventually Truncates"
          classification="Spell"
          startSlot={<span data-testid="start">◆</span>}
          endSlot={<span data-testid="end">✓</span>}
        />
      </div>,
    )

    expect(screen.getByTestId('start')).toBeInTheDocument()
    expect(screen.getByTestId('end')).toBeInTheDocument()
    expect(screen.getByText('Very Long Spell Name That Eventually Truncates')).toHaveClass(
      'truncate',
    )
    expect(screen.getByText('Spell')).toHaveClass('shrink-0')
  })
})
