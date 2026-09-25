import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { CampaignDisplayName } from '@/features/campaign/components/campaign-display-name'
import { CampaignDisplayNameList } from '@/features/campaign/components/campaign-display-name-list'
import { CharacterListCard } from '@/features/character/components/character-list-card'
import { ContentPreviewRailMedia } from '@/features/content/lib/forms/preview/content-preview-rail-media'
import { CONTENT_IMAGE_PRESENTATION_DEFAULTS } from '@/features/content/lib/detail/page/content-image-presentation-defaults'
import { User } from 'lucide-react'
import { IdentityFrame } from '@rpg/ui'

import { ContentMediaImage } from './content-media-image'

const PRIMARY_CROP = { x: 0.1, y: 0.2, width: 0.5, height: 0.5 } as const

describe('card image instance matrix', () => {
  it.each([
    {
      name: 'character list card stacked bleed',
      render: () => (
        <CharacterListCard
          card={{
            id: 'char-1',
            name: 'Astra',
            summary: 'Level 3 Fighter',
            displayImage: { src: '/hero.png', sourceKind: 'upload', crop: PRIMARY_CROP },
          }}
          detailHref="/characters/char-1"
        />
      ),
      assert: (container: HTMLElement) => {
        expect(container.querySelector('.aspect-\\[4\\/2\\]')).toBeTruthy()
        expect(container.querySelector('img')?.style.width).toBe('200%')
      },
    },
    {
      name: 'species radio card stacked bleed',
      render: () => (
        <ContentMediaImage
          display={{ src: '/species.png', sourceKind: 'system' }}
          alt=""
          frame="builderCard"
        />
      ),
      assert: (container: HTMLElement) => {
        expect(container.querySelector('.aspect-\\[4\\/2\\]')).toBeTruthy()
        expect(container.querySelector('img')).toHaveStyle({
          objectPosition: CONTENT_IMAGE_PRESENTATION_DEFAULTS.builderCard.objectPosition,
        })
      },
    },
    {
      name: 'catalog table inset box xs',
      render: () => (
        <ContentMediaImage
          display={{ src: '/species.png', sourceKind: 'system', crop: PRIMARY_CROP }}
          alt=""
          frame="square"
        />
      ),
      assert: (container: HTMLElement) => {
        expect(container.firstElementChild).toHaveClass('size-8')
        expect(container.querySelector('img')?.style.width).toBe('200%')
      },
    },
    {
      name: 'single campaign inline emblem mark',
      render: () => (
        <CampaignDisplayName
          display={{ id: 'camp-1', name: 'Road', imageUrl: '/emblem.png' }}
          surface="topbar"
        />
      ),
      assert: (container: HTMLElement) => {
        const frame = container.querySelector('.size-5')
        expect(frame).toBeTruthy()
        expect(container.querySelector('img')).toHaveClass('object-contain')
      },
    },
    {
      name: 'campaign name list generic castle for multiple campaigns',
      render: () => (
        <CampaignDisplayNameList
          displays={[
            { id: 'camp-1', name: 'One', imageUrl: '/emblem.png' },
            { id: 'camp-2', name: 'Two', imageUrl: null },
          ]}
          getHref={(display) => `/campaigns/${display.id}`}
        />
      ),
      assert: (container: HTMLElement) => {
        expect(container.querySelector('img')).toBeNull()
        expect(container.querySelector('svg')).toBeTruthy()
      },
    },
    {
      name: 'content form preview rail inset sm',
      render: () => (
        <ContentPreviewRailMedia
          displayImage={{ src: '/spell.png', sourceKind: 'upload', crop: PRIMARY_CROP }}
          fallbackIcon={<User aria-hidden />}
        />
      ),
      assert: (container: HTMLElement) => {
        expect(container.firstElementChild).toHaveClass('size-10')
        expect(container.querySelector('img')?.style.width).toBe('200%')
      },
    },
    {
      name: 'character builder preview rail fallback user icon',
      render: () => <ContentPreviewRailMedia fallbackIcon={<User aria-hidden />} />,
      assert: (container: HTMLElement) => {
        expect(container.firstElementChild).toHaveClass('size-10')
        expect(container.querySelector('img')).toBeNull()
      },
    },
    {
      name: 'inline mark identity frame',
      render: () => (
        <IdentityFrame
          src="/emblem.png"
          alt=""
          shape="box"
          size="inline"
          fit="contain"
          fallback={<User aria-hidden />}
        />
      ),
      assert: (container: HTMLElement) => {
        expect(container.firstElementChild).toHaveClass('size-5', 'rounded-md')
      },
    },
  ])('$name', ({ render: renderCase, assert }) => {
    const { container } = render(<MemoryRouter>{renderCase()}</MemoryRouter>)
    assert(container)
  })
})
