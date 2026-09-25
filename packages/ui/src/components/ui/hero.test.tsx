import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Heading } from './heading'
import { Hero, heroMarkFrameClasses, heroMarkImageClasses, heroMediaImageClasses } from './hero'

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

    expect(screen.getByTestId('mark').parentElement).toHaveClass('sm:-mt-6')

    rerender(<Hero mark={mark} markPlacement="overlap" title="Campaign" />)

    expect(screen.getByTestId('mark').parentElement).not.toHaveClass('sm:-mt-6')
  })

  it('places the mark beside the copy column with desktop-only emblem spacing', () => {
    render(
      <Hero
        mark={<div data-testid="mark">Mark</div>}
        title={<span data-testid="title">Campaign</span>}
        meta={<span data-testid="meta">Meta</span>}
      />,
    )

    const mark = screen.getByTestId('mark')
    const title = screen.getByTestId('title')
    const identityBlock = mark.parentElement?.parentElement
    const markShell = mark.parentElement

    expect(identityBlock).toHaveClass('sm:px-2', 'lg:px-4')
    expect(identityBlock).not.toHaveClass('px-4', 'sm:px-4')
    expect(markShell).toHaveClass('hidden', 'sm:block', 'sm:mr-4')
    expect(mark.compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(identityBlock).toContainElement(screen.getByTestId('meta'))
  })

  it('shares mark corner radius between the frame and image utilities', () => {
    expect(heroMarkFrameClasses).toContain('rounded-lg')
    expect(heroMarkImageClasses).toContain('rounded-lg')
  })

  it('omits desktop emblem spacing when the mark is absent', () => {
    const { container } = render(<Hero title="Campaign" meta={<span>Meta</span>} />)

    expect(container.querySelector('.sm\\:px-2')).toBeNull()
    expect(container.querySelector('.lg\\:px-4')).toBeNull()
    expect(container.querySelector('.sm\\:mr-4')).toBeNull()
    expect(container.querySelector('.hidden.sm\\:block')).toBeNull()
  })
})
