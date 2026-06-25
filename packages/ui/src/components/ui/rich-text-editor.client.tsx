'use client'

import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Link as LinkIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { richTextEditorProseClasses } from './rich-text-content.variants'
import { normalizeRichTextHtml, richTextHtmlEquals } from './rich-text-html'

export interface RichTextEditorProps {
  /** Current value as an HTML string. */
  value?: string
  /** Called with the new HTML string on each edit. */
  onChange?: (html: string) => void
  onBlur?: () => void
  /** Opt in to the link toolbar button + extension (off by default). */
  linkable?: boolean
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
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: RichTextEditorProps) {
  const [, forceRender] = React.useReducer((count: number) => count + 1, 0)
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

  const toggleLink = React.useCallback(() => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Link URL')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  return (
    <div
      className={cn(
        'rounded-md border border-input shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        ariaInvalid && 'border-destructive focus-within:ring-destructive',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-border p-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-7', editor?.isActive('bold') && 'bg-accent text-accent-foreground')}
          aria-label="Bold"
          aria-pressed={editor?.isActive('bold') ?? false}
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-7', editor?.isActive('italic') && 'bg-accent text-accent-foreground')}
          aria-label="Italic"
          aria-pressed={editor?.isActive('italic') ?? false}
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Button>
        {linkable ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn('size-7', editor?.isActive('link') && 'bg-accent text-accent-foreground')}
            aria-label="Link"
            aria-pressed={editor?.isActive('link') ?? false}
            disabled={disabled || !editor}
            onClick={toggleLink}
          >
            <LinkIcon className="size-4" />
          </Button>
        ) : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
