'use client'

import * as React from 'react'
import type { Editor } from '@tiptap/react'

import {
  buildLinkMarkAttributes,
  mergeLinkInsertPayload,
  resolveLinkContextFromSelection,
  resolveLinkPickerMode,
  type RichTextLinkContext,
} from './rich-text-editor-link.lib'
import type { RichTextLinkPickerValue } from './rich-text-link-picker.types'

interface UseRichTextEditorLinksOptions {
  editor: Editor | null
  onLinkPickerOpen?: (context: RichTextLinkContext) => void
}

export function useRichTextEditorLinks({
  editor,
  onLinkPickerOpen,
}: UseRichTextEditorLinksOptions) {
  const [isLinkPickerOpen, setIsLinkPickerOpen] = React.useState(false)
  const [editingLinkContext, setEditingLinkContext] = React.useState<RichTextLinkContext | null>(
    null,
  )

  const resolveLinkContext = React.useCallback((): RichTextLinkContext | null => {
    if (!editor) return null

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    const attrs = editor.getAttributes('link') as Record<string, unknown>

    return resolveLinkContextFromSelection(attrs, selectedText)
  }, [editor])

  const openLinkPickerWithContext = React.useCallback(
    (context: RichTextLinkContext) => {
      setEditingLinkContext(context)
      setIsLinkPickerOpen(true)
      onLinkPickerOpen?.(context)
    },
    [onLinkPickerOpen],
  )

  const openLinkPickerFromCurrentSelection = React.useCallback(() => {
    const context = resolveLinkContext()
    if (!context) return
    openLinkPickerWithContext(context)
  }, [openLinkPickerWithContext, resolveLinkContext])

  const handleLinkPickerOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setIsLinkPickerOpen(false)
        return
      }
      openLinkPickerFromCurrentSelection()
    },
    [openLinkPickerFromCurrentSelection],
  )

  const handleInsertLink = React.useCallback(
    (value: RichTextLinkPickerValue) => {
      if (!editor) return

      const payload = mergeLinkInsertPayload(value, editingLinkContext)
      const href = payload.href.trim()
      if (!href) return

      const linkAttributes = buildLinkMarkAttributes(payload)
      const displayText = payload.displayText.trim()

      if (editor.state.selection.empty && displayText) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: displayText,
            marks: [{ type: 'link', attrs: linkAttributes }],
          })
          .run()
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink(linkAttributes as never)
          .run()
      }

      setIsLinkPickerOpen(false)
    },
    [editor, editingLinkContext],
  )

  const removeLink = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  const handleLinkPickerCancel = React.useCallback(() => {
    setIsLinkPickerOpen(false)
  }, [])

  const handleRemoveLink = React.useCallback(() => {
    removeLink()
    setIsLinkPickerOpen(false)
  }, [removeLink])

  const handleRemoveLinkFromBubble = React.useCallback(() => {
    removeLink()
  }, [removeLink])

  const showLinkBubbleMenu = Boolean(
    editor?.isFocused && editor.isActive('link') && !isLinkPickerOpen,
  )

  const linkPickerMode = resolveLinkPickerMode(editingLinkContext)

  return {
    isLinkPickerOpen,
    editingLinkContext,
    linkPickerMode,
    showLinkBubbleMenu,
    handleLinkPickerOpenChange,
    handleInsertLink,
    handleLinkPickerCancel,
    handleEditLink: openLinkPickerFromCurrentSelection,
    handleRemoveLink: editor?.isActive('link') ? handleRemoveLink : undefined,
    handleRemoveLinkFromBubble,
  }
}
