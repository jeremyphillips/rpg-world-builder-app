/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { DetailRowLeadingMedia } from '../detail-row-leading-media'

describe('DetailRowLeadingMedia', () => {
  it('publishes frame contract attributes for compact xs circle', () => {
    const { container } = render(
      <DetailRowLeadingMedia shape="circle" size="xs">
        <span>Child</span>
      </DetailRowLeadingMedia>,
    )

    const frame = container.querySelector('[data-detail-row-leading-media]')
    expect(frame).toHaveAttribute('data-size', 'xs')
    expect(frame).toHaveAttribute('data-shape', 'circle')
    expect(frame).toHaveClass('size-8', 'rounded-full', 'overflow-hidden', 'shrink-0')
  })

  it('bounds oversized image content to the established frame', () => {
    const { container } = render(
      <DetailRowLeadingMedia shape="box" size="xs">
        <img alt="Huge portrait" src="/huge.png" width={2400} height={2400} />
      </DetailRowLeadingMedia>,
    )

    const frame = container.querySelector('[data-detail-row-leading-media]')
    expect(frame).toHaveClass('size-8')
    const img = screen.getByRole('img', { name: 'Huge portrait' })
    expect(frame?.contains(img)).toBe(true)
    expect(frame?.querySelector('[class*="object-cover"]') ?? img.parentElement).toBeTruthy()
  })
})
