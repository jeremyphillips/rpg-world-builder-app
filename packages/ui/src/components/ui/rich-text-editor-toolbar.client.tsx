'use client'

import type { Editor } from '@tiptap/react'
import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Icon } from './icon/icon'
import type { IconName } from './icon/icon.types'
import { RichTextLinkPicker } from './rich-text-link-picker.client'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
  RichTextLinkPickerValue,
} from './rich-text-link-picker.types'
import type { RichTextLinkContext } from './rich-text-editor-link.lib'

interface RichTextFormatAction {
  label: string
  icon: IconName
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const FORMAT_ACTIONS: RichTextFormatAction[] = [
  {
    label: 'Bold',
    icon: 'bold',
    isActive: (editor) => editor.isActive('bold'),
    run: (editor) => {
      editor.chain().focus().toggleBold().run()
    },
  },
  {
    label: 'Italic',
    icon: 'italic',
    isActive: (editor) => editor.isActive('italic'),
    run: (editor) => {
      editor.chain().focus().toggleItalic().run()
    },
  },
  {
    label: 'Bulleted list',
    icon: 'list',
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    label: 'Ordered list',
    icon: 'list-ordered',
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
]

const CODE_ACTIONS: RichTextFormatAction[] = [
  {
    label: 'Inline code',
    icon: 'code',
    isActive: (editor) => editor.isActive('code'),
    run: (editor) => {
      editor.chain().focus().toggleCode().run()
    },
  },
  {
    label: 'Code block',
    icon: 'square-code',
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

  return actions.map(({ label, icon, isActive, run }) => (
    <Button
      key={label}
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', editor && isActive(editor) && 'bg-accent text-accent-foreground')}
      aria-label={label}
      aria-pressed={editor ? isActive(editor) : false}
      disabled={disabled || !editor}
      onClick={() => editor && run(editor)}
    >
      <Icon name={icon} size="lg" />
    </Button>
  ))
}

export interface RichTextEditorToolbarProps {
  editor: Editor | null
  disabled: boolean
  linkable: boolean
  codeBlocks: boolean
  tables: boolean
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
  tables,
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
      {tables ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Table"
          disabled={disabled || !editor}
          onClick={() => editor?.commands.beginTableEmbedCreate()}
        >
          <Icon name="table" size="lg" />
        </Button>
      ) : null}
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
                'h-7 w-7',
                editor?.isActive('link') && 'bg-accent text-accent-foreground',
              )}
              aria-label="Link"
              aria-pressed={editor?.isActive('link') ?? false}
              disabled={disabled || !editor}
            >
              <Icon name="link" size="lg" />
            </Button>
          }
        />
      ) : null}
    </div>
  )
}
