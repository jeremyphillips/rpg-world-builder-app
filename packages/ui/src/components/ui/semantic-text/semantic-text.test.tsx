import { Icon } from '../icon/icon'
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
    expect(el).toHaveClass('ui-semantic-text', `ui-semantic-text--${tone}`)
  })

  it('uses info-muted for info low emphasis', () => {
    render(
      <SemanticText tone="info" emphasis="low">
        Standard gear
      </SemanticText>,
    )
    const el = screen.getByText('Standard gear')
    expect(el).toHaveClass('ui-semantic-text--info', 'ui-semantic-text--emphasis-low')
    expect(el).not.toHaveClass('ui-semantic-text--emphasis-medium')
  })

  it('keeps info token for medium and high emphasis', () => {
    const { rerender } = render(
      <SemanticText tone="info" emphasis="medium">
        Spellcasting focus
      </SemanticText>,
    )
    expect(screen.getByText('Spellcasting focus')).toHaveClass(
      'ui-semantic-text--info',
      'ui-semantic-text--emphasis-medium',
    )

    rerender(
      <SemanticText tone="info" emphasis="high">
        Essential
      </SemanticText>,
    )
    expect(screen.getByText('Essential')).toHaveClass(
      'ui-semantic-text--info',
      'ui-semantic-text--emphasis-high',
    )
  })

  it.each(EMPHASES)('applies %s emphasis via font weight', (emphasis) => {
    render(<SemanticText emphasis={emphasis}>Label</SemanticText>)
    const weightClass =
      emphasis === 'low'
        ? 'ui-semantic-text--emphasis-low'
        : emphasis === 'medium'
          ? 'ui-semantic-text--emphasis-medium'
          : 'ui-semantic-text--emphasis-high'
    expect(screen.getByText('Label')).toHaveClass(weightClass)
  })

  it('keeps a text-sm override on the element', () => {
    render(
      <SemanticText tone="success" className="text-sm">
        Updated
      </SemanticText>,
    )
    const el = screen.getByText('Updated')
    expect(el).toHaveClass('ui-semantic-text', 'text-sm')
    expect(el).not.toHaveClass('ui-semantic-text--sm')
  })

  it('wraps icons in the semantic icon slot', () => {
    const { container } = render(
      <SemanticText icon={<Icon name="triangle-alert" size="2xl" />} tone="warning">
        Warning
      </SemanticText>,
    )

    const root = screen.getByText('Warning')
    expect(root).toHaveClass('ui-semantic-text--with-icon')

    const iconWrapper = container.querySelector('[aria-hidden="true"]')
    expect(iconWrapper).toHaveClass('ui-semantic-text__icon')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SemanticText
        tone="destructive"
        emphasis="high"
        icon={<Icon name="triangle-alert" size="2xl" />}
      >
        Cannot afford
      </SemanticText>,
    )
    await expectNoAxeViolations(container)
  })
})
