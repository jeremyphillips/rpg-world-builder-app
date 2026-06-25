'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Search, X } from 'lucide-react'

import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import { Input } from './input.client'
import { RichTextLinkPreviewCard } from './rich-text-link-preview-card.client'
import {
  buildExternalLinkPickerValue,
  buildInternalLinkPickerValue,
  filterInternalLinkOptions,
  isLinkPickerInsertDisabled,
  resolveLinkPickerFormState,
} from './rich-text-link-picker.lib'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerProps,
  RichTextLinkTab,
} from './rich-text-link-picker.types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.client'

export type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
  RichTextLinkPickerProps,
  RichTextLinkPickerValue,
} from './rich-text-link-picker.types'

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

  const filteredInternalOptions = React.useMemo(
    () => filterInternalLinkOptions(internalOptions, contentType, searchQuery),
    [contentType, internalOptions, searchQuery],
  )

  React.useEffect(() => {
    if (!open) return

    const nextState = resolveLinkPickerFormState(initialValue, internalOptions, defaultContentType)
    setTab(nextState.tab)
    setSearchQuery(nextState.searchQuery)
    setContentType(nextState.contentType)
    setSelectedOptionId(nextState.selectedOptionId)
    setInternalDisplayText(nextState.internalDisplayText)
    setInternalOpenInNewWindow(nextState.internalOpenInNewWindow)
    setExternalHref(nextState.externalHref)
    setExternalDisplayText(nextState.externalDisplayText)
    setExternalOpenInNewWindow(nextState.externalOpenInNewWindow)
  }, [defaultContentType, initialValue, internalOptions, open])

  const handleCancel = React.useCallback(() => {
    onOpenChange(false)
    onCancel?.()
  }, [onCancel, onOpenChange])

  const handleInsert = React.useCallback(() => {
    if (tab === 'internal') {
      if (!selectedInternalOption || internalDisplayText.trim().length === 0) return
      onInsert(
        buildInternalLinkPickerValue(
          selectedInternalOption,
          internalDisplayText,
          internalOpenInNewWindow,
        ),
      )
      onOpenChange(false)
      return
    }

    if (externalHref.trim().length === 0 || externalDisplayText.trim().length === 0) return
    onInsert(
      buildExternalLinkPickerValue(externalHref, externalDisplayText, externalOpenInNewWindow),
    )
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

  const isInsertDisabled = isLinkPickerInsertDisabled(
    tab,
    selectedInternalOption,
    internalDisplayText,
    externalHref,
    externalDisplayText,
  )

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

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as RichTextLinkTab)}
            variant="pill"
          >
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
                <RichTextLinkPreviewCard
                  tone="selected"
                  title={selectedInternalOption.title}
                  contentType={selectedInternalOption.contentType}
                  sourceLabel={selectedInternalOption.sourceLabel}
                  onClear={() => setSelectedOptionId(null)}
                />
              ) : (
                <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-border p-1">
                  {filteredInternalOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">
                      {EMPTY_SEARCH_MESSAGE}
                    </p>
                  ) : (
                    filteredInternalOptions.map((option) => (
                      <RichTextLinkPreviewCard
                        key={option.id}
                        title={option.title}
                        contentType={option.contentType}
                        sourceLabel={option.sourceLabel}
                        interactive
                        tone={selectedOptionId === option.id ? 'selected' : 'default'}
                        onSelect={() => {
                          setSelectedOptionId(option.id)
                          if (internalDisplayText.trim().length === 0) {
                            setInternalDisplayText(option.title)
                          }
                        }}
                      />
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
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleInsert}
                disabled={isInsertDisabled}
              >
                Insert
              </Button>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
