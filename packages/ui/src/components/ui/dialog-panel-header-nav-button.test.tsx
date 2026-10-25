import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { dialogPanelHeaderGlyphSizeClasses } from './dialog-panel-header-icon-control.lib'
import {
  DialogPanelHeaderNavButton,
  UI_DIALOG_PANEL_HEADER_NAV_BUTTON_BLOCK_CLASS,
} from './dialog-panel-header-nav-button.client'

const navButtonCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), './dialog-panel-header-nav-button.css'),
  'utf8',
)

describe('DialogPanelHeaderNavButton', () => {
  it('defines responsive glyph sizing on the dialog title scale (18px base, 20px from md)', () => {
    expect(navButtonCss).toMatch(
      /@utility size-dialog-panel-header-glyph \{[\s\S]*?--icon-size: var\(--text-heading-dialog-title\)/,
    )
    expect(navButtonCss).toMatch(
      /@variant md \{[\s\S]*?--icon-size: var\(--text-heading-dialog-title-md\)/,
    )
  })

  it('renders an accessible back control with the semantic block class', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<DialogPanelHeaderNavButton aria-label="Go back" onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Go back' })
    expect(button).toHaveClass(UI_DIALOG_PANEL_HEADER_NAV_BUTTON_BLOCK_CLASS)
    expect(button).toHaveClass('ui-compact-control--icon-default')

    const glyph = button.querySelector('svg')
    expect(glyph).toHaveClass(dialogPanelHeaderGlyphSizeClasses)
    expect(glyph).not.toHaveClass('size-icon-glyph-lg')

    await user.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
