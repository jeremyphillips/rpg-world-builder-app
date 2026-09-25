import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Heading } from './heading'
import { Hero, heroMarkFrameClasses, heroMediaImageClasses } from './hero'

describe('Hero', () => {
  it('omits the media region when media is absent', () => {
    const { container } = render(
      <Hero title={<Heading variant="page">Campaign</Heading>} meta={<span>Active</span>} />,
    )

    expect(container.querySelector('[class*="rounded-xl"]')).toBeNull()
    expect(screen.getByText('Campaign')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders meta before secondary', () => {
    render(
      <Hero
        title="Campaign"
        meta={<span data-testid="meta">Meta</span>}
        secondary={<span data-testid="secondary">Secondary</span>}
      />,
    )

    const meta = screen.getByTestId('meta')
    const secondary = screen.getByTestId('secondary')
    expect(meta.compareDocumentPosition(secondary)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('applies overlap placement only when media is present', () => {
    const mark = <div data-testid="mark" className={heroMarkFrameClasses} />

    const { rerender } = render(
      <Hero
        mark={mark}
        markPlacement="overlap"
        title="Campaign"
        media={<img alt="" className={heroMediaImageClasses} src="/banner.jpg" />}
      />,
    )

    expect(screen.getByTestId('mark').parentElement).toHaveClass('-mt-3')

    rerender(<Hero mark={mark} markPlacement="overlap" title="Campaign" />)

    expect(screen.getByTestId('mark').parentElement).not.toHaveClass('-mt-3')
  })
})
