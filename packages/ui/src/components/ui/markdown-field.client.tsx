'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Field } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { MarkdownContent } from './markdown-content'
import { RichTextContent } from './rich-text-content'
import { looksLikeRichTextHtml } from './rich-text-html'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.client'
import { Textarea } from './textarea.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'

const MARKDOWN_FIELD_TAB_WRITE = 'write'
const MARKDOWN_FIELD_TAB_PREVIEW = 'preview'
const MARKDOWN_PREVIEW_EMPTY = 'Nothing to preview'

export interface MarkdownFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  rows?: number
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

function MarkdownFieldPreview({ value }: { value: string }) {
  const trimmed = value.trim()
  if (trimmed === '') {
    return <p className="text-sm text-muted-foreground">{MARKDOWN_PREVIEW_EMPTY}</p>
  }

  if (looksLikeRichTextHtml(trimmed)) {
    return <RichTextContent html={trimmed} size="sm" />
  }

  return <MarkdownContent markdown={trimmed} size="sm" />
}

/**
 * Markdown editor with Write / Preview tabs. Legacy HTML values preview via
 * `RichTextContent` until re-saved as markdown.
 */
export function MarkdownField({
  id,
  label,
  error,
  hint,
  info,
  required,
  width,
  size = 'md',
  rows = 8,
  placeholder,
  disabled,
  value = '',
  onChange,
  onBlur,
}: MarkdownFieldProps) {
  const [tab, setTab] = React.useState(MARKDOWN_FIELD_TAB_WRITE)
  const previewId = `${id}-preview`

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
      <Field.Label>
        <FieldLabelContent label={label} info={info} />
      </Field.Label>
      <Field.Control>
        <Tabs value={tab} onValueChange={setTab} variant="line">
          <TabsList aria-label={`${label} mode`}>
            <TabsTrigger value={MARKDOWN_FIELD_TAB_WRITE}>Write</TabsTrigger>
            <TabsTrigger value={MARKDOWN_FIELD_TAB_PREVIEW}>Preview</TabsTrigger>
          </TabsList>
          <TabsContent value={MARKDOWN_FIELD_TAB_WRITE}>
            <Textarea
              aria-label={label}
              size={size}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              onBlur={onBlur}
              className={cn('font-mono')}
            />
          </TabsContent>
          <TabsContent value={MARKDOWN_FIELD_TAB_PREVIEW} id={previewId} aria-live="polite">
            <MarkdownFieldPreview value={value} />
          </TabsContent>
        </Tabs>
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
