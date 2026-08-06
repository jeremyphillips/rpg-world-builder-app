import { TriangleAlert } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { SemanticText } from './semantic-text'

const TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const
const EMPHASES = ['low', 'medium', 'high'] as const

describe('SemanticText', () => {
  it.each(TONES)('renders %s tone as a span', (tone) => {
    render(<SemanticText tone={tone}>Label</SemanticText>)
    const el = screen.getByText('Label')
    expect(el.tagName).toBe('SPAN')
    const expectedToneClass = tone === 'info' ? 'text-semantic-info' : `text-semantic-${tone}`
    expect(el).toHaveClass(expectedToneClass)
  })

  it('uses info-muted for info low emphasis', () => {
    render(
      <SemanticText tone="info" emphasis="low">
        Standard gear
      </SemanticText>,
    )
    const el = screen.getByText('Standard gear')
    expect(el).toHaveClass('text-semantic-info-muted', 'font-normal')
    expect(el).not.toHaveClass('text-semantic-info')
  })

  it('keeps info token for medium and high emphasis', () => {
    const { rerender } = render(
      <SemanticText tone="info" emphasis="medium">
        Spellcasting focus
      </SemanticText>,
    )
    expect(screen.getByText('Spellcasting focus')).toHaveClass('text-semantic-info', 'font-medium')

    rerender(
      <SemanticText tone="info" emphasis="high">
        Essential
      </SemanticText>,
    )
    expect(screen.getByText('Essential')).toHaveClass('text-semantic-info', 'font-semibold')
  })

  it.each(EMPHASES)('applies %s emphasis via font weight', (emphasis) => {
    render(<SemanticText emphasis={emphasis}>Label</SemanticText>)
    const weightClass =
      emphasis === 'low' ? 'font-normal' : emphasis === 'medium' ? 'font-medium' : 'font-semibold'
    expect(screen.getByText('Label')).toHaveClass(weightClass)
  })

  it('wraps icons with leading-none and sizes descendant SVGs', () => {
    const { container } = render(
      <SemanticText icon={<TriangleAlert data-testid="icon" />} tone="warning">
        Warning
      </SemanticText>,
    )

    const iconWrapper = container.querySelector('[aria-hidden="true"]')
    expect(iconWrapper).toHaveClass('leading-none', '[&>svg]:size-icon-glyph-sm')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SemanticText tone="destructive" emphasis="high" icon={<TriangleAlert aria-hidden />}>
        Cannot afford
      </SemanticText>,
    )
    await expectNoAxeViolations(container)
  })
})
