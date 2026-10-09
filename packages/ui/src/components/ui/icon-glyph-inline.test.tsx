import { render, screen } from '@testing-library/react'
import { Check } from 'lucide-react'
import { describe, expect, it } from 'vitest'

describe('nested inline icon inheritance', () => {
  it('uses size-icon-inline under each typography owner without a glyph step', () => {
    const { container } = render(
      <div className="text-base">
        Base <Check aria-hidden className="size-icon-inline" />
        <span className="text-xs">
          Small <Check aria-hidden className="size-icon-inline" />
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
