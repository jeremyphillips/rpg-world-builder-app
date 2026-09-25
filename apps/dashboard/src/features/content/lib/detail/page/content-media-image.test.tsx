import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from './content-image-presentation-defaults'
import { ContentMediaImage } from './content-media-image'

describe('ContentMediaImage', () => {
  it('applies surface defaults when no crop is present', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', sourceKind: 'system' }}
        alt="Fighter"
        frame="builderCard"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveStyle({
      objectFit: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectFit,
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectPosition,
    })
  })

  it('uses thumbnail defaults for square frames', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', sourceKind: 'system' }}
        alt="Fighter"
        frame="square"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.thumbnail.objectPosition,
    })
  })

  it('honors normalized crop layout over object-position defaults', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          sourceKind: 'system',
          crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 },
        }}
        alt="Fighter"
        frame="builderCard"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveStyle({ width: '200%', height: '200%' })
    expect(img?.style.objectPosition).toBe('')
  })

  it('renders a 4:2 builder frame with knockout backdrop and blend classes', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', sourceKind: 'system' }}
        alt="Fighter"
        frame="builderCard"
      />,
    )

    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-[4/2]')
    expect(frame).toHaveClass('bg-[var(--surface-current,var(--background))]')
    expect(frame).not.toHaveClass('isolate')
    expect(container.querySelector('img')).toHaveClass('mix-blend-multiply')
    expect(container.querySelector('img')).toHaveClass('object-cover')
  })
})
