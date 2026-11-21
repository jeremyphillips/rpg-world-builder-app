import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NavigationChevron } from './navigation-chevron.client'

describe('NavigationChevron', () => {
  it('renders subdued navigation chrome with default md glyph', () => {
    const { container } = render(<NavigationChevron />)

    const host = container.firstElementChild
    expect(host).toHaveClass('ui-nav-chevron')
    expect(host).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('[data-icon="chevron-right"]')).toBeInTheDocument()
    expect(container.querySelector('.ui-icon--md')).toBeInTheDocument()
  })

  it('supports lg glyph for list-row density', () => {
    const { container } = render(<NavigationChevron size="lg" />)
    expect(container.querySelector('.ui-icon--lg')).toBeInTheDocument()
    expect(container.querySelector('.ui-icon--md')).not.toBeInTheDocument()
  })

  it('merges optional layout classes without replacing nav chrome', () => {
    const { container } = render(<NavigationChevron className="ui-destination-item__chevron" />)
    expect(container.firstElementChild).toHaveClass(
      'ui-nav-chevron',
      'ui-destination-item__chevron',
    )
  })
})
