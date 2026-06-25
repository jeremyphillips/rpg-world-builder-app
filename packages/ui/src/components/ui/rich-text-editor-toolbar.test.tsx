import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Editor } from '@tiptap/react'

import { RichTextEditorToolbar } from './rich-text-editor-toolbar.client'

function createEditorMock(isActive = false) {
  const run = vi.fn()
  const chain = {
    focus: vi.fn(() => chain),
    toggleBold: vi.fn(() => chain),
    toggleItalic: vi.fn(() => chain),
    toggleBulletList: vi.fn(() => chain),
    toggleOrderedList: vi.fn(() => chain),
    run,
  }

  return {
    editor: {
      isActive: vi.fn(() => isActive),
      chain: vi.fn(() => chain),
    } as unknown as Editor,
    chain,
    run,
  }
}

describe('RichTextEditorToolbar', () => {
  it('toggles bullet and ordered lists from the toolbar', async () => {
    const user = userEvent.setup()
    const { editor, chain, run } = createEditorMock()

    render(
      <RichTextEditorToolbar
        editor={editor}
        disabled={false}
        linkable={false}
        isLinkPickerOpen={false}
        editingLinkContext={null}
        internalLinkOptions={[]}
        linkPickerMode="internal"
        onLinkPickerOpenChange={vi.fn()}
        onInsertLink={vi.fn()}
        onLinkPickerCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Bulleted list' }))
    expect(chain.focus).toHaveBeenCalled()
    expect(chain.toggleBulletList).toHaveBeenCalled()
    expect(run).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Ordered list' }))
    expect(chain.toggleOrderedList).toHaveBeenCalled()
  })
})
