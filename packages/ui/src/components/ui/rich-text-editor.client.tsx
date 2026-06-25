'use client'

import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Pencil } from 'lucide-react'

import { cn } from '../../lib/utils'
import { RICH_TEXT_LINK_ATTRS, readRichTextLinkAttr } from '../../lib/rich-text-link-attrs'
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
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const valueRef = React.useRef(value)
  const onChangeRef = React.useRef(onChange)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = React.useState(false)
  const [editingLinkContext, setEditingLinkContext] = React.useState<RichTextLinkContext | null>(
    null,
  )
  const [hoveredLinkAnchor, setHoveredLinkAnchor] = React.useState<HTMLAnchorElement | null>(null)
  const [hoveredLinkPos, setHoveredLinkPos] = React.useState<number | null>(null)

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
        selectedText || readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentTitle) || '',
      openInNewWindow: attrs.target === '_blank',
      metadata: {
        contentType: readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentType),
        contentId: readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentId),
        contentTitle: readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentTitle),
        linkKind: parseLinkKind(readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.linkKind)),
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
          ? { [RICH_TEXT_LINK_ATTRS.contentType]: payload.metadata.contentType }
          : {}),
        ...(payload.metadata?.contentId
          ? { [RICH_TEXT_LINK_ATTRS.contentId]: payload.metadata.contentId }
          : {}),
        ...(payload.metadata?.contentTitle
          ? { [RICH_TEXT_LINK_ATTRS.contentTitle]: payload.metadata.contentTitle }
          : {}),
        ...(payload.metadata?.linkKind
          ? { [RICH_TEXT_LINK_ATTRS.linkKind]: payload.metadata.linkKind }
          : {}),
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

  const openLinkPickerFromCurrentSelection = React.useCallback(() => {
    const context = resolveLinkContext()
    if (!context) return
    setEditingLinkContext(context)
    setIsLinkPickerOpen(true)
    onLinkPickerOpen?.(context)
  }, [onLinkPickerOpen, resolveLinkContext])

  const openLinkPickerForPosition = React.useCallback(
    (position: number, fallback?: { href?: string; text?: string }) => {
      if (!editor) return
      editor.chain().focus().setTextSelection(position).extendMarkRange('link').run()
      const context = resolveLinkContext()
      if (context) {
        setEditingLinkContext(context)
        setIsLinkPickerOpen(true)
        onLinkPickerOpen?.(context)
        return
      }
      if (!fallback?.href) return
      const fallbackContext: RichTextLinkContext = {
        href: fallback.href,
        displayText: fallback.text ?? '',
        openInNewWindow: /^https?:\/\//i.test(fallback.href),
        metadata: { linkKind: /^https?:\/\//i.test(fallback.href) ? 'external' : undefined },
      }
      setEditingLinkContext(fallbackContext)
      setIsLinkPickerOpen(true)
      onLinkPickerOpen?.(fallbackContext)
    },
    [editor, onLinkPickerOpen, resolveLinkContext],
  )

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

  const hoveredLinkStyle = React.useMemo(() => {
    if (!hoveredLinkAnchor || !rootRef.current) return null
    const rootRect = rootRef.current.getBoundingClientRect()
    const anchorRect = hoveredLinkAnchor.getBoundingClientRect()
    return {
      top: Math.max(anchorRect.top - rootRect.top - 10, 0),
      left: Math.max(anchorRect.right - rootRect.left + 4, 0),
    }
  }, [hoveredLinkAnchor])

  const focusedLinkStyle = (() => {
    if (!editor || !rootRef.current || !editor.isFocused || !editor.isActive('link')) return null
    try {
      const { from } = editor.state.selection
      const coords = editor.view.coordsAtPos(from)
      const rootRect = rootRef.current.getBoundingClientRect()
      return {
        top: Math.max(coords.top - rootRect.top - 10, 0),
        left: Math.max(coords.right - rootRect.left + 4, 0),
      }
    } catch {
      return null
    }
  })()

  const linkEditButtonConfig = hoveredLinkStyle
    ? {
        style: hoveredLinkStyle,
        onClick: () => {
          if (hoveredLinkPos != null) {
            openLinkPickerForPosition(hoveredLinkPos, {
              href: hoveredLinkAnchor?.getAttribute('href') ?? undefined,
              text: hoveredLinkAnchor?.textContent ?? undefined,
            })
            return
          }
          openLinkPickerFromCurrentSelection()
        },
      }
    : focusedLinkStyle
      ? {
          style: focusedLinkStyle,
          onClick: () => openLinkPickerFromCurrentSelection(),
        }
      : null

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
      <EditorContent
        editor={editor}
        onMouseMove={(event) => {
          if (!editor) return
          const anchor = (event.target as HTMLElement).closest('a')
          if (!(anchor instanceof HTMLAnchorElement)) {
            if (!(editor.isFocused && editor.isActive('link'))) {
              setHoveredLinkAnchor(null)
              setHoveredLinkPos(null)
            }
            return
          }

          const node = anchor.firstChild ?? anchor
          const position = editor.view.posAtDOM(node, 0)
          setHoveredLinkAnchor(anchor)
          setHoveredLinkPos(position)
        }}
        onMouseLeave={() => {
          setHoveredLinkAnchor(null)
          setHoveredLinkPos(null)
        }}
      />
      {linkable && linkEditButtonConfig ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute z-10 size-6"
          style={{
            top: `${linkEditButtonConfig.style.top}px`,
            left: `${linkEditButtonConfig.style.left}px`,
          }}
          aria-label="Edit link"
          onClick={linkEditButtonConfig.onClick}
        >
          <Pencil className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
