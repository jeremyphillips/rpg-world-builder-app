import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Editor } from '@tiptap/react'

import { RichTextLinkBubbleMenu } from './rich-text-link-bubble-menu.client'

function createEditorMock(isActiveLink: boolean) {
  const anchor = document.createElement('a')
  anchor.href = '/campaigns/demo/spells/fire-bolt'
  anchor.textContent = 'Fire Bolt'
  document.body.appendChild(anchor)

  const textNode = document.createTextNode('Fire Bolt')
  anchor.appendChild(textNode)

  return {
    editor: {
      isActive: vi.fn((mark: string) => mark === 'link' && isActiveLink),
      state: { selection: { from: 1, to: 1 } },
      view: {
        domAtPos: vi.fn(() => ({ node: textNode, offset: 0 })),
      },
    } as unknown as Editor,
    rootRef: { current: document.createElement('div') },
    anchor,
  }
}

describe('RichTextLinkBubbleMenu', () => {
  it('renders edit and remove actions when open', () => {
    const { editor, rootRef, anchor } = createEditorMock(true)
    const rect = {
      top: 40,
      left: 24,
      right: 120,
      bottom: 60,
      width: 96,
      height: 20,
      x: 24,
      y: 40,
      toJSON: () => ({}),
    } as DOMRect

    rootRef.current!.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        right: 400,
        bottom: 200,
        width: 400,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
    anchor.getBoundingClientRect = () => rect

    render(
      <RichTextLinkBubbleMenu
        editor={editor}
        rootRef={rootRef}
        open
        onEditLink={vi.fn()}
        onRemoveLink={vi.fn()}
      />,
    )

    expect(screen.getByRole('toolbar', { name: 'Link options' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove link' })).toBeInTheDocument()
  })
})
