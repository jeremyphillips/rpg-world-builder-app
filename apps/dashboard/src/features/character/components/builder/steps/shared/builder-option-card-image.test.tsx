import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from '@/features/content/lib/detail/page/content-image-presentation-defaults'

import { BuilderOptionCardImage } from './builder-option-card-image'

describe('BuilderOptionCardImage', () => {
  it('renders builder card presentation defaults', () => {
    const { container } = render(
      <BuilderOptionCardImage
        display={{ src: '/elf.jpeg', role: 'primary', sourceKind: 'system' }}
      />,
    )

    const img = container.querySelector('img')
    expect(img).toHaveClass('object-cover')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectPosition,
    })
  })

  it('applies white-paper knockout blend classes from presentation treatment metadata', () => {
    const { container } = render(
      <BuilderOptionCardImage
        display={{
          src: '/elf.jpeg',
          role: 'primary',
          sourceKind: 'system',
          presentationTreatment: 'white-paper-knockout',
        }}
      />,
    )

    expect(container.querySelector('img')).toHaveClass('mix-blend-multiply')
  })
})
