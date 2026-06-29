import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { RichTextContent } from './rich-text-content'

describe('RichTextContent', () => {
  it('renders sanitized HTML with prose classes', () => {
    const { container } = render(
      <RichTextContent html="<p>Hello <strong>world</strong></p>" size="sm" tone="muted" />,
    )
    expect(container.querySelector('p')).toHaveTextContent('Hello world')
    expect(container.firstChild).toHaveClass('prose', 'prose-sm', 'max-w-none')
  })

  it('renders multiple paragraphs inside prose', () => {
    const { container } = render(
      <RichTextContent html="<p>First paragraph.</p><p>Second paragraph.</p>" size="sm" />,
    )
    expect(container.querySelectorAll('p')).toHaveLength(2)
    expect(container.firstChild).toHaveClass('prose')
  })

  it('returns null for empty html', () => {
    const { container } = render(<RichTextContent html="" />)
    expect(container.firstChild).toBeNull()
  })

  it('strips unsafe markup', () => {
    const { container } = render(
      <RichTextContent html={'<p>Safe</p><script>alert("x")</script>'} />,
    )
    expect(container.querySelector('script')).toBeNull()
    expect(screen.getByText('Safe')).toBeInTheDocument()
  })

  it('renders code blocks and inline code', () => {
    render(
      <RichTextContent
        html={
          '<p>Use <code>pnpm bench</code> for tickets.</p><pre><code>pnpm bench list-tickets</code></pre>'
        }
        size="sm"
      />,
    )

    expect(screen.getByText('pnpm bench')).toBeInTheDocument()
    expect(screen.getByText('pnpm bench list-tickets')).toBeInTheDocument()
  })

  it('renders internal links with preserved metadata attributes', () => {
    render(
      <RichTextContent
        html={
          '<p>See <a href="/campaigns/demo/spells/fire-bolt" data-content-type="spell" data-content-id="fire-bolt" data-content-title="Fire Bolt" data-link-kind="detail">Fire Bolt</a>.</p>'
        }
        size="sm"
      />,
    )

    const link = screen.getByRole('link', { name: 'Fire Bolt' })
    expect(link).toHaveAttribute('href', '/campaigns/demo/spells/fire-bolt')
    expect(link).toHaveAttribute('data-content-type', 'spell')
    expect(link).toHaveAttribute('data-content-id', 'fire-bolt')
    expect(link).toHaveAttribute('data-content-title', 'Fire Bolt')
    expect(link).toHaveAttribute('data-link-kind', 'detail')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RichTextContent html="<p>Trait description with a <a href='#'>link</a>.</p>" tone="muted" />,
    )
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
