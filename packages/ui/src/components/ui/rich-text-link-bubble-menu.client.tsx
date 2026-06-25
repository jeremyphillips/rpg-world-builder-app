'use client'

import * as React from 'react'
import type { Editor } from '@tiptap/react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { findLinkAnchorFromDom, resolveLinkBubblePosition } from './rich-text-editor-link.lib'

export interface RichTextLinkBubbleMenuProps {
  editor: Editor | null
  rootRef: React.RefObject<HTMLDivElement | null>
  open: boolean
  onEditLink: () => void
  onRemoveLink: () => void
  className?: string
}

export function RichTextLinkBubbleMenu({
  editor,
  rootRef,
  open,
  onEditLink,
  onRemoveLink,
  className,
}: RichTextLinkBubbleMenuProps) {
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)

  React.useLayoutEffect(() => {
    if (!open || !editor || !rootRef.current) {
      setPosition(null)
      return
    }

    const { from } = editor.state.selection
    const domAtPos = editor.view.domAtPos(from)
    const anchor = findLinkAnchorFromDom(domAtPos.node)
    if (!anchor) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      if (!rootRef.current) return
      setPosition(
        resolveLinkBubblePosition(
          rootRef.current.getBoundingClientRect(),
          anchor.getBoundingClientRect(),
        ),
      )
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [editor, editor?.state.selection, open, rootRef])

  if (!open || !position) return null

  return (
    <div
      role="toolbar"
      aria-label="Link options"
      className={cn(
        'absolute z-10 flex items-center gap-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        className,
      )}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <Button type="button" variant="ghost" size="sm" onClick={onEditLink}>
        Edit link
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onRemoveLink}>
        Remove link
      </Button>
    </div>
  )
}
