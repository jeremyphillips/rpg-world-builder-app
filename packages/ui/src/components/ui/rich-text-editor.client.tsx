'use client'

import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import {
  RichTextLinkPicker,
  type RichTextLinkPickerContentTypeOption,
  type RichTextLinkPickerInternalOption,
  type RichTextLinkPickerValue,
} from './rich-text-link-picker.client'
import { richTextEditorProseClasses } from './rich-text-content.variants'
import { normalizeRichTextHtml, richTextHtmlEquals } from './rich-text-html'

interface RichTextLinkMetadata {
  contentType?: string
  contentId?: string
  contentTitle?: string
  linkKind?: 'detail' | 'overview' | 'external'
}

interface RichTextLinkContext {
  href: string
  displayText: string
  openInNewWindow: boolean
  metadata?: RichTextLinkMetadata
}

function parseLinkKind(value: unknown): RichTextLinkMetadata['linkKind'] {
  if (value === 'detail' || value === 'overview' || value === 'external') return value
  return undefined
}

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
  const valueRef = React.useRef(value)
  const onChangeRef = React.useRef(onChange)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = React.useState(false)
  const [editingLinkContext, setEditingLinkContext] = React.useState<RichTextLinkContext | null>(
    null,
  )

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

  const resolveLinkContext = React.useCallback((): RichTextLinkContext | null => {
    if (!editor) return null

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim()
    const attrs = editor.getAttributes('link') as Record<string, unknown>

    return {
      href: typeof attrs.href === 'string' ? attrs.href : '',
      displayText:
        selectedText ||
        (typeof attrs['data-content-title'] === 'string' ? attrs['data-content-title'] : ''),
      openInNewWindow: attrs.target === '_blank',
      metadata: {
        contentType:
          typeof attrs['data-content-type'] === 'string' ? attrs['data-content-type'] : undefined,
        contentId:
          typeof attrs['data-content-id'] === 'string' ? attrs['data-content-id'] : undefined,
        contentTitle:
          typeof attrs['data-content-title'] === 'string' ? attrs['data-content-title'] : undefined,
        linkKind: parseLinkKind(attrs['data-link-kind']),
      },
    }
  }, [editor])

  const applyLinkPayload = React.useCallback(
    (payload: RichTextLinkContext) => {
      if (!editor) return
      const href = payload.href.trim()
      if (!href) return

      const linkAttributes = {
        href,
        target: payload.openInNewWindow ? '_blank' : null,
        rel: payload.openInNewWindow ? 'noopener noreferrer' : null,
        ...(payload.metadata?.contentType
          ? { 'data-content-type': payload.metadata.contentType }
          : {}),
        ...(payload.metadata?.contentId ? { 'data-content-id': payload.metadata.contentId } : {}),
        ...(payload.metadata?.contentTitle
          ? { 'data-content-title': payload.metadata.contentTitle }
          : {}),
        ...(payload.metadata?.linkKind ? { 'data-link-kind': payload.metadata.linkKind } : {}),
      } as never

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
        return
      }

      editor.chain().focus().extendMarkRange('link').setLink(linkAttributes).run()
    },
    [editor],
  )

  const removeLink = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  const handleLinkPickerOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setIsLinkPickerOpen(false)
        return
      }

      const context = resolveLinkContext()
      if (!context) return
      setEditingLinkContext(context)
      setIsLinkPickerOpen(true)
      onLinkPickerOpen?.(context)
    },
    [onLinkPickerOpen, resolveLinkContext],
  )

  const handleInsertLink = React.useCallback(
    (value: RichTextLinkPickerValue) => {
      applyLinkPayload({
        href: value.href,
        displayText: value.displayText,
        openInNewWindow: value.openInNewWindow,
        metadata: {
          ...editingLinkContext?.metadata,
          ...value.metadata,
        },
      })
      setIsLinkPickerOpen(false)
    },
    [applyLinkPayload, editingLinkContext],
  )

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
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-7',
            editor?.isActive('bulletList') && 'bg-accent text-accent-foreground',
          )}
          aria-label="Bulleted list"
          aria-pressed={editor?.isActive('bulletList') ?? false}
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-7',
            editor?.isActive('orderedList') && 'bg-accent text-accent-foreground',
          )}
          aria-label="Ordered list"
          aria-pressed={editor?.isActive('orderedList') ?? false}
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Button>
        {linkable ? (
          <RichTextLinkPicker
            open={isLinkPickerOpen}
            onOpenChange={handleLinkPickerOpenChange}
            initialValue={{
              mode:
                editingLinkContext?.metadata?.linkKind === 'external' ||
                /^https?:\/\//i.test(editingLinkContext?.href ?? '')
                  ? 'external'
                  : 'internal',
              href: editingLinkContext?.href,
              displayText: editingLinkContext?.displayText,
              openInNewWindow: editingLinkContext?.openInNewWindow,
              metadata: editingLinkContext?.metadata,
            }}
            internalOptions={internalLinkOptions}
            contentTypeOptions={contentTypeOptions}
            onInsert={handleInsertLink}
            onCancel={() => setIsLinkPickerOpen(false)}
            onRemove={
              editor?.isActive('link')
                ? () => {
                    removeLink()
                    setIsLinkPickerOpen(false)
                  }
                : undefined
            }
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'size-7',
                  editor?.isActive('link') && 'bg-accent text-accent-foreground',
                )}
                aria-label="Link"
                aria-pressed={editor?.isActive('link') ?? false}
                disabled={disabled || !editor}
              >
                <LinkIcon className="size-4" />
              </Button>
            }
          />
        ) : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
