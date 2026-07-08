'use client'

import * as React from 'react'

import { Eyebrow } from './eyebrow'
import { Heading } from './heading'
import { headingVariants } from './heading.variants'
import { RichTextContent } from './rich-text-content'
import { Sheet } from './sheet.client'
import { Text } from './text'
import { InfoTooltip } from './tooltip.client'
import {
  builderOptionDetailsMetadataListVariants,
  builderOptionDetailsSectionVariants,
  type BuilderOptionPrimaryActionPlacement,
} from './builder-option-details-sheet.variants'

export type BuilderOptionDetailsMetadata = {
  label: string
  value: React.ReactNode
}

export type BuilderOptionDetailsSectionItem = {
  title: string
  body?: React.ReactNode
  /** Level-grouped grant summary lines rendered below the title. */
  summaryLines?: string[]
  metadata?: string[]
  optionPool?: {
    summary: string
    optionLabels: string[]
  }
}

export type BuilderOptionDetailsSection = {
  title: string
  description?: React.ReactNode
  items?: BuilderOptionDetailsSectionItem[]
}

export type BuilderOptionDetailsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  eyebrow?: string
  /** HTML string rendered with RichTextContent when present. */
  descriptionHtml?: string
  metadata?: BuilderOptionDetailsMetadata[]
  sections?: BuilderOptionDetailsSection[]
  primaryAction?: React.ReactNode
  /** Where to render `primaryAction`. Defaults to `header`. */
  primaryActionPlacement?: BuilderOptionPrimaryActionPlacement
}

function MetadataRow({ label, value }: BuilderOptionDetailsMetadata) {
  return (
    <Text variant="emphasis" as="p">
      <Text variant="emphasis" as="span">
        {label}
      </Text>
      :{' '}
      <Text variant="muted" as="span">
        {value}
      </Text>
    </Text>
  )
}

function SectionItem({ item }: { item: BuilderOptionDetailsSectionItem }) {
  return (
    <li className="space-y-1">
      <Heading variant="subsection" as="h3">
        {item.title}
      </Heading>
      {item.summaryLines && item.summaryLines.length > 0 ? (
        item.summaryLines.map((line, index) => (
          <Text
            key={`${item.title}-summary-${index}`}
            variant="small"
            className="text-muted-foreground"
          >
            {line}
          </Text>
        ))
      ) : item.metadata && item.metadata.length > 0 ? (
        <Text variant="small" className="text-muted-foreground">
          {item.metadata.join(' · ')}
        </Text>
      ) : null}
      {item.optionPool ? (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
          <Text variant="muted" as="span">
            {item.optionPool.summary}
          </Text>
          <InfoTooltip aria-label={`${item.title} options`}>
            {item.optionPool.optionLabels.join(', ')}
          </InfoTooltip>
        </div>
      ) : item.summaryLines && item.summaryLines.length > 0 ? null : item.body ? (
        typeof item.body === 'string' ? (
          <RichTextContent html={item.body} size="md" tone="muted" />
        ) : (
          item.body
        )
      ) : null}
    </li>
  )
}

function DetailsSection({ section }: { section: BuilderOptionDetailsSection }) {
  const hasItems = section.items && section.items.length > 0

  return (
    <section className={builderOptionDetailsSectionVariants()}>
      <Heading variant="sheetSection" as="h2" className="mb-2">
        {section.title}
      </Heading>
      {section.description ? (
        typeof section.description === 'string' ? (
          <RichTextContent html={section.description} size="md" tone="muted" className="mb-4" />
        ) : (
          <div className="mb-4">{section.description}</div>
        )
      ) : null}
      {hasItems ? (
        <ul className="space-y-4" role="list">
          {section.items!.map((item) => (
            <SectionItem key={item.title} item={item} />
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/**
 * Reusable detail sheet for character builder option cards (species, class, …).
 */
export function BuilderOptionDetailsSheet({
  open,
  onOpenChange,
  title,
  eyebrow,
  descriptionHtml,
  metadata,
  sections,
  primaryAction,
  primaryActionPlacement = 'header',
}: BuilderOptionDetailsSheetProps) {
  const visibleMetadata = metadata?.filter((row) => row.value != null && row.value !== '')
  const visibleSections = sections?.filter(
    (section) => section.description || (section.items && section.items.length > 0),
  )
  const showHeaderAction = primaryAction != null && primaryActionPlacement === 'header'

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content
        aria-describedby={descriptionHtml ? 'builder-option-details-description' : undefined}
      >
        <Sheet.Header
          kicker={eyebrow ? <Eyebrow size="xs">{eyebrow}</Eyebrow> : undefined}
          headline={title}
          headlineClassName={headingVariants({ variant: 'sheetTitle' })}
          endSlot={showHeaderAction ? primaryAction : undefined}
        />
        <Sheet.Body className="space-y-6">
          {visibleMetadata && visibleMetadata.length > 0 ? (
            <div className={builderOptionDetailsMetadataListVariants()}>
              {visibleMetadata.map((row) => (
                <MetadataRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          ) : null}
          {descriptionHtml ? (
            <RichTextContent
              id="builder-option-details-description"
              html={descriptionHtml}
              size="md"
              tone="muted"
            />
          ) : null}
          {visibleSections?.map((section) => (
            <DetailsSection key={section.title} section={section} />
          ))}
        </Sheet.Body>
        {primaryAction && primaryActionPlacement === 'footer' ? (
          <Sheet.Footer>{primaryAction}</Sheet.Footer>
        ) : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
