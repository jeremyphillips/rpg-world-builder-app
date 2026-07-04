import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  RichTextLinkPicker,
  type RichTextLinkPickerInternalOption,
} from './rich-text-link-picker.client'

const internalOptions: RichTextLinkPickerInternalOption[] = [
  {
    id: 'spell-overview',
    title: 'Spell Overview',
    href: '/campaigns/demo/content/spells',
    contentType: 'spell',
    kind: 'overview',
  },
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail',
    sourceLabel: 'Homebrew',
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    href: '/campaigns/demo/content/feats/sharpshooter',
    contentType: 'feat',
    kind: 'detail',
  },
]

describe('RichTextLinkPicker', () => {
  it('renders internal tab controls by default', () => {
    render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={vi.fn()}
        internalOptions={internalOptions}
      />,
    )

    expect(screen.getByText('Insert link')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Internal' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('textbox', { name: 'Search internal content' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filter by content type' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filter by content type' })).toHaveTextContent(
      'All types',
    )
    expect(screen.getByRole('textbox', { name: 'Internal display text' })).toBeInTheDocument()
  })

  it('shows internal options from every content type when the filter is unset', () => {
    render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={vi.fn()}
        internalOptions={internalOptions}
      />,
    )

    expect(screen.getByRole('button', { name: /Fireball/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sharpshooter/i })).toBeInTheDocument()
  })

  it('submits an internal link with metadata', async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={onInsert}
        internalOptions={internalOptions}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Fireball/i }))
    await user.clear(screen.getByRole('textbox', { name: 'Internal display text' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Internal display text' }),
      'Fireball spell',
    )
    await user.click(screen.getByRole('button', { name: 'Insert' }))

    expect(onInsert).toHaveBeenCalledWith({
      mode: 'internal',
      href: '/campaigns/demo/content/spells/fireball',
      displayText: 'Fireball spell',
      openInNewWindow: false,
      metadata: {
        contentType: 'spell',
        contentId: 'fireball',
        contentTitle: 'Fireball',
        linkKind: 'detail',
      },
    })
  })

  it('keeps Insert disabled until internal display text is provided', async () => {
    const user = userEvent.setup()
    render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={vi.fn()}
        internalOptions={internalOptions}
      />,
    )

    expect(screen.getByRole('button', { name: 'Insert' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Fireball/i }))
    expect(screen.getByRole('button', { name: 'Insert' })).toBeEnabled()

    await user.clear(screen.getByRole('textbox', { name: 'Internal display text' }))
    expect(screen.getByRole('button', { name: 'Insert' })).toBeDisabled()
  })

  it('submits an external link from the external tab', async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={onInsert}
        internalOptions={internalOptions}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'External' }))
    expect(screen.getByRole('button', { name: 'Insert' })).toBeDisabled()

    await user.type(
      screen.getByRole('textbox', { name: 'External URL' }),
      'https://example.com/rules',
    )
    await user.type(screen.getByRole('textbox', { name: 'External display text' }), 'Rules')
    await user.click(screen.getByRole('button', { name: 'Insert' }))

    expect(onInsert).toHaveBeenCalledWith({
      mode: 'external',
      href: 'https://example.com/rules',
      displayText: 'Rules',
      openInNewWindow: true,
      metadata: { linkKind: 'external' },
    })
  })

  it('defaults external links to opening in a new window', async () => {
    const user = userEvent.setup()
    render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={vi.fn()}
        internalOptions={internalOptions}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'External' }))
    expect(screen.getByRole('checkbox', { name: 'Open external link in new window' })).toBeChecked()
  })

  it('has no axe accessibility violations on the internal tab', async () => {
    const { container } = render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={vi.fn()}
        internalOptions={internalOptions}
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations on the external tab', async () => {
    const { container } = render(
      <RichTextLinkPicker
        open
        onOpenChange={vi.fn()}
        trigger={<button type="button">Open picker</button>}
        onInsert={vi.fn()}
        internalOptions={internalOptions}
        initialValue={{
          mode: 'external',
          href: 'https://example.com',
          displayText: 'Rules',
          openInNewWindow: true,
        }}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
