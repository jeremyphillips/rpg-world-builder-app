import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from './icon'
import { ICON_GLYPHS, type IconName } from './icon-glyphs'

const ICON_NAMES = Object.keys(ICON_GLYPHS) as IconName[]

describe('Icon', () => {
  it('registers each glyph once', () => {
    expect(new Set(Object.values(ICON_GLYPHS)).size).toBe(ICON_NAMES.length)
    expect(ICON_NAMES).toHaveLength(113)
  })

  it('renders every glyph as one decorative svg', () => {
    for (const name of ICON_NAMES) {
      const { container, unmount } = render(<Icon name={name} size="md" />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs, name).toHaveLength(1)
      const svg = svgs[0]
      expect(svg, name).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg, name).toHaveAttribute('fill', 'none')
      expect(svg, name).toHaveAttribute('stroke', 'currentColor')
      expect(svg, name).toHaveAttribute('aria-hidden', 'true')
      expect(svg, name).toHaveAttribute('data-icon', name)
      expect(svg, name).toHaveClass('ui-icon', 'ui-icon--md')

      expect(svg, name).toHaveAttribute('width', '24')
      expect(svg, name).toHaveAttribute('height', '24')

      // Inner width/height are viewBox geometry (for example calendar-days rects), not the CSS box.
      for (const node of svg?.querySelectorAll('*') ?? []) {
        expect(node.getAttribute('stroke-width'), name).toBeNull()
        const stroke = node.getAttribute('stroke')
        const fill = node.getAttribute('fill')
        if (stroke) expect(stroke, name).toBe('currentColor')
        if (fill && fill !== 'none') expect(fill, name).toBe('currentColor')
      }
      unmount()
    }
  })

  it('draws exclamation from the two visible circle-alert lines', () => {
    const { container } = render(<Icon name="exclamation" size="sm" />)
    const svg = container.querySelector('svg')
    expect(svg?.querySelector('circle')).toBeNull()
    const lines = svg?.querySelectorAll('line')
    expect(lines).toHaveLength(2)
    expect(lines?.[0]).toHaveAttribute('y1', '8')
    expect(lines?.[0]).toHaveAttribute('y2', '12')
    expect(lines?.[1]).toHaveAttribute('y1', '16')
    expect(lines?.[1]).toHaveAttribute('x2', '12.01')
  })
})
