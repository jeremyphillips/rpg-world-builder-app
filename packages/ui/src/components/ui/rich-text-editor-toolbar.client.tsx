'use client'

import type { Editor } from '@tiptap/react'
import type { LucideIcon } from 'lucide-react'
import { Bold, Code, Italic, Link as LinkIcon, List, ListOrdered, SquareCode } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { RichTextLinkPicker } from './rich-text-link-picker.client'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
  RichTextLinkPickerValue,
} from './rich-text-link-picker.types'
import type { RichTextLinkContext } from './rich-text-editor-link.lib'

interface RichTextFormatAction {
  label: string
  icon: LucideIcon
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const FORMAT_ACTIONS: RichTextFormatAction[] = [
  {
    label: 'Bold',
    icon: Bold,
    isActive: (editor) => editor.isActive('bold'),
    run: (editor) => {
      editor.chain().focus().toggleBold().run()
    },
  },
  {
    label: 'Italic',
    icon: Italic,
    isActive: (editor) => editor.isActive('italic'),
    run: (editor) => {
      editor.chain().focus().toggleItalic().run()
    },
  },
  {
    label: 'Bulleted list',
    icon: List,
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    label: 'Ordered list',
    icon: ListOrdered,
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
]

const CODE_ACTIONS: RichTextFormatAction[] = [
  {
    label: 'Inline code',
    icon: Code,
    isActive: (editor) => editor.isActive('code'),
    run: (editor) => {
      editor.chain().focus().toggleCode().run()
    },
  },
  {
    label: 'Code block',
    icon: SquareCode,
    isActive: (editor) => editor.isActive('codeBlock'),
    run: (editor) => {
      editor.chain().focus().toggleCodeBlock().run()
    },
  },
]

function RichTextFormatButtons({
  editor,
  disabled,
  codeBlocks,
}: {
  editor: Editor | null
  disabled: boolean
  codeBlocks: boolean
}) {
  const actions = codeBlocks ? [...FORMAT_ACTIONS, ...CODE_ACTIONS] : FORMAT_ACTIONS

  return actions.map(({ label, icon: Icon, isActive, run }) => (
    <Button
      key={label}
      variant="ghost"
      size="icon"
      className={cn('size-7', editor && isActive(editor) && 'bg-accent text-accent-foreground')}
      aria-label={label}
      aria-pressed={editor ? isActive(editor) : false}
      disabled={disabled || !editor}
      onClick={() => editor && run(editor)}
    >
      <Icon className="size-4" />
    </Button>
  ))
}

export interface RichTextEditorToolbarProps {
  editor: Editor | null
  disabled: boolean
  linkable: boolean
  codeBlocks: boolean
  isLinkPickerOpen: boolean
  editingLinkContext: RichTextLinkContext | null
  internalLinkOptions: RichTextLinkPickerInternalOption[]
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  linkPickerMode: RichTextLinkPickerValue['mode']
  onLinkPickerOpenChange: (open: boolean) => void
  onInsertLink: (value: RichTextLinkPickerValue) => void
  onLinkPickerCancel: () => void
  onRemoveLink?: () => void
}

export function RichTextEditorToolbar({
  editor,
  disabled,
  linkable,
  codeBlocks,
  isLinkPickerOpen,
  editingLinkContext,
  internalLinkOptions,
  contentTypeOptions,
  linkPickerMode,
  onLinkPickerOpenChange,
  onInsertLink,
  onLinkPickerCancel,
  onRemoveLink,
}: RichTextEditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border p-1">
      <RichTextFormatButtons editor={editor} disabled={disabled} codeBlocks={codeBlocks} />
      {linkable ? (
        <RichTextLinkPicker
          open={isLinkPickerOpen}
          onOpenChange={onLinkPickerOpenChange}
          initialValue={{
            mode: linkPickerMode,
            href: editingLinkContext?.href,
            displayText: editingLinkContext?.displayText,
            openInNewWindow: editingLinkContext?.openInNewWindow,
            metadata: editingLinkContext?.metadata,
          }}
          internalOptions={internalLinkOptions}
          contentTypeOptions={contentTypeOptions}
          onInsert={onInsertLink}
          onCancel={onLinkPickerCancel}
          onRemove={onRemoveLink}
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
  )
}
