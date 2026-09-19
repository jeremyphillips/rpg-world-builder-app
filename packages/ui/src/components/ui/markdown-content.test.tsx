import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { MarkdownContent } from './markdown-content'

const globalsCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../styles/globals.css'),
  'utf8',
)

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

  it('wires prose anchors to the shared inline text-action CSS rule', () => {
    expect(globalsCss).toMatch(/:where\(a\) \{[\s\S]*@apply text-action-inline text-primary/)

    const { container } = render(
      <MarkdownContent markdown="See [Rules](/docs) for details." size="md" />,
    )

    expect(container.firstChild).toHaveClass('prose')
    expect(screen.getByRole('link', { name: 'Rules' })).toBeInTheDocument()
  })

  it('does not render script elements from markdown source', () => {
    const { container } = render(<MarkdownContent markdown={'<script>alert("x")</script>'} />)
    expect(container.querySelector('script')).toBeNull()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MarkdownContent markdown="Trait description with a [link](/path)." tone="muted" />,
    )
    await expectNoAxeViolations(container)
  })
})
