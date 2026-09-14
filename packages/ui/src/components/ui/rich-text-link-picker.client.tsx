'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Search, X } from 'lucide-react'

import { Button } from './button.client'
import { cn } from '../../lib/utils'
import { portalPopoverSurfaceClasses } from './surface-current.lib'
import { Checkbox } from './checkbox.client'
import { Input } from './input.client'
import { ListResultEmpty, ListResultList } from './list-result-list.client'
import { ListResultItem } from './list-result-item.client'
import { ListResultToolbar } from './list-result-toolbar.client'
import { ListResultViewport } from './list-result-viewport.client'
import {
  buildExternalLinkPickerValue,
  buildInternalLinkPickerValue,
  filterInternalLinkOptions,
  isLinkPickerInsertDisabled,
  RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL,
  RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL_LABEL,
  resolveLinkPickerFormState,
} from './rich-text-link-picker.lib'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerProps,
  RichTextLinkPickerValue,
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

function resolveInternalLinkClassification(contentType: string, eyebrowLabel?: string): string {
  if (eyebrowLabel) return eyebrowLabel
  if (contentType.toLowerCase() === 'spell') return 'Spell'
  if (contentType.toLowerCase() === 'feat') return 'Feat'
  return contentType.charAt(0).toUpperCase() + contentType.slice(1)
}

function serializeLinkPickerInitialValue(
  initialValue: Partial<RichTextLinkPickerValue> | undefined,
): string {
  return JSON.stringify(initialValue ?? {})
}

interface RichTextLinkPickerFormProps {
  initialValue?: Partial<RichTextLinkPickerValue>
  internalOptions: RichTextLinkPickerProps['internalOptions']
  contentTypeOptions: RichTextLinkPickerContentTypeOption[]
  heading: string
  headingId: string
  onOpenChange: (open: boolean) => void
  onInsert: (value: RichTextLinkPickerValue) => void
  onCancel?: () => void
  onRemove?: () => void
}

function RichTextLinkPickerForm({
  initialValue,
  internalOptions = [],
  contentTypeOptions,
  heading,
  headingId,
  onOpenChange,
  onInsert,
  onCancel,
  onRemove,
}: RichTextLinkPickerFormProps) {
  const [tab, setTab] = React.useState<RichTextLinkTab>(
    () => resolveLinkPickerFormState(initialValue, internalOptions).tab,
  )
  const [searchQuery, setSearchQuery] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).searchQuery,
  )
  const [contentType, setContentType] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).contentType,
  )
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(
    () => resolveLinkPickerFormState(initialValue, internalOptions).selectedOptionId,
  )
  const [internalDisplayText, setInternalDisplayText] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).internalDisplayText,
  )
  const [externalHref, setExternalHref] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).externalHref,
  )
  const [externalDisplayText, setExternalDisplayText] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).externalDisplayText,
  )
  const [internalOpenInNewWindow, setInternalOpenInNewWindow] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).internalOpenInNewWindow,
  )
  const [externalOpenInNewWindow, setExternalOpenInNewWindow] = React.useState(
    () => resolveLinkPickerFormState(initialValue, internalOptions).externalOpenInNewWindow,
  )

  const selectedInternalOption = React.useMemo(
    () => internalOptions.find((option) => option.id === selectedOptionId) ?? null,
    [internalOptions, selectedOptionId],
  )

  const filteredInternalOptions = React.useMemo(
    () => filterInternalLinkOptions(internalOptions, contentType, searchQuery),
    [contentType, internalOptions, searchQuery],
  )

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
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id={headingId} className="text-sm font-semibold">
          {heading}
        </h2>
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
          <div className="overflow-hidden rounded-md border border-border">
            <ListResultToolbar
              search={
                <div className="relative flex h-8 w-full items-center">
                  <Search className="pointer-events-none absolute left-0 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search content"
                    aria-label="Search internal content"
                    size="sm"
                    className="border-0 bg-transparent pl-6 shadow-none"
                  />
                </div>
              }
              filter={
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger size="sm" aria-label="Filter by content type">
                    <SelectValue placeholder={RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL_LABEL} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL}>
                      {RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL_LABEL}
                    </SelectItem>
                    {contentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <ListResultViewport className="max-h-40">
              {selectedInternalOption ? (
                <ListResultList>
                  <ListResultItem
                    name={selectedInternalOption.title}
                    classification={resolveInternalLinkClassification(
                      selectedInternalOption.contentType,
                      selectedInternalOption.eyebrowLabel,
                    )}
                    metadata={selectedInternalOption.sourceLabel}
                    selected
                    trailingAction={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Clear selected internal link"
                        onClick={() => setSelectedOptionId(null)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    }
                  />
                </ListResultList>
              ) : (
                <ListResultList>
                  {filteredInternalOptions.length === 0 ? (
                    <ListResultEmpty>{EMPTY_SEARCH_MESSAGE}</ListResultEmpty>
                  ) : (
                    filteredInternalOptions.map((option) => (
                      <ListResultItem
                        key={option.id}
                        name={option.title}
                        classification={resolveInternalLinkClassification(
                          option.contentType,
                          option.eyebrowLabel,
                        )}
                        metadata={option.sourceLabel}
                        selected={selectedOptionId === option.id}
                        asChild
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOptionId(option.id)
                            if (internalDisplayText.trim().length === 0) {
                              setInternalDisplayText(option.title)
                            }
                          }}
                        />
                      </ListResultItem>
                    ))
                  )}
                </ListResultList>
              )}
            </ListResultViewport>
          </div>

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
    </>
  )
}

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
  const headingId = React.useId()
  const formKey = serializeLinkPickerInitialValue(initialValue)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          align="end"
          aria-labelledby={open ? headingId : undefined}
          className={cn(
            'z-50 w-[28rem] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none',
            portalPopoverSurfaceClasses,
          )}
        >
          {open ? (
            <RichTextLinkPickerForm
              key={formKey}
              initialValue={initialValue}
              internalOptions={internalOptions}
              contentTypeOptions={contentTypeOptions}
              heading={heading}
              headingId={headingId}
              onOpenChange={onOpenChange}
              onInsert={onInsert}
              onCancel={onCancel}
              onRemove={onRemove}
            />
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
