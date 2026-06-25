import type { ReactElement } from 'react'

export type RichTextLinkTab = 'internal' | 'external'
export type RichTextLinkKind = 'detail' | 'overview' | 'external'

export interface RichTextLinkPickerInternalOption {
  id: string
  title: string
  href: string
  contentType: string
  kind: Exclude<RichTextLinkKind, 'external'>
  sourceLabel?: string
}

export interface RichTextLinkPickerContentTypeOption {
  value: string
  label: string
}

export interface RichTextLinkPickerValue {
  mode: RichTextLinkTab
  href: string
  displayText: string
  openInNewWindow: boolean
  metadata?: {
    contentType?: string
    contentId?: string
    contentTitle?: string
    linkKind?: RichTextLinkKind
  }
}

export interface RichTextLinkPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
  onInsert: (value: RichTextLinkPickerValue) => void
  onCancel?: () => void
  onRemove?: () => void
  initialValue?: Partial<RichTextLinkPickerValue>
  internalOptions?: RichTextLinkPickerInternalOption[]
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  heading?: string
}
