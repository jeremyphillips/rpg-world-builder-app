import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RichTextContent } from './rich-text-content'

describe('RichTextContent', () => {
  it('renders sanitized HTML with prose classes', () => {
    const { container } = render(
      <RichTextContent html="<p>Hello <strong>world</strong></p>" size="md" tone="muted" />,
    )
    expect(container.querySelector('p')).toHaveTextContent('Hello world')
    expect(container.firstChild).toHaveClass('prose', 'prose-md', 'max-w-none')
  })

  it('renders compact prose when size is sm', () => {
    const { container } = render(
      <RichTextContent html="<p>Compact copy.</p>" size="sm" tone="muted" />,
    )
    expect(container.firstChild).toHaveClass('prose', 'prose-sm', 'max-w-none')
  })

  it('renders multiple paragraphs inside prose', () => {
    const { container } = render(
      <RichTextContent html="<p>First paragraph.</p><p>Second paragraph.</p>" size="md" />,
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
        size="md"
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
        size="md"
      />,
    )

    const link = screen.getByRole('link', { name: 'Fire Bolt' })
    expect(link).toHaveAttribute('href', '/campaigns/demo/spells/fire-bolt')
    expect(link).toHaveAttribute('data-content-type', 'spell')
    expect(link).toHaveAttribute('data-content-id', 'fire-bolt')
    expect(link).toHaveAttribute('data-content-title', 'Fire Bolt')
    expect(link).toHaveAttribute('data-link-kind', 'detail')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <RichTextContent html="<p>Trait description with a <a href='#'>link</a>.</p>" tone="muted" />,
    )
    await expectNoAxeViolations(container)
  })
})
