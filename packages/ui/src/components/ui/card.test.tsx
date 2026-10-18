import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card'
import {
  UI_CARD_CONTENT_CLASS,
  UI_CARD_DESCRIPTION_CLASS,
  UI_CARD_FOOTER_CLASS,
  UI_CARD_HEADER_CLASS,
  UI_CARD_NAV_CHEVRON_CLASS,
  UI_CARD_TITLE_CLASS,
} from './card.variants'

const SPACING_PX = 4

/**
 * Flat region rules for jsdom (full card.css uses nesting and @layer).
 * Literal px values — jsdom does not resolve var() in getComputedStyle.
 */
const CARD_REGION_TEST_CSS = `
  .ui-card.ui-card--compact .ui-card__header {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 16px;
    padding-right: 16px;
  }
  .ui-card.ui-card--compact .ui-card__content {
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 8px;
    padding-top: 8px;
  }
  .ui-card.ui-card--compact:has(.ui-card__header) .ui-card__content {
    padding-top: 0;
  }
  .ui-card.ui-card--compact .ui-card__footer {
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 8px;
    padding-top: 8px;
  }
  .ui-card.ui-card--compact:has(.ui-card__header) .ui-card__footer,
  .ui-card.ui-card--compact:has(.ui-card__content) .ui-card__footer {
    padding-top: 0;
  }
  .ui-card.ui-card--comfortable .ui-card__header {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .ui-card.ui-card--comfortable .ui-card__content {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 12px;
    padding-top: 12px;
  }
  .ui-card.ui-card--comfortable:has(.ui-card__header) .ui-card__content {
    padding-top: 0;
  }
  .ui-card.ui-card--comfortable .ui-card__footer {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 12px;
    padding-top: 12px;
  }
  .ui-card.ui-card--comfortable:has(.ui-card__header) .ui-card__footer,
  .ui-card.ui-card--comfortable:has(.ui-card__content) .ui-card__footer {
    padding-top: 0;
  }
  .ui-card.ui-card--spacious .ui-card__header {
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 24px;
    padding-right: 24px;
  }
  .ui-card.ui-card--compact .ui-card__title {
    font-size: 14px;
  }
  .ui-card.ui-card--compact .ui-card__description {
    font-size: 12px;
  }
  .ui-card.ui-card--comfortable .ui-card__title {
    font-size: 16px;
  }
  .ui-card.ui-card--comfortable .ui-card__description {
    font-size: 14px;
  }
  .ui-card.ui-card--spacious .ui-card__title {
    font-size: 19px;
  }
  .ui-card.ui-card--spacious .ui-card__description {
    font-size: 14px;
  }
`

function queryCardRegion(container: HTMLElement, className: string): Element {
  const match = container.getElementsByClassName(className)[0]
  if (!match) {
    throw new Error(`Missing region .${className}`)
  }
  return match
}

const INSET = {
  compact: { block: SPACING_PX * 2, inline: SPACING_PX * 4 },
  comfortable: { block: SPACING_PX * 3, inline: SPACING_PX * 5 },
} as const

function injectCardStyles(): HTMLStyleElement {
  const style = document.createElement('style')
  style.setAttribute('data-test', 'card-css')
  style.textContent = CARD_REGION_TEST_CSS
  document.head.appendChild(style)
  return style
}

function px(value: string): number {
  return Number.parseFloat(value)
}

function regionPadding(element: Element): {
  blockStart: number
  blockEnd: number
  inlineStart: number
  inlineEnd: number
} {
  const style = getComputedStyle(element)
  return {
    blockStart: px(style.paddingTop),
    blockEnd: px(style.paddingBottom),
    inlineStart: px(style.paddingLeft),
    inlineEnd: px(style.paddingRight),
  }
}

function expectInset(
  element: Element,
  density: keyof typeof INSET,
  edges: Partial<Record<'top' | 'bottom' | 'inline', number>>,
) {
  const pad = regionPadding(element)
  const ladder = INSET[density]
  if (edges.top != null) {
    expect(pad.blockStart).toBe(edges.top)
  }
  if (edges.bottom != null) {
    expect(pad.blockEnd).toBe(edges.bottom)
  }
  if (edges.inline != null) {
    expect(pad.inlineStart).toBe(edges.inline)
    expect(pad.inlineEnd).toBe(edges.inline)
  } else if (edges.inline === undefined && (edges.top != null || edges.bottom != null)) {
    expect(pad.inlineStart).toBe(ladder.inline)
    expect(pad.inlineEnd).toBe(ladder.inline)
  }
}

describe('Card region inset', () => {
  let styleEl: HTMLStyleElement

  beforeAll(() => {
    styleEl = injectCardStyles()
  })

  afterAll(() => {
    styleEl.remove()
  })

  it.each([
    ['compact', 'compact' as const],
    ['comfortable', 'comfortable' as const],
  ])('applies ladder padding for header-only (%s)', (_label, density) => {
    const { container } = render(
      <Card density={density} header={{ title: 'Title', description: 'Details' }} />,
    )
    const header = queryCardRegion(container, UI_CARD_HEADER_CLASS)
    expectInset(header, density, {
      top: INSET[density].block,
      bottom: INSET[density].block,
      inline: INSET[density].inline,
    })
  })

  it.each([
    ['compact', 'compact' as const],
    ['comfortable', 'comfortable' as const],
  ])('applies ladder padding for body-only (%s)', (_label, density) => {
    const { container } = render(
      <Card density={density}>
        <CardContent>Body</CardContent>
      </Card>,
    )
    const content = queryCardRegion(container, UI_CARD_CONTENT_CLASS)
    expectInset(content, density, {
      top: INSET[density].block,
      bottom: INSET[density].block,
      inline: INSET[density].inline,
    })
  })

  it.each([
    ['compact', 'compact' as const],
    ['comfortable', 'comfortable' as const],
  ])('applies ladder padding for footer-only (%s)', (_label, density) => {
    const { container } = render(
      <Card density={density}>
        <CardFooter>Action</CardFooter>
      </Card>,
    )
    const footer = queryCardRegion(container, UI_CARD_FOOTER_CLASS)
    expectInset(footer, density, {
      top: INSET[density].block,
      bottom: INSET[density].block,
      inline: INSET[density].inline,
    })
  })

  it.each([
    ['compact', 'compact' as const],
    ['comfortable', 'comfortable' as const],
  ])('avoids double vertical inset between header and body (%s)', (_label, density) => {
    const { container } = render(
      <Card
        density={density}
        header={{ title: 'Title' }}
        footer={<button type="button">Go</button>}
      >
        <p>Body</p>
      </Card>,
    )
    const header = queryCardRegion(container, UI_CARD_HEADER_CLASS)
    const content = queryCardRegion(container, UI_CARD_CONTENT_CLASS)
    expectInset(header, density, { bottom: INSET[density].block })
    expectInset(content, density, { top: 0, bottom: INSET[density].block })
    expect(regionPadding(header).blockStart + regionPadding(content).blockEnd).toBe(
      INSET[density].block * 2,
    )
  })

  it.each([
    ['compact', 'compact' as const],
    ['comfortable', 'comfortable' as const],
  ])('applies section rhythm for header, body, and footer (%s)', (_label, density) => {
    const { container } = render(
      <Card
        density={density}
        header={{ title: 'Title', description: 'Details' }}
        footer={<button type="button">Done</button>}
      >
        <p>Body</p>
      </Card>,
    )
    const header = queryCardRegion(container, UI_CARD_HEADER_CLASS)
    const content = queryCardRegion(container, UI_CARD_CONTENT_CLASS)
    const footer = queryCardRegion(container, UI_CARD_FOOTER_CLASS)
    expectInset(header, density, { top: INSET[density].block, bottom: INSET[density].block })
    expectInset(content, density, { top: 0, bottom: INSET[density].block })
    expectInset(footer, density, { top: 0, bottom: INSET[density].block })
  })

  it.each([
    ['compact', 'compact' as const],
    ['comfortable', 'comfortable' as const],
  ])('avoids double vertical inset between header and footer (%s)', (_label, density) => {
    const { container } = render(
      <Card
        density={density}
        header={{ title: 'Title' }}
        footer={<button type="button">Go</button>}
      />,
    )
    const header = queryCardRegion(container, UI_CARD_HEADER_CLASS)
    const footer = queryCardRegion(container, UI_CARD_FOOTER_CLASS)
    expectInset(header, density, { bottom: INSET[density].block })
    expectInset(footer, density, { top: 0, bottom: INSET[density].block })
  })

  it('renders declarative header with shell-driven title and description classes', () => {
    render(<Card header={{ title: 'Hub tile', description: 'Supporting copy' }} />)
    const title = screen.getByRole('heading', { level: 3, name: 'Hub tile' })
    expect(title).toHaveClass(UI_CARD_TITLE_CLASS)
    expect(title).not.toHaveClass('heading-style-card', 'text-style-small')
    const description = screen.getByText('Supporting copy')
    expect(description).toHaveClass(UI_CARD_DESCRIPTION_CLASS)
    expect(description).not.toHaveClass('text-style-small')
  })

  it.each([
    ['compact', 'compact' as const, 14, 12],
    ['comfortable', 'comfortable' as const, 16, 14],
    ['spacious', 'spacious' as const, 19, 14],
  ])('applies generic header typography pairs (%s)', (_label, density, titlePx, descriptionPx) => {
    const { container } = render(
      <Card density={density} header={{ title: 'Title', description: 'Description' }} />,
    )
    const title = queryCardRegion(container, UI_CARD_TITLE_CLASS)
    const description = queryCardRegion(container, UI_CARD_DESCRIPTION_CLASS)
    expect(px(getComputedStyle(title).fontSize)).toBe(titlePx)
    expect(px(getComputedStyle(description).fontSize)).toBe(descriptionPx)
  })

  it('omits empty regions in declarative layout', () => {
    const { container } = render(<Card header={{ title: 'Only header' }} />)
    expect(container.getElementsByClassName(UI_CARD_CONTENT_CLASS)).toHaveLength(0)
    expect(container.getElementsByClassName(UI_CARD_FOOTER_CLASS)).toHaveLength(0)
  })

  it('pins footer when stretch is enabled', () => {
    const { container } = render(
      <Card stretch header={{ title: 'Stretch' }} footer={<span>Actions</span>} />,
    )
    expect(container.firstElementChild).toHaveClass('flex', 'h-full', 'flex-col')
    expect(queryCardRegion(container, UI_CARD_FOOTER_CLASS)).toHaveClass('mt-auto')
  })

  it('wraps header and body in separate regions when footer is absent', () => {
    const { container } = render(
      <Card density="compact" header={{ title: 'Title', description: 'Details' }}>
        <p>Metadata line</p>
      </Card>,
    )
    expect(container.getElementsByClassName(UI_CARD_HEADER_CLASS)).toHaveLength(1)
    const content = queryCardRegion(container, UI_CARD_CONTENT_CLASS)
    expect(content).toHaveTextContent('Metadata line')
    expectInset(content, 'compact', { top: 0, bottom: INSET.compact.block })
  })
})

describe('Card navigable link', () => {
  let styleEl: HTMLStyleElement

  beforeAll(() => {
    styleEl = injectCardStyles()
  })

  afterAll(() => {
    styleEl.remove()
  })

  it('renders static card without link or chevron', () => {
    const { container } = render(<Card header={{ title: 'Static' }} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container.getElementsByClassName(UI_CARD_NAV_CHEVRON_CLASS)).toHaveLength(0)
  })

  it('renders one interactive link with default navigation chevron', () => {
    const { container } = render(
      <Card
        link={<a href="/dest">Navigate</a>}
        header={{ title: 'Category', description: 'Details' }}
      >
        <span>2 terms</span>
      </Card>,
    )
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/dest')
    expect(links[0]).toHaveClass('ui-card--interactive')
    expect(container.getElementsByClassName(UI_CARD_NAV_CHEVRON_CLASS)).toHaveLength(1)
  })

  it('hides navigation chevron when showNavigationChevron is false', () => {
    const { container } = render(
      <Card
        link={<a href="/dest">Navigate</a>}
        showNavigationChevron={false}
        header={{ title: 'Category' }}
      />,
    )
    expect(container.getElementsByClassName(UI_CARD_NAV_CHEVRON_CLASS)).toHaveLength(0)
  })

  it('applies focus ring classes on navigable root', () => {
    render(<Card link={<a href="/dest">Navigate</a>} header={{ title: 'Category' }} />)
    expect(screen.getByRole('link')).toHaveClass('ui-focus-ring')
  })

  it('does not duplicate cursor styling on navigable links', () => {
    render(<Card link={<a href="/dest">Navigate</a>} header={{ title: 'Category' }} />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('ui-card--interactive')
    expect(link.className).not.toContain('cursor-pointer')
  })

  it('activates link on Enter when focused', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault()
    })
    render(
      <Card
        link={
          <a href="/dest" onClick={onClick}>
            Navigate
          </a>
        }
        header={{ title: 'Category' }}
      />,
    )
    const link = screen.getByRole('link')
    link.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalled()
  })
})

describe('Card compound escape hatch', () => {
  let styleEl: HTMLStyleElement

  beforeAll(() => {
    styleEl = injectCardStyles()
  })

  afterAll(() => {
    styleEl.remove()
  })

  it('emits region classes from compound parts', () => {
    const { container: headerOnly } = render(<CardHeader>Header</CardHeader>)
    expect(headerOnly.innerHTML).toContain(UI_CARD_HEADER_CLASS)
    const { container: contentOnly } = render(<CardContent>Body</CardContent>)
    expect(contentOnly.innerHTML).toContain(UI_CARD_CONTENT_CLASS)
  })

  it('renders compound regions as direct card children', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Compound</CardTitle>
        </CardHeader>
        <CardContent>Fields</CardContent>
      </Card>,
    )
    expect(container.innerHTML).toContain(UI_CARD_HEADER_CLASS)
    expect(container.innerHTML).toContain(UI_CARD_CONTENT_CLASS)
    expect(queryCardRegion(container, UI_CARD_HEADER_CLASS).parentElement).toBe(
      container.firstElementChild,
    )
    expect(queryCardRegion(container, UI_CARD_CONTENT_CLASS).parentElement).toBe(
      container.firstElementChild,
    )
  })
})
