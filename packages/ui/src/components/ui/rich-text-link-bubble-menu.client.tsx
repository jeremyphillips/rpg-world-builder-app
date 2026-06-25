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

function resolveLinkBubbleMenuPosition(
  editor: Editor,
  root: HTMLDivElement,
): { top: number; left: number } | null {
  const { from } = editor.state.selection
  const domAtPos = editor.view.domAtPos(from)
  const anchor = findLinkAnchorFromDom(domAtPos.node)
  if (!anchor) return null

  return resolveLinkBubblePosition(root.getBoundingClientRect(), anchor.getBoundingClientRect())
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
    if (!open || !editor) {
      const frameId = window.requestAnimationFrame(() => {
        setPosition(null)
      })
      return () => window.cancelAnimationFrame(frameId)
    }

    const updatePosition = () => {
      const root = rootRef.current
      if (!root) {
        setPosition(null)
        return
      }

      setPosition(resolveLinkBubbleMenuPosition(editor, root))
    }

    const frameId = window.requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updatePosition)
    }
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
      onMouseDown={(event) => event.preventDefault()}
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
