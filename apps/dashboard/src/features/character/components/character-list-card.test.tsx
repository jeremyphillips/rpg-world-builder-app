import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import {
  CHARACTER_LIST_CARD_HEADER_COPY_CLASS,
  CHARACTER_LIST_CARD_HEADER_COPY_TEST_ID,
  CharacterListCard,
} from './character-list-card'

const sampleCard = {
  id: 'char-1',
  name: 'Verna',
  summary: 'Dwarf · Level 1 Fighter',
} as const

describe('CharacterListCard', () => {
  const copyScaleCss = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../../../packages/ui/src/components/ui/copy-scale.css',
    ),
    'utf8',
  )
    .replace('@layer components {', '')
    .replace(/\n}\s*$/, '')
  const SURFACE_TEST_TOKENS = `:root { --spacing: 4px; --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-heading-card: 19px; --text-xs--line-height: --text-sm--line-height: 20px; --text-base--line-height: 24px; }`

  function resolvedAnatomyRowGap(element: Element | null): string {
    let node: Element | null = element
    while (node) {
      const specified = getComputedStyle(node).getPropertyValue('--ui-anatomy-row-gap').trim()
      const multiplier = specified.match(/\*\s*([\d.]+)\)/)?.[1]
      if (multiplier != null) {
        return `${4 * Number.parseFloat(multiplier)}px`
      }
      node = node.parentElement
    }
    return '4px'
  }

  it('groups header copy in a local anatomy-gap column without identity-row stack BEM', () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            name: 'Very Long Character Name That Should Truncate Beside The Badge',
            campaign: { id: 'camp-1', name: 'The Argent Road' },
          }}
          detailHref="/characters/char-1"
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.playedByYou}
          rosterStatus="inactive"
        />
      </MemoryRouter>,
    )

    const wrapper = container.querySelector(
      `[data-testid="${CHARACTER_LIST_CARD_HEADER_COPY_TEST_ID}"]`,
    )
    expect(wrapper).toHaveClass(...CHARACTER_LIST_CARD_HEADER_COPY_CLASS.split(' '))
    expect(wrapper?.querySelector('.ui-identity-row__stack')).toBeNull()
    expect(
      screen.getByRole('heading', {
        name: 'Very Long Character Name That Should Truncate Beside The Badge',
      }),
    ).toHaveClass('truncate')
    expect(screen.getByText('Dwarf · Level 1 Fighter')).toHaveClass('ui-identity-row__supporting')
    expect(screen.getByText(CHARACTER_CONTROLLER_DISPLAY.playedByYou)).toHaveClass(
      'ui-identity-row__supporting',
    )
    expect(screen.getByText('The Argent Road')).toBeInTheDocument()
  })

  describe('header copy anatomy row gap', () => {
    let styleEl: HTMLStyleElement

    beforeAll(() => {
      styleEl = document.createElement('style')
      styleEl.textContent = `${SURFACE_TEST_TOKENS}\n${copyScaleCss}`
      document.head.appendChild(styleEl)
    })

    afterAll(() => {
      styleEl.remove()
    })

    it('resolves gap from card density on the local copy column', () => {
      const { container: compactContainer } = render(
        <MemoryRouter>
          <CharacterListCard card={sampleCard} detailHref="/characters/char-1" density="compact" />
        </MemoryRouter>,
      )
      const compactWrapper = compactContainer.querySelector(
        `[data-testid="${CHARACTER_LIST_CARD_HEADER_COPY_TEST_ID}"]`,
      )
      expect(compactContainer.querySelector('.ui-card--compact')).not.toBeNull()
      expect(resolvedAnatomyRowGap(compactWrapper)).toBe('2px')
      expect(compactWrapper).not.toBeNull()

      const { container: comfortableContainer } = render(
        <MemoryRouter>
          <CharacterListCard
            card={sampleCard}
            detailHref="/characters/char-1"
            density="comfortable"
          />
        </MemoryRouter>,
      )
      const comfortableWrapper = comfortableContainer.querySelector(
        `[data-testid="${CHARACTER_LIST_CARD_HEADER_COPY_TEST_ID}"]`,
      )
      expect(comfortableContainer.querySelector('.ui-card--comfortable')).not.toBeNull()
      expect(resolvedAnatomyRowGap(comfortableWrapper)).toBe('4px')
      expect(comfortableWrapper).not.toBeNull()
    })
  })

  it('renders the card summary and view link', () => {
    render(
      <MemoryRouter>
        <CharacterListCard card={sampleCard} detailHref="/characters/char-1" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Verna', level: 3 })).toHaveClass(
      'ui-identity-row__title',
    )
    expect(
      screen.getByRole('heading', { name: 'Verna', level: 3 }).closest('.ui-card--spacious'),
    ).not.toBeNull()
    expect(screen.getByRole('link', { name: 'View' })).toHaveClass('ui-button--md')
    expect(screen.getByText('Dwarf · Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/characters/char-1')
  })

  it('renders optional campaign metadata', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            campaign: { id: 'camp-1', name: 'The Argent Road' },
          }}
          detailHref="/campaigns/camp-1/characters/char-1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('The Argent Road')).toBeInTheDocument()
  })

  it('renders optional roster status badge', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          rosterStatus="inactive"
        />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: 'Verna', level: 3 })
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(heading).not.toContainElement(screen.getByText('Inactive'))
    expect(screen.getByText('Inactive')).toHaveClass('ui-badge--md')
  })

  it('uses sm footer action and badge at comfortable density', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          density="comfortable"
          rosterStatus="inactive"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'View' })).toHaveClass('ui-button--sm')
    expect(screen.getByText('Inactive')).toHaveClass('ui-badge--sm')
  })

  it('uses sm footer action at compact density', () => {
    render(
      <MemoryRouter>
        <CharacterListCard card={sampleCard} detailHref="/characters/char-1" density="compact" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'View' })).toHaveClass('ui-button--sm')
  })

  it('hides campaign metadata when showCampaign is false', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            campaign: { id: 'camp-1', name: 'The Argent Road' },
          }}
          detailHref="/campaigns/camp-1/characters/char-1"
          showCampaign={false}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByText('The Argent Road')).not.toBeInTheDocument()
  })

  it('renders controller line inside the card header', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.playedByYou}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(CHARACTER_CONTROLLER_DISPLAY.playedByYou)).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.noPlayerAssigned}
          showCampaign={false}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })

  it('keeps card region insets around a full-bleed portrait', () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            name: 'Very Long Character Name That Should Truncate Beside The Badge',
            displayImagesByRole: {
              primary: {
                src: '/hero.png',
                role: 'primary',
                sourceKind: 'upload',
                crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 },
              },
            },
          }}
          detailHref="/characters/char-1"
          rosterStatus="inactive"
        />
      </MemoryRouter>,
    )

    expect(container.firstElementChild).toHaveClass('ui-card--media', 'ui-card--stretch')
    const header = container.querySelector('.ui-card__header')
    const footer = container.querySelector('.ui-card__footer')
    const media = container.querySelector('.ui-card__media')
    expect(header).toBeTruthy()
    expect(header?.className).not.toContain('px-5')
    expect(footer).toBeTruthy()
    expect(footer?.className).not.toContain('mt-auto')
    expect(footer?.className).not.toContain('px-5')
    expect(media?.querySelector('img')).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Very Long Character Name That Should Truncate Beside The Badge',
      }),
    ).toHaveClass('truncate')
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/characters/char-1')
  })
})
