import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FormStickyScrollBody } from './form-sticky-scroll-body.client'

describe('FormStickyScrollBody', () => {
  it('renders page-scroll content without the clip slot', () => {
    const { container } = render(
      <FormStickyScrollBody>
        <p>Character starting level</p>
      </FormStickyScrollBody>,
    )

    expect(screen.getByText('Character starting level')).toBeVisible()
    expect(container.querySelector('.form-scroll-body-container')).toBeNull()
    expect(container.querySelector('.overflow-y-auto')).toBeNull()
    expect(container.querySelector('.overflow-hidden')).toBeNull()
  })

  it('renders viewport-bound content inside the clip slot', () => {
    const { container } = render(
      <FormStickyScrollBody boundedScroll>
        <p>Tab panel fields</p>
      </FormStickyScrollBody>,
    )

    expect(screen.getByText('Tab panel fields')).toBeVisible()
    const clip = container.querySelector('.form-scroll-body-container')
    expect(clip).toHaveClass('overflow-hidden')
    expect(clip?.querySelector('.overflow-y-auto')).toBeTruthy()
    expect(clip?.querySelector('[data-visible="false"].bg-gradient-to-b')).toBeInTheDocument()
  })
})
