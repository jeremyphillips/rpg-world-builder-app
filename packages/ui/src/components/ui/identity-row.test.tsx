import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  identityRowClassificationVariants,
  identityRowHeadingVariants,
} from './identity-row.variants'
import { IdentityRow } from './identity-row.client'

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
    expect(supporting.className).toMatch(/\bleading-snug\b/)
    expect(supporting.className).not.toMatch(/\btruncate\b/)
  })

  it('truncates supporting copy by default', () => {
    render(<IdentityRow heading="Building" supporting="Secondary metadata line" size="md" />)

    const supporting = screen.getByText('Secondary metadata line')
    expect(supporting).toHaveClass('truncate')
  })

  it('omits supporting line when absent', () => {
    render(<IdentityRow heading="Only heading" size="md" />)

    expect(screen.getByText('Only heading')).toBeInTheDocument()
    expect(screen.queryByText('Secondary')).not.toBeInTheDocument()
  })

  it('uses text-xs heading at sm size', () => {
    render(<IdentityRow heading="Compact row" classification="Tag" size="sm" />)

    expect(screen.getByText('Compact row').className).toMatch(/\btext-xs\b/)
  })
})

describe('IdentityRow in ListResultItem shell', () => {
  it('preserves heading truncate with start and end slots in a narrow row', async () => {
    const { ListResultItem } = await import('./list-result-item.client')

    render(
      <div className="w-48">
        <ListResultItem
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
