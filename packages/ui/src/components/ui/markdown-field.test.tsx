import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { MarkdownField } from './markdown-field.client'

describe('MarkdownField', () => {
  it('renders Write tab textarea with label', () => {
    render(
      <MarkdownField
        id="description"
        label="Description"
        value="## Notes"
        onChange={() => undefined}
      />,
    )

    expect(screen.getByLabelText(/^description$/i)).toHaveValue('## Notes')
    expect(screen.getByRole('tab', { name: 'Write' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument()
  })

  it('shows rendered markdown on Preview tab', async () => {
    const user = userEvent.setup()
    render(
      <MarkdownField
        id="description"
        label="Description"
        value={`## Heading

Body copy.`}
        onChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Preview' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Heading' })).toBeInTheDocument()
    expect(screen.getByText('Body copy.')).toBeInTheDocument()
  })

  it('shows empty preview copy when value is blank', async () => {
    const user = userEvent.setup()
    render(
      <MarkdownField id="description" label="Description" value="" onChange={() => undefined} />,
    )

    await user.click(screen.getByRole('tab', { name: 'Preview' }))
    expect(screen.getByText('Nothing to preview')).toBeInTheDocument()
  })

  it('previews legacy HTML via RichTextContent', async () => {
    const user = userEvent.setup()
    render(
      <MarkdownField
        id="description"
        label="Description"
        value="<p>Legacy <strong>HTML</strong></p>"
        onChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Preview' }))
    expect(screen.getByText('Legacy')).toBeInTheDocument()
    expect(screen.getByText('HTML')).toHaveProperty('tagName', 'STRONG')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MarkdownField
        id="description"
        label="Description"
        value="Ticket notes with a [link](/path)."
        onChange={() => undefined}
      />,
    )

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
