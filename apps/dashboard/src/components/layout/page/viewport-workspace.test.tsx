import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { viewportWorkspaceClasses } from './viewport-workspace.variants'
import { ViewportWorkspace } from './viewport-workspace'

describe('ViewportWorkspace', () => {
  it('is a bounded workspace with explicit block size and overflow hidden', () => {
    const { container } = render(
      <ViewportWorkspace>
        <p>Body</p>
      </ViewportWorkspace>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass(...viewportWorkspaceClasses.split(/\s+/).filter(Boolean))
    expect(root).not.toHaveAttribute('data-scroll-container')
  })
})
