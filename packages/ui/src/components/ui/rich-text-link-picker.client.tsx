'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Search, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import { Input } from './input.client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select.client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.client'

type RichTextLinkTab = 'internal' | 'external'
type RichTextLinkKind = 'detail' | 'overview' | 'external'

export interface RichTextLinkPickerInternalOption {
  id: string
  title: string
  href: string
  contentType: string
  kind: Exclude<RichTextLinkKind, 'external'>
  subtitle?: string
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
  trigger: React.ReactElement
  onInsert: (value: RichTextLinkPickerValue) => void
  onCancel?: () => void
  onRemove?: () => void
  initialValue?: Partial<RichTextLinkPickerValue>
  internalOptions?: RichTextLinkPickerInternalOption[]
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  heading?: string
}

const DEFAULT_CONTENT_TYPE_OPTIONS: RichTextLinkPickerContentTypeOption[] = [
  { value: 'spell', label: 'Spells' },
  { value: 'feat', label: 'Feats' },
]

const EMPTY_SEARCH_MESSAGE = 'No content matches your search.'

export function RichTextLinkPicker({
  open,
  onOpenChange,
  trigger,
  onInsert,
  onCancel,
  onRemove,
  initialValue,
  internalOptions = [],
  contentTypeOptions = DEFAULT_CONTENT_TYPE_OPTIONS,
  heading = 'Insert link',
}: RichTextLinkPickerProps) {
  const defaultContentType = contentTypeOptions[0]?.value ?? 'spell'
  const [tab, setTab] = React.useState<RichTextLinkTab>('internal')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [contentType, setContentType] = React.useState(defaultContentType)
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null)
  const [internalDisplayText, setInternalDisplayText] = React.useState('')
  const [externalHref, setExternalHref] = React.useState('')
  const [externalDisplayText, setExternalDisplayText] = React.useState('')
  const [internalOpenInNewWindow, setInternalOpenInNewWindow] = React.useState(false)
  const [externalOpenInNewWindow, setExternalOpenInNewWindow] = React.useState(true)

  const selectedInternalOption = React.useMemo(
    () => internalOptions.find((option) => option.id === selectedOptionId) ?? null,
    [internalOptions, selectedOptionId],
  )

  const filteredInternalOptions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return internalOptions.filter((option) => {
      if (option.contentType !== contentType) return false
      if (!query) return true
      return [option.title, option.subtitle, option.href].some((value) =>
        value?.toLowerCase().includes(query),
      )
    })
  }, [contentType, internalOptions, searchQuery])

  React.useEffect(() => {
    if (!open) return

    const nextMode: RichTextLinkTab = initialValue?.mode ?? 'internal'
    const nextContentType = initialValue?.metadata?.contentType ?? defaultContentType
    const selectedOption =
      internalOptions.find((option) => {
        if (
          initialValue?.metadata?.contentId &&
          option.id === initialValue.metadata.contentId &&
          option.contentType === nextContentType
        ) {
          return true
        }
        return initialValue?.href ? option.href === initialValue.href : false
      }) ?? null

    setTab(nextMode)
    setSearchQuery('')
    setContentType(nextContentType)
    setSelectedOptionId(selectedOption?.id ?? null)
    setInternalDisplayText(
      initialValue?.displayText ?? selectedOption?.title ?? initialValue?.metadata?.contentTitle ?? '',
    )
    setInternalOpenInNewWindow(initialValue?.openInNewWindow ?? false)

    setExternalHref(nextMode === 'external' ? (initialValue?.href ?? '') : '')
    setExternalDisplayText(nextMode === 'external' ? (initialValue?.displayText ?? '') : '')
    setExternalOpenInNewWindow(
      nextMode === 'external' ? (initialValue?.openInNewWindow ?? true) : true,
    )
  }, [defaultContentType, initialValue, internalOptions, open])

  const handleCancel = React.useCallback(() => {
    onOpenChange(false)
    onCancel?.()
  }, [onCancel, onOpenChange])

  const handleInsert = React.useCallback(() => {
    if (tab === 'internal') {
      if (!selectedInternalOption || internalDisplayText.trim().length === 0) return
      onInsert({
        mode: 'internal',
        href: selectedInternalOption.href,
        displayText: internalDisplayText.trim(),
        openInNewWindow: internalOpenInNewWindow,
        metadata: {
          contentType: selectedInternalOption.contentType,
          contentId: selectedInternalOption.id,
          contentTitle: selectedInternalOption.title,
          linkKind: selectedInternalOption.kind,
        },
      })
      onOpenChange(false)
      return
    }

    if (externalHref.trim().length === 0 || externalDisplayText.trim().length === 0) return
    onInsert({
      mode: 'external',
      href: externalHref.trim(),
      displayText: externalDisplayText.trim(),
      openInNewWindow: externalOpenInNewWindow,
      metadata: { linkKind: 'external' },
    })
    onOpenChange(false)
  }, [
    externalDisplayText,
    externalHref,
    externalOpenInNewWindow,
    internalDisplayText,
    internalOpenInNewWindow,
    onInsert,
    onOpenChange,
    selectedInternalOption,
    tab,
  ])

  const isInsertDisabled =
    tab === 'internal'
      ? !selectedInternalOption || internalDisplayText.trim().length === 0
      : externalHref.trim().length === 0 || externalDisplayText.trim().length === 0

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          align="end"
          className="z-50 w-[28rem] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">{heading}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Close link picker"
              onClick={handleCancel}
            >
              <X className="size-4" />
            </Button>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as RichTextLinkTab)} variant="pill">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internal">Internal</TabsTrigger>
              <TabsTrigger value="external">External</TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search content"
                    aria-label="Search internal content"
                    size="sm"
                    className="pl-8"
                  />
                </div>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger size="sm" aria-label="Filter content type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInternalOption ? (
                <div className="rounded-md border border-border bg-muted/30 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {selectedInternalOption.contentType}
                      </p>
                      <p className="truncate text-sm font-medium">{selectedInternalOption.title}</p>
                      {selectedInternalOption.subtitle ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {selectedInternalOption.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      aria-label="Clear selected internal link"
                      onClick={() => setSelectedOptionId(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-border p-1">
                  {filteredInternalOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">{EMPTY_SEARCH_MESSAGE}</p>
                  ) : (
                    filteredInternalOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedOptionId(option.id)
                          if (internalDisplayText.trim().length === 0) {
                            setInternalDisplayText(option.title)
                          }
                        }}
                        className={cn(
                          'flex w-full cursor-pointer flex-col rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                          selectedOptionId === option.id && 'bg-accent text-accent-foreground',
                        )}
                      >
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {option.contentType}
                        </span>
                        <span className="truncate font-medium">{option.title}</span>
                        {option.subtitle ? (
                          <span className="truncate text-xs text-muted-foreground">{option.subtitle}</span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              )}

              <Input
                value={internalDisplayText}
                onChange={(event) => setInternalDisplayText(event.target.value)}
                placeholder="Display text"
                aria-label="Internal display text"
                size="sm"
                required
              />

              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={internalOpenInNewWindow}
                  onCheckedChange={(checked) => setInternalOpenInNewWindow(Boolean(checked))}
                  aria-label="Open internal link in new window"
                />
                Open link in new window
              </label>
            </TabsContent>

            <TabsContent value="external" className="space-y-3">
              <Input
                value={externalHref}
                onChange={(event) => setExternalHref(event.target.value)}
                placeholder="https://example.com"
                aria-label="External URL"
                size="sm"
                required
              />
              <Input
                value={externalDisplayText}
                onChange={(event) => setExternalDisplayText(event.target.value)}
                placeholder="Display text"
                aria-label="External display text"
                size="sm"
                required
              />
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={externalOpenInNewWindow}
                  onCheckedChange={(checked) => setExternalOpenInNewWindow(Boolean(checked))}
                  aria-label="Open external link in new window"
                />
                Open link in new window
              </label>
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div>
              {onRemove ? (
                <Button type="button" variant="outline" size="sm" onClick={onRemove}>
                  Remove link
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" variant="default" size="sm" onClick={handleInsert} disabled={isInsertDisabled}>
                Insert
              </Button>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
