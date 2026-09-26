import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from '@/features/content/lib/detail/page/content-image-presentation-defaults'

import { ContentMediaFallback, ContentMediaImage } from './content-media-image'

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

  it('uses thumbnail defaults for square frames without a crop', () => {
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

  it('honors normalized crop layout on builder card frames when a crop exists', () => {
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

  it('renders a 4:3 builder sheet hero frame with primary presentation defaults', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', sourceKind: 'system' }}
        alt="Fighter"
        frame="builderSheetHero"
      />,
    )

    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-[4/3]')
    expect(frame).toHaveClass('isolate')
    expect(frame).not.toHaveClass('bg-[var(--surface-current,var(--background))]')

    const img = container.querySelector('img')
    expect(img).toHaveStyle({
      objectFit: CONTENT_IMAGE_PRESENTATION_DEFAULTS.primary.objectFit,
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.primary.objectPosition,
    })
    expect(img).not.toHaveClass('mix-blend-multiply')
  })

  it('honors normalized crop layout on builder sheet hero frames', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          sourceKind: 'system',
          crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 },
        }}
        alt="Fighter"
        frame="builderSheetHero"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveStyle({ width: '200%', height: '200%' })
    expect(img?.style.objectPosition).toBe('')
  })

  it('renders a 4:2 builder frame with knockout backdrop and treatment blend classes', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          sourceKind: 'system',
          presentationTreatment: 'white-paper-knockout',
        }}
        alt="Fighter"
        frame="builderCard"
      />,
    )

    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-[4/2]')
    expect(frame).toHaveClass('bg-[var(--surface-current,var(--background))]')
    expect(frame).not.toHaveClass('isolate')
    expect(container.querySelector('img')).toHaveClass('mix-blend-multiply')
    expect(container.querySelector('img')).not.toHaveClass('dark:invert')
    expect(container.querySelector('img')).toHaveClass('object-cover')
  })

  it('renders semantic fallback in the same primary aspect frame as artwork', () => {
    const { container } = render(
      <ContentMediaFallback fallback="equipment" frame="primary" className="rounded-card" />,
    )

    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-[4/3]')
    expect(frame).toHaveClass('rounded-card')
    expect(frame).toHaveAttribute('data-content-media-fallback', 'equipment')
    expect(container.querySelector('svg')).toHaveClass('size-icon-glyph-xl')
  })

  it('does not apply knockout blend classes without presentation treatment metadata', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/upload.jpg', sourceKind: 'upload' }}
        alt="Upload"
        frame="builderCard"
      />,
    )

    expect(container.querySelector('img')).not.toHaveClass('mix-blend-multiply')
  })
})
