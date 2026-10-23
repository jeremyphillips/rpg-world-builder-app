/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { DetailRowLeadingMedia } from '../detail-row-leading-media'

describe('DetailRowLeadingMedia', () => {
  it('uses density-owned anatomy shell for default compact leading media', () => {
    const { container } = render(
      <div className="dash-entity-anatomy dash-entity-anatomy--compact">
        <DetailRowLeadingMedia shape="circle">
          <span>Child</span>
        </DetailRowLeadingMedia>
      </div>,
    )

    const frame = container.querySelector('[data-detail-row-leading-media]')
    expect(frame).toHaveAttribute('data-shape', 'circle')
    expect(frame).not.toHaveAttribute('data-size')
    expect(frame).toHaveClass('ui-anatomy-leading-media')
    expect(frame).not.toHaveClass('size-8')
  })

  it('bounds oversized image content to the established frame', () => {
    const { container } = render(
      <div className="dash-entity-anatomy dash-entity-anatomy--compact">
        <DetailRowLeadingMedia shape="box">
          <img alt="Huge portrait" src="/huge.png" width={2400} height={2400} />
        </DetailRowLeadingMedia>
      </div>,
    )

    const frame = container.querySelector('[data-detail-row-leading-media]')
    expect(frame).toHaveClass('ui-anatomy-leading-media')
    const img = screen.getByRole('img', { name: 'Huge portrait' })
    expect(frame?.contains(img)).toBe(true)
    expect(img.parentElement).toHaveClass('size-full')
  })

  it('supports fixed identity frame sizes for documented exceptions', () => {
    const { container } = render(
      <DetailRowLeadingMedia shape="box" size="xs">
        <span>Child</span>
      </DetailRowLeadingMedia>,
    )

    const frame = container.querySelector('[data-detail-row-leading-media]')
    expect(frame).toHaveAttribute('data-size', 'xs')
    expect(frame).toHaveClass('ui-identity-frame--xs')
  })
})
