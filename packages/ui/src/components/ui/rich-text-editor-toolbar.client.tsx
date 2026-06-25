'use client'

import type { Editor } from '@tiptap/react'
import type { LucideIcon } from 'lucide-react'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from 'lucide-react'

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

function RichTextFormatButtons({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
  return FORMAT_ACTIONS.map(({ label, icon: Icon, isActive, run }) => (
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
      <RichTextFormatButtons editor={editor} disabled={disabled} />
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
