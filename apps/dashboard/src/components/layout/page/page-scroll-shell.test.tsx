/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import {
  PAGE_SCROLL_CONTAINER_ATTR,
  PAGE_SCROLL_CONTAINER_VALUE,
  pageScrollFillWrapperClasses,
  pageScrollShellClasses,
  pageScrollStickyFooterClearanceClasses,
} from './page-scroll.variants'
import { PageScrollShell } from './page-scroll-shell'

describe('PageScrollShell', () => {
  it('is the route scrollport with a separate fill wrapper', () => {
    const { container } = render(
      <MemoryRouter>
        <PageScrollShell>
          <p>Body</p>
        </PageScrollShell>
      </MemoryRouter>,
    )

    const scrollport = container.firstElementChild
    expect(scrollport).toHaveAttribute(PAGE_SCROLL_CONTAINER_ATTR, PAGE_SCROLL_CONTAINER_VALUE)
    expect(scrollport).toHaveClass(...pageScrollShellClasses.split(/\s+/))
    expect(scrollport).toHaveClass(pageScrollStickyFooterClearanceClasses)
    expect(scrollport).not.toHaveClass(...pageScrollFillWrapperClasses.split(/\s+/))

    const fillWrapper = scrollport?.firstElementChild
    expect(fillWrapper).toHaveClass(...pageScrollFillWrapperClasses.split(/\s+/))
  })
})
