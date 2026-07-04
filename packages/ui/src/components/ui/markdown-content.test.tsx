import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { MarkdownContent } from './markdown-content'

describe('MarkdownContent', () => {
  it('renders markdown with prose classes', () => {
    const { container } = render(
      <MarkdownContent
        markdown={`## Heading

Hello **world**.`}
        size="md"
        tone="muted"
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Heading' })).toBeInTheDocument()
    expect(screen.getByText('world')).toHaveProperty('tagName', 'STRONG')
    expect(container.firstChild).toHaveClass('prose', 'prose-md', 'max-w-none')
  })

  it('renders GFM tables', () => {
    render(<MarkdownContent markdown={'| Col |\n| --- |\n| Val |'} size="md" />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Val')).toBeInTheDocument()
  })

  it('returns null for empty markdown', () => {
    const { container } = render(<MarkdownContent markdown="" />)
    expect(container.firstChild).toBeNull()
  })

  it('opens external links in a new tab with noopener', () => {
    render(<MarkdownContent markdown="[Docs](https://example.com/docs)" />)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', 'https://example.com/docs')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render script elements from markdown source', () => {
    const { container } = render(<MarkdownContent markdown={'<script>alert("x")</script>'} />)
    expect(container.querySelector('script')).toBeNull()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MarkdownContent markdown="Trait description with a [link](/path)." tone="muted" />,
    )
    await expectNoAxeViolations(container)
  })
})
