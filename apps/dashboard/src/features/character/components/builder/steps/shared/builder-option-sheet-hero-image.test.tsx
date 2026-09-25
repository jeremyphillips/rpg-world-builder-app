import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from '@/features/content/lib/detail/page/content-image-presentation-defaults'

import { BuilderOptionSheetHeroImage } from './builder-option-sheet-hero-image'

describe('BuilderOptionSheetHeroImage', () => {
  it('renders builder sheet hero presentation defaults', () => {
    const { container } = render(
      <BuilderOptionSheetHeroImage display={{ src: '/elf.jpeg', sourceKind: 'system' }} />,
    )

    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-[4/3]')

    const img = container.querySelector('img')
    expect(img).toHaveStyle({
      objectFit: CONTENT_IMAGE_PRESENTATION_DEFAULTS.primary.objectFit,
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.primary.objectPosition,
    })
  })
})
