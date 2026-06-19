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
