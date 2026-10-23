import { Icon } from './icon/icon'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('nested inline icon inheritance', () => {
  it('uses size-icon-inline under each typography owner without a glyph step', () => {
    const { container } = render(
      <div className="text-base">
        Base <Icon name="check" size="inline" className="size-icon-inline" />
        <span className="text-xs">
          Small <Icon name="check" size="inline" className="size-icon-inline" />
        </span>
      </div>,
    )

    const icons = [...container.querySelectorAll('svg')]
    expect(icons).toHaveLength(2)
    for (const icon of icons) {
      expect(icon).toHaveClass('size-icon-inline')
      expect(icon.getAttribute('class')).not.toMatch(/size-icon-glyph-/)
    }

    const small = screen.getByText('Small')
    expect(small).toHaveClass('text-xs')
    expect(small.parentElement).toHaveClass('text-base')
  })
})
