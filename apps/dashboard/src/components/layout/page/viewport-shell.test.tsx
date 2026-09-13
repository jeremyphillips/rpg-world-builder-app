import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { viewportShellClasses } from './page-scroll.variants'
import { ViewportShell } from './viewport-shell'

describe('ViewportShell', () => {
  it('is the route scroll boundary without a scroll-container attr', () => {
    const { container } = render(
      <ViewportShell>
        <p>Body</p>
      </ViewportShell>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass(...viewportShellClasses.split(/\s+/))
    expect(root).not.toHaveAttribute('data-scroll-container')
    expect(root).not.toHaveClass('overflow-y-auto')
  })
})
