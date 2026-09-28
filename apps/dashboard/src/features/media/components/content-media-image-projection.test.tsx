import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import {
  deriveFrameCropWithinRoleCrop,
  resolveCharacterDisplayImagesByRole,
  resolveNormalizedCropImageLayout,
  type ContentMedia,
} from '@rpg/contracts'

import { CharacterListCard } from '@/features/character/components/character-list-card'
import { ContentMediaImage } from './content-media-image'
import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from '@/features/content/lib/detail/page/content-image-presentation-defaults'

const portraitCrop = { x: 0.2, y: 0.1, width: 0.25, height: 0.25 } as const
const primaryCrop = { x: 0, y: 0.05, width: 0.9, height: 0.675 } as const

function dualCropCharacterMedia(): ContentMedia {
  return {
    revision: 0,
    images: [{ id: 'shared-img', assetId: 'shared-asset' }],
    roles: {
      portrait: {
        source: { kind: 'upload', imageId: 'shared-img' },
        presentation: { mode: 'crop', crop: portraitCrop },
      },
      primary: {
        source: { kind: 'upload', imageId: 'shared-img' },
        presentation: { mode: 'crop', crop: primaryCrop },
      },
    },
  }
}

describe('content media image projection matrix', () => {
  const byRole = resolveCharacterDisplayImagesByRole({
    media: dualCropCharacterMedia(),
    resolveUploadSrc: () => '/shared.jpg',
  })

  it('applies portrait crop on square frames', () => {
    const { container } = render(
      <ContentMediaImage display={byRole.portrait!} alt="" frame="square" />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveClass('object-fill', 'object-left-top')
    expect(img).not.toHaveClass('object-cover')
    expect(img?.style.width).toBe(`${100 / portraitCrop.width}%`)
    expect(img?.style.objectPosition).toBe('')
  })

  it('applies primary crop on 4:3 primary frames', () => {
    const { container } = render(
      <ContentMediaImage display={byRole.primary!} alt="" frame="primary" />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveClass('object-fill', 'object-left-top')
    expect(img?.style.width).toBe(`${100 / primaryCrop.width}%`)
    expect(img?.style.objectPosition).toBe('')
  })

  it('uses cover presentation on builderCard frames without saved crops', () => {
    const { container } = render(
      <ContentMediaImage
        display={{ src: '/shared.jpg', role: 'primary', sourceKind: 'upload' }}
        alt=""
        frame="builderCard"
      />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveClass('object-cover')
    expect(img).not.toHaveClass('object-fill')
    expect(img?.style.width).toBe('')
    expect(img).toHaveStyle({
      objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectPosition,
    })
  })

  it('routes character list cards through builderCard 2:1 derived from primary crop', () => {
    const derivedCrop = deriveFrameCropWithinRoleCrop(primaryCrop, 4 / 3, 2)
    const derivedLayout = resolveNormalizedCropImageLayout(derivedCrop)

    const { container } = render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            id: 'char-1',
            name: 'Frug',
            summary: 'Human · Level 1 Fighter',
            displayImagesByRole: byRole,
          }}
          detailHref="/characters/char-1"
        />
      </MemoryRouter>,
    )

    expect(container.querySelector('.aspect-\\[4\\/2\\]')).toBeTruthy()
    const img = container.querySelector('img')
    expect(img).toHaveClass('object-fill')
    expect(img?.style.width).toBe(`${derivedLayout.widthPercent}%`)
  })
})
