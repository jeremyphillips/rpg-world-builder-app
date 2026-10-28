import { Icon } from '../icon/icon'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import { Text } from '../text'
import { SemanticText } from './semantic-text'

const TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const
const EMPHASES = ['low', 'medium', 'high'] as const

const INHERITANCE_TEST_CSS = `
  :root {
    --text-fine-xs: 10px;
    --text-fine-xs--line-height: 14px;
    --text-xs: 12px;
    --text-xs--line-height: 16px;
    --text-sm: 14px;
    --text-sm--line-height: 20px;
    --font-weight-normal: 400;
    --muted-foreground: #666666;
    --icon-glyph-xs: 10px;
    --icon-glyph-sm: 12px;
  }
  .text-style-micro {
    font-size: 10px;
    line-height: 14px;
    --icon-inline: 10px;
  }
  .text-style-caption {
    font-size: 12px;
    line-height: 16px;
    --icon-inline: 12px;
  }
  .text-style-supporting {
    font-size: 14px;
    line-height: 20px;
    --icon-inline: 12px;
  }
  .text-style-field-hint-compact {
    font-size: 12px;
    line-height: 16px;
  }
`

function installInheritanceStyles(): HTMLStyleElement {
  const style = document.createElement('style')
  style.setAttribute('data-test', 'semantic-text-inheritance')
  style.textContent = INHERITANCE_TEST_CSS
  document.head.appendChild(style)
  return style
}

function px(value: string): number {
  return Number.parseFloat(value)
}

describe('SemanticText', () => {
  it.each(TONES)('renders %s tone as a span', (tone) => {
    render(
      <Text as="span" variant="caption">
        <SemanticText tone={tone}>Label</SemanticText>
      </Text>,
    )
    const el = screen.getByText('Label')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('ui-semantic-text', `ui-semantic-text--${tone}`)
  })

  it('uses info-muted for info low emphasis', () => {
    render(
      <Text as="span" variant="caption">
        <SemanticText tone="info" emphasis="low">
          Standard gear
        </SemanticText>
      </Text>,
    )
    const el = screen.getByText('Standard gear')
    expect(el).toHaveClass('ui-semantic-text--info', 'ui-semantic-text--emphasis-low')
    expect(el).not.toHaveClass('ui-semantic-text--emphasis-medium')
  })

  it('keeps info token for medium and high emphasis', () => {
    const { rerender } = render(
      <Text as="span" variant="caption">
        <SemanticText tone="info" emphasis="medium">
          Spellcasting focus
        </SemanticText>
      </Text>,
    )
    expect(screen.getByText('Spellcasting focus')).toHaveClass(
      'ui-semantic-text--info',
      'ui-semantic-text--emphasis-medium',
    )

    rerender(
      <Text as="span" variant="caption">
        <SemanticText tone="info" emphasis="high">
          Essential
        </SemanticText>
      </Text>,
    )
    expect(screen.getByText('Essential')).toHaveClass(
      'ui-semantic-text--info',
      'ui-semantic-text--emphasis-high',
    )
  })

  it.each(EMPHASES)('applies %s emphasis via font weight', (emphasis) => {
    render(
      <Text as="span" variant="caption">
        <SemanticText emphasis={emphasis}>Label</SemanticText>
      </Text>,
    )
    const weightClass =
      emphasis === 'low'
        ? 'ui-semantic-text--emphasis-low'
        : emphasis === 'medium'
          ? 'ui-semantic-text--emphasis-medium'
          : 'ui-semantic-text--emphasis-high'
    expect(screen.getByText('Label')).toHaveClass(weightClass)
  })

  it('wraps icons in the semantic icon slot', () => {
    const { container } = render(
      <Text as="span" variant="caption">
        <SemanticText icon={<Icon name="triangle-alert" size="2xl" />} tone="warning">
          Warning
        </SemanticText>
      </Text>,
    )

    const root = screen.getByText('Warning')
    expect(root).toHaveClass('ui-semantic-text--with-icon')

    const iconWrapper = container.querySelector('[aria-hidden="true"]')
    expect(iconWrapper).toHaveClass('ui-semantic-text__icon')
    expect(container.querySelector('svg[data-icon="triangle-alert"]')).toBeInTheDocument()
  })

  describe('typography inheritance', () => {
    let styleEl: HTMLStyleElement | undefined

    afterEach(() => {
      styleEl?.remove()
      styleEl = undefined
    })

    it.each([
      ['caption', 'text-style-caption', 12, 16],
      ['supporting', 'text-style-supporting', 14, 20],
      ['micro', 'text-style-micro', 10, 14],
    ] as const)(
      'inherits %s owner metrics on nested SemanticText',
      (variant, utilityClass, fontPx, linePx) => {
        styleEl = installInheritanceStyles()
        render(
          <Text as="span" variant={variant} data-testid="owner">
            <SemanticText tone="neutral" emphasis="low">
              Status
            </SemanticText>
          </Text>,
        )
        const owner = screen.getByTestId('owner')
        expect(owner).toHaveClass(utilityClass)
        expect(px(getComputedStyle(owner).fontSize)).toBe(fontPx)
        expect(px(getComputedStyle(owner).lineHeight)).toBe(linePx)
      },
    )

    it('inherits scale from an independent text-style-field-hint-compact parent', () => {
      styleEl = installInheritanceStyles()
      render(
        <div className="text-style-field-hint-compact" data-testid="owner">
          <SemanticText tone="neutral" emphasis="low">
            Hint status
          </SemanticText>
        </div>,
      )
      expect(px(getComputedStyle(screen.getByTestId('owner')).fontSize)).toBe(12)
      expect(px(getComputedStyle(screen.getByTestId('owner')).lineHeight)).toBe(16)
    })
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <Text as="span" variant="caption">
        <SemanticText
          tone="destructive"
          emphasis="high"
          icon={<Icon name="triangle-alert" size="2xl" />}
        >
          Cannot afford
        </SemanticText>
      </Text>,
    )
    await expectNoAxeViolations(container)
  })
})
