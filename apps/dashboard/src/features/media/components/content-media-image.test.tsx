import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { deriveFrameCropWithinRoleCrop, resolveNormalizedCropImageLayout } from '@rpg/contracts'

import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from '@/features/content/lib/detail/page/content-image-presentation-defaults'

import { ContentMediaFallback, ContentMediaImage } from './content-media-image'

const systemPrimary = {
  src: '/fighter.jpeg',
  role: 'primary' as const,
  sourceKind: 'system' as const,
}

describe('ContentMediaImage', () => {
  it('applies surface defaults when no crop is present', () => {
    const { container } = render(
      <ContentMediaImage display={systemPrimary} alt="Fighter" frame="builderCard" />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-cover')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectPosition,
    })
  })

  it('uses thumbnail defaults for square frames without a crop', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', role: 'portrait', sourceKind: 'system' }}
        alt="Fighter"
        frame="square"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.thumbnail.objectPosition,
    })
  })

  it('honors normalized crop layout on square frames when portrait role matches', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          role: 'portrait',
          sourceKind: 'system',
          crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 },
        }}
        alt="Fighter"
        frame="square"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-fill', 'object-left-top')
    expect(img).not.toHaveClass('object-cover')
    expect(img).toHaveStyle({ width: '200%', height: '200%' })
    expect(img?.style.objectPosition).toBe('')
  })

  it('renders a 4:3 builder sheet hero frame with primary presentation defaults', () => {
    const { container } = render(
      <ContentMediaImage display={systemPrimary} alt="Fighter" frame="builderSheetHero" />,
    )

    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-[4/3]')
    expect(frame).toHaveClass('isolate')
    expect(frame).not.toHaveClass('bg-[var(--surface-current,var(--background))]')

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-cover')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.primary.objectPosition,
    })
    expect(img).not.toHaveClass('mix-blend-multiply')
  })

  it('honors normalized crop layout on builder sheet hero frames', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          role: 'primary',
          sourceKind: 'system',
          crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 },
        }}
        alt="Fighter"
        frame="builderSheetHero"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-fill')
    expect(img).toHaveStyle({ width: '200%', height: '200%' })
    expect(img?.style.objectPosition).toBe('')
  })

  it('prefers focal point over surface defaults when crop is absent', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          role: 'primary',
          sourceKind: 'upload',
          focalPoint: { x: 0.25, y: 0.75 },
        }}
        alt="Fighter"
        frame="primary"
      />,
    )

    expect(container.querySelector('img')).toHaveStyle({ objectPosition: '25% 75%' })
  })

  it('renders a 4:2 builder frame with knockout backdrop and treatment blend classes', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/fighter.jpeg',
          role: 'primary',
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

  it('uses contain presentation for emblem hero frames without a crop', () => {
    const { container } = render(
      <ContentMediaImage
        display={{
          src: '/assets/system/srd-cc-5.2.1/spell-schools/emblem/evocation.png',
          role: 'emblem',
          sourceKind: 'system',
          presentationTreatment: 'mono-glyph-invert',
        }}
        alt="Evocation"
        frame="emblemHero"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-contain')
    expect(img?.style.objectPosition).toBe('')
  })

  it('does not apply knockout blend classes without presentation treatment metadata', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/upload.jpg', role: 'primary', sourceKind: 'upload' }}
        alt="Upload"
        frame="builderCard"
      />,
    )

    expect(container.querySelector('img')).not.toHaveClass('mix-blend-multiply')
  })

  const sharedPrimaryCrop = { x: 0, y: 0.1, width: 0.9, height: 0.675 } as const
  const builderCardDerivedCrop = deriveFrameCropWithinRoleCrop(sharedPrimaryCrop, 4 / 3, 2)
  const builderCardDerivedLayout = resolveNormalizedCropImageLayout(builderCardDerivedCrop)

  it('uses cover defaults for untouched primary on builderCard', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', role: 'primary', sourceKind: 'system' }}
        alt="Fighter"
        frame="builderCard"
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-cover')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectPosition,
    })
  })

  it('derives the same 2:1 window for system and upload primary crops on builderCard', () => {
    const displays = [
      {
        src: '/fighter.jpeg',
        role: 'primary' as const,
        sourceKind: 'system' as const,
        crop: sharedPrimaryCrop,
      },
      {
        src: '/upload.jpg',
        role: 'primary' as const,
        sourceKind: 'upload' as const,
        crop: sharedPrimaryCrop,
      },
    ]

    for (const display of displays) {
      const { container } = render(
        <ContentMediaImage display={display} alt="Art" frame="builderCard" />,
      )
      const img = container.querySelector('img')
      expect(img).toHaveClass('object-fill')
      expect(img).toHaveStyle({
        width: `${builderCardDerivedLayout.widthPercent}%`,
        height: `${builderCardDerivedLayout.heightPercent}%`,
      })
    }
  })
})
