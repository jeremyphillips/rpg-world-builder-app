'use client'

import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Pencil } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { richTextEditorProseClasses } from './rich-text-content.variants'
import { normalizeRichTextHtml, richTextHtmlEquals } from './rich-text-html'
import type { RichTextLinkContext } from './rich-text-editor-link.lib'
import { RichTextEditorToolbar } from './rich-text-editor-toolbar.client'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
} from './rich-text-link-picker.types'
import { useRichTextEditorLinks } from './use-rich-text-editor-links.client'

export type { RichTextLinkContext } from './rich-text-editor-link.lib'

export interface RichTextEditorProps {
  /** Current value as an HTML string. */
  value?: string
  /** Called with the new HTML string on each edit. */
  onChange?: (html: string) => void
  onBlur?: () => void
  /** Opt in to the link toolbar button + extension (off by default). */
  linkable?: boolean
  internalLinkOptions?: RichTextLinkPickerInternalOption[]
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  onLinkPickerOpen?: (context: RichTextLinkContext) => void
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * A simple visual editor built on Tiptap: bold, italic, and line breaks, with an
 * optional link button. The value contract is a sanitized-on-render HTML string,
 * matching every other field control so it drops into forms and `Controller`.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  linkable = false,
  internalLinkOptions = [],
  contentTypeOptions,
  onLinkPickerOpen,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: RichTextEditorProps) {
  const [, forceRender] = React.useReducer((count: number) => count + 1, 0)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const valueRef = React.useRef(value)
  const onChangeRef = React.useRef(onChange)

  React.useEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  })

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: !disabled,
      extensions: [StarterKit.configure({ link: linkable ? { openOnClick: false } : false })],
      content: value ?? '',
      onUpdate: ({ editor: instance }) => {
        const nextHtml = instance.getHTML()
        if (richTextHtmlEquals(valueRef.current, nextHtml)) return
        const normalized = normalizeRichTextHtml(nextHtml)
        onChangeRef.current?.(normalized === '' ? '' : nextHtml)
      },
      onBlur: () => onBlur?.(),
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          class: richTextEditorProseClasses,
        },
      },
    },
    [linkable],
  )

  React.useEffect(() => {
    if (!editor) return undefined
    editor.on('transaction', forceRender)
    return () => {
      editor.off('transaction', forceRender)
    }
  }, [editor])

  React.useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  React.useEffect(() => {
    if (!editor) return
    if (value !== undefined && !richTextHtmlEquals(value, editor.getHTML())) {
      editor.commands.setContent(value ?? '', { emitUpdate: false })
    }
  }, [editor, value])

  React.useEffect(() => {
    if (!editor) return
    editor.setOptions({
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          class: richTextEditorProseClasses,
          ...(id ? { id } : {}),
          ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
          ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
          ...(ariaInvalid ? { 'aria-invalid': 'true' } : {}),
        },
      },
    })
  }, [editor, id, ariaLabel, ariaDescribedBy, ariaInvalid])

  const {
    isLinkPickerOpen,
    editingLinkContext,
    linkPickerMode,
    handleLinkPickerOpenChange,
    handleInsertLink,
    handleLinkPickerCancel,
    handleRemoveLink,
    handleMouseMove,
    handleMouseLeave,
    linkEditAffordance,
  } = useRichTextEditorLinks({ editor, onLinkPickerOpen, rootRef })

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative rounded-md border border-input shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        ariaInvalid && 'border-destructive focus-within:ring-destructive',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <RichTextEditorToolbar
        editor={editor}
        disabled={disabled}
        linkable={linkable}
        isLinkPickerOpen={isLinkPickerOpen}
        editingLinkContext={editingLinkContext}
        internalLinkOptions={internalLinkOptions}
        contentTypeOptions={contentTypeOptions}
        linkPickerMode={linkPickerMode}
        onLinkPickerOpenChange={handleLinkPickerOpenChange}
        onInsertLink={handleInsertLink}
        onLinkPickerCancel={handleLinkPickerCancel}
        onRemoveLink={handleRemoveLink}
      />
      <EditorContent
        editor={editor}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {linkable && linkEditAffordance ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute z-10 size-6"
          style={{
            top: `${linkEditAffordance.style.top}px`,
            left: `${linkEditAffordance.style.left}px`,
          }}
          aria-label="Edit link"
          onClick={linkEditAffordance.onClick}
        >
          <Pencil className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
