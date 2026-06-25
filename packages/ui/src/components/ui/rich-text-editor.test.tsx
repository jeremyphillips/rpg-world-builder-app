import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { RICH_TEXT_LINK_ATTRS } from '../../lib/rich-text-link-attrs'
import { RichTextEditor } from './rich-text-editor.client'
import type { RichTextLinkPickerInternalOption } from './rich-text-link-picker.types'

const internalLinkOptions: RichTextLinkPickerInternalOption[] = [
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail',
    sourceLabel: 'Homebrew',
  },
]

describe('RichTextEditor', () => {
  it('renders the bold and italic toolbar buttons with accessible names', () => {
    render(<RichTextEditor aria-label="Biography" />)
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bulleted list' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ordered list' })).toBeInTheDocument()
  })

  it('hides the link button unless linkable is set', () => {
    const { rerender } = render(<RichTextEditor aria-label="Biography" />)
    expect(screen.queryByRole('button', { name: 'Link' })).not.toBeInTheDocument()
    rerender(<RichTextEditor aria-label="Biography" linkable />)
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
  })

  it('applies prose classes to the editable surface', async () => {
    render(<RichTextEditor aria-label="Biography" />)
    const surface = await screen.findByRole('textbox')
    expect(surface).toHaveClass('prose', 'prose-sm', 'max-w-none')
  })

  it('does not call onChange when mounted with an empty value', async () => {
    const onChange = vi.fn()
    render(<RichTextEditor aria-label="Description" value="" onChange={onChange} />)

    await screen.findByRole('textbox')
    await waitFor(() => expect(onChange).not.toHaveBeenCalled())
  })

  it('does not call onChange when mounted with plain-text catalog content', async () => {
    const onChange = vi.fn()
    render(
      <RichTextEditor
        aria-label="Description"
        value="Jump farther than normal."
        onChange={onChange}
      />,
    )

    await screen.findByRole('textbox')
    await waitFor(() => expect(onChange).not.toHaveBeenCalled())
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<RichTextEditor aria-label="Biography" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('opens the link panel instead of using a prompt', async () => {
    const user = userEvent.setup()
    render(<RichTextEditor aria-label="Biography" linkable />)

    await user.click(screen.getByRole('button', { name: 'Link' }))

    expect(screen.getByText('Insert link')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search internal content' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Internal display text' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Insert' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('persists internal link metadata in stored HTML', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RichTextEditor
        aria-label="Description"
        linkable
        internalLinkOptions={internalLinkOptions}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Link' }))
    await user.click(screen.getByRole('button', { name: /Fireball/i }))
    await user.click(screen.getByRole('button', { name: 'Insert' }))

    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const html = String(onChange.mock.calls.at(-1)?.[0])
    expect(html).toContain(`${RICH_TEXT_LINK_ATTRS.contentType}="spell"`)
    expect(html).toContain(`${RICH_TEXT_LINK_ATTRS.contentId}="fireball"`)
    expect(html).toContain(`${RICH_TEXT_LINK_ATTRS.contentTitle}="Fireball"`)
    expect(html).toContain(`${RICH_TEXT_LINK_ATTRS.linkKind}="detail"`)
    expect(html).toContain('href="/campaigns/demo/content/spells/fireball"')
  })

  it('writes target and rel on external links opened in a new window', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RichTextEditor
        aria-label="Description"
        linkable
        internalLinkOptions={internalLinkOptions}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Link' }))
    await user.click(screen.getByRole('tab', { name: 'External' }))
    await user.type(
      screen.getByRole('textbox', { name: 'External URL' }),
      'https://example.com/rules',
    )
    await user.type(screen.getByRole('textbox', { name: 'External display text' }), 'Rules')
    await user.click(screen.getByRole('button', { name: 'Insert' }))

    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const html = String(onChange.mock.calls.at(-1)?.[0])
    expect(html).toContain('href="https://example.com/rules"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain(`${RICH_TEXT_LINK_ATTRS.linkKind}="external"`)
  })

  it('shows an edit affordance when hovering an existing link', async () => {
    render(
      <RichTextEditor
        aria-label="Biography"
        linkable
        value='<p><a href="/campaigns/demo/spells/fire-bolt" data-content-title="Fire Bolt">Fire Bolt</a></p>'
      />,
    )

    const link = await screen.findByRole('link', { name: 'Fire Bolt' })
    fireEvent.mouseMove(link)

    expect(screen.getByRole('button', { name: 'Edit link' })).toBeInTheDocument()
  })

  it('shows an edit affordance when hovering an existing link', async () => {
    const user = userEvent.setup()
    render(
      <RichTextEditor
        aria-label="Biography"
        linkable
        internalLinkOptions={internalLinkOptions}
        value={
          '<p><a href="/campaigns/demo/content/spells/fireball" data-content-type="spell" data-content-id="fireball" data-content-title="Fireball" data-link-kind="detail">Fire Bolt</a></p>'
        }
      />,
    )

    const link = await screen.findByRole('link', { name: 'Fire Bolt' })
    fireEvent.mouseMove(link)
    await user.click(screen.getByRole('button', { name: 'Edit link' }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Internal display text' })).toHaveValue(
        'Fire Bolt',
      )
    })
    expect(screen.getByRole('button', { name: 'Remove link' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations when linkable', async () => {
    const { container } = render(
      <RichTextEditor aria-label="Biography" linkable internalLinkOptions={internalLinkOptions} />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
