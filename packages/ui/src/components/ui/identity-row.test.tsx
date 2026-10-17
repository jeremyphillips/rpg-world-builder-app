import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  identityRowClassificationVariants,
  identityRowHeadingEndVariants,
  identityRowHeadingVariants,
} from './identity-row.variants'
import { IdentityRow, IdentityRowHeadingLine } from './identity-row.client'

describe('IdentityRow', () => {
  it('truncates a long heading while classification stays shrink-0', () => {
    render(
      <div className="w-40">
        <IdentityRow
          heading="Very Long Location Name That Should Truncate"
          classification="District"
          size="md"
        />
      </div>,
    )

    const heading = screen.getByText('Very Long Location Name That Should Truncate')
    const classification = screen.getByText('District')

    expect(heading).toHaveClass('truncate')
    expect(heading.className).toContain(identityRowHeadingVariants({ size: 'md' }))
    expect(classification).toHaveClass('shrink-0')
    expect(classification.className).toContain(identityRowClassificationVariants({ size: 'md' }))
    expect(screen.getByText('District')).toBeInTheDocument()
  })

  it('keeps long classification shrink-0 without heading truncate classes', () => {
    render(
      <IdentityRow
        heading="Harborford"
        classification="Very Long Classification Label Here"
        size="md"
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
        size="md"
      />,
    )

    const supporting = screen.getByText(
      'A contained structure such as a tavern, temple, or guild hall.',
    )
    expect(supporting).toHaveClass('ui-identity-row__supporting--wrap')
    expect(supporting).not.toHaveClass('ui-identity-row__supporting--truncate')
  })

  it('truncates supporting copy by default', () => {
    render(<IdentityRow heading="Building" supporting="Secondary metadata line" size="md" />)

    const supporting = screen.getByText('Secondary metadata line')
    expect(supporting).toHaveClass('ui-identity-row__supporting--truncate')
  })

  it('omits supporting line when absent', () => {
    render(<IdentityRow heading="Only heading" size="md" />)

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
          size="sm"
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

  it('uses text-xs heading at sm size', () => {
    render(<IdentityRow heading="Compact row" classification="Tag" size="sm" />)

    expect(screen.getByText('Compact row').className).toContain('ui-identity-row__title--sm')
  })

  it('keeps md classification on the title scale', () => {
    expect(identityRowClassificationVariants({ size: 'md' })).toContain(
      'ui-identity-row__classification--md',
    )
  })
})

describe('IdentityRowHeadingLine headingInline', () => {
  it('places headingInline beside a truncating title without a separator', () => {
    render(
      <IdentityRowHeadingLine
        heading="An extraordinarily long equipment name that should truncate in narrow layouts"
        headingInline={<span data-testid="inline-slot">toggle</span>}
        recipe="entity-compact"
      />,
    )
    expect(screen.getByTestId('inline-slot')).toBeInTheDocument()
    expect(screen.getByTestId('inline-slot').closest('.gap-1')).not.toBeNull()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
  })
})

describe('IdentityRowHeadingLine entity-compact', () => {
  it('keeps the title at 14px and classification, dot, and end text at 12px', () => {
    render(
      <IdentityRowHeadingLine
        heading="Fire Bolt"
        classification="Spell"
        headingEnd="3"
        recipe="entity-compact"
      />,
    )

    expect(screen.getByText('Fire Bolt')).toHaveClass('ui-identity-row__title--md')
    expect(screen.getByText('Fire Bolt')).not.toHaveClass('ui-identity-row__title--sm')
    expect(screen.getByText('Spell')).toHaveClass('ui-identity-row__classification--sm')
    expect(screen.getByText('Spell')).not.toHaveClass('ui-identity-row__classification--md')
    expect(screen.getByText('3')).toHaveClass('text-style-caption')
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
