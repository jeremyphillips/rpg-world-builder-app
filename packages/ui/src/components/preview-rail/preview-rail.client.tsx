'use client'

import * as React from 'react'
import { CheckCircle2, Circle, CircleAlert, CircleSlash } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion.client'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button.client'
import { ContentCardHeading } from '../ui/content-card-heading.client'
import { ContentCardMedia } from '../ui/content-card-parts.client'
import { contentCardMediaVariants } from '../ui/content-card.variants'
import { Heading } from '../ui/heading'
import { SemanticText } from '../ui/semantic-text/semantic-text'
import { StatusDot } from '../ui/status-dot'
import { Text } from '../ui/text'
import type {
  PreviewRailAvailability,
  PreviewRailChrome,
  PreviewRailFact,
  PreviewRailSectionMarker,
  PreviewRailStatusPanelVariant,
  PreviewRailStatusTone,
} from './preview-rail.types'
import {
  previewRailAccordionCardClasses,
  previewRailAccordionContentClasses,
  previewRailAccordionItemClasses,
  previewRailActionButtonClasses,
  previewRailActionStackClasses,
  previewRailAvailabilityDetailSeparatorClasses,
  previewRailAvailabilityInactiveIconClasses,
  previewRailAvailabilityRowClasses,
  previewRailDividerClasses,
  previewRailFactLabelClasses,
  previewRailFactValueClasses,
  previewRailFactsGridClasses,
  previewRailHeaderRowClasses,
  previewRailIdentityContentClasses,
  previewRailIdentityRowClasses,
  previewRailMediaFallbackVariants,
  previewRailMediaIconClasses,
  previewRailRootVariants,
  previewRailSectionBodyClasses,
  previewRailSectionBodyDescriptionClasses,
  previewRailSectionLabelClasses,
  previewRailSectionMarkerClasses,
  previewRailSectionMarkerToneClasses,
  previewRailSectionStatusSpacerClasses,
  previewRailSectionTriggerClasses,
  previewRailSectionsHeaderClasses,
  previewRailStatusPanelContentClasses,
  previewRailStatusPanelIconClasses,
} from './preview-rail.variants'

export type PreviewRailProps = React.ComponentPropsWithoutRef<'aside'> & {
  chrome?: PreviewRailChrome
  sticky?: boolean
}

function PreviewRailRoot({
  chrome = 'card',
  sticky = false,
  className,
  children,
  ...props
}: PreviewRailProps) {
  return (
    <aside className={cn(previewRailRootVariants({ chrome, sticky }), className)} {...props}>
      {children}
    </aside>
  )
}

export type PreviewRailHeaderProps = {
  title: React.ReactNode
  badge?: React.ReactNode
}

function PreviewRailHeader({ title, badge }: PreviewRailHeaderProps) {
  return (
    <div className={previewRailHeaderRowClasses}>
      <Heading variant="card" as="h2" className="min-w-0 truncate">
        {title}
      </Heading>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  )
}

export type PreviewRailDraftBadgeProps = {
  label?: string
}

function PreviewRailDraftBadge({ label = 'Draft' }: PreviewRailDraftBadgeProps) {
  return (
    <Badge appearance="soft" tone="warning" size="sm">
      {label}
    </Badge>
  )
}

export type PreviewRailMediaProps = {
  imageSrc?: string
  imageAlt?: string
  fallbackIcon?: React.ReactNode
}

function PreviewRailMedia({ imageSrc, imageAlt = '', fallbackIcon }: PreviewRailMediaProps) {
  if (imageSrc) {
    return (
      <ContentCardMedia
        src={imageSrc}
        alt={imageAlt}
        className={contentCardMediaVariants({ density: 'comfortable' })}
      />
    )
  }

  return (
    <div className={previewRailMediaFallbackVariants()}>
      <span className={previewRailMediaIconClasses} aria-hidden>
        {fallbackIcon}
      </span>
    </div>
  )
}

export type PreviewRailAvailabilityLineProps = PreviewRailAvailability

function PreviewRailAvailabilityLine({
  available,
  statusLabel,
  detail,
}: PreviewRailAvailabilityLineProps) {
  return (
    <p className={previewRailAvailabilityRowClasses}>
      {available ? (
        <StatusDot tone="success" size="sm" />
      ) : (
        <CircleSlash aria-hidden className={previewRailAvailabilityInactiveIconClasses} />
      )}
      <span className="font-medium text-foreground">{statusLabel}</span>
      {detail ? (
        <>
          <span aria-hidden className={previewRailAvailabilityDetailSeparatorClasses}>
            ·
          </span>
          <span className="truncate">{detail}</span>
        </>
      ) : null}
    </p>
  )
}

export type PreviewRailIdentityProps = {
  media?: React.ReactNode
  name: React.ReactNode
  availability: PreviewRailAvailability
  facts?: PreviewRailFact[]
}

function PreviewRailIdentity({ media, name, availability, facts }: PreviewRailIdentityProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className={previewRailIdentityRowClasses}>
        {media}
        <div className={previewRailIdentityContentClasses}>
          <ContentCardHeading heading={name} density="comfortable" />
          <PreviewRailAvailabilityLine {...availability} />
        </div>
      </div>
      {facts && facts.length > 0 ? (
        <>
          <div className={previewRailDividerClasses} />
          <PreviewRailFacts facts={facts} />
          <div className={previewRailDividerClasses} />
        </>
      ) : null}
    </div>
  )
}

export type PreviewRailFactsProps = {
  facts: PreviewRailFact[]
}

function PreviewRailFacts({ facts }: PreviewRailFactsProps) {
  return (
    <dl className={previewRailFactsGridClasses}>
      {facts.map((fact) => (
        <React.Fragment key={fact.label}>
          <Text as="dt" variant="muted" className={previewRailFactLabelClasses}>
            {fact.label}
          </Text>
          <Text as="dd" className={previewRailFactValueClasses}>
            {fact.value}
          </Text>
        </React.Fragment>
      ))}
    </dl>
  )
}

export type PreviewRailSectionsProps = {
  title?: string
  description?: string
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  children: React.ReactNode
}

function PreviewRailSections({
  title = 'Sections',
  description,
  value,
  onValueChange,
  defaultValue,
  children,
}: PreviewRailSectionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className={previewRailSectionsHeaderClasses}>
        <Heading variant="subsection" as="h3">
          {title}
        </Heading>
        {description ? <Text variant="small">{description}</Text> : null}
      </div>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        className={previewRailAccordionCardClasses}
      >
        {children}
      </Accordion>
    </div>
  )
}

export type PreviewRailSectionProps = {
  id: string
  label: string
  marker?: PreviewRailSectionMarker
  status?: string
  statusTone?: PreviewRailStatusTone
  children?: React.ReactNode
}

function PreviewRailSectionMarker({ marker }: { marker: PreviewRailSectionMarker }) {
  const className = cn(previewRailSectionMarkerClasses, previewRailSectionMarkerToneClasses[marker])

  if (marker === 'complete') {
    return <CheckCircle2 aria-hidden className={className} />
  }

  if (marker === 'attention') {
    return <CircleAlert aria-hidden className={className} />
  }

  return <CircleSlash aria-hidden className={className} />
}

function PreviewRailSectionStatus({
  status,
  statusTone = 'neutral',
}: {
  status: string
  statusTone?: PreviewRailStatusTone
}) {
  const emphasis = statusTone === 'neutral' ? 'low' : 'medium'

  return (
    <SemanticText tone={statusTone} emphasis={emphasis} className="shrink-0">
      {status}
    </SemanticText>
  )
}

function PreviewRailSection({
  id,
  label,
  marker,
  status,
  statusTone,
  children,
}: PreviewRailSectionProps) {
  return (
    <AccordionItem value={id} className={previewRailAccordionItemClasses}>
      <AccordionTrigger className={previewRailSectionTriggerClasses}>
        {marker ? <PreviewRailSectionMarker marker={marker} /> : null}
        <span className={previewRailSectionLabelClasses}>{label}</span>
        <span className={previewRailSectionStatusSpacerClasses} />
        {status ? <PreviewRailSectionStatus status={status} statusTone={statusTone} /> : null}
      </AccordionTrigger>
      {children ? (
        <AccordionContent className={previewRailAccordionContentClasses}>
          {children}
        </AccordionContent>
      ) : null}
    </AccordionItem>
  )
}

export type PreviewRailSectionBodyProps = {
  description?: React.ReactNode
  facts?: PreviewRailFact[]
  children?: React.ReactNode
}

function PreviewRailSectionBody({ description, facts, children }: PreviewRailSectionBodyProps) {
  return (
    <div className={previewRailSectionBodyClasses}>
      {description ? (
        <p className={previewRailSectionBodyDescriptionClasses}>{description}</p>
      ) : null}
      {facts && facts.length > 0 ? <PreviewRailFacts facts={facts} /> : null}
      {children}
    </div>
  )
}

function resolveStatusPanelIcon(variant: PreviewRailStatusPanelVariant) {
  if (variant === 'success') {
    return (
      <CheckCircle2
        aria-hidden
        className={cn(previewRailStatusPanelIconClasses, 'text-semantic-success')}
      />
    )
  }

  if (variant === 'warning') {
    return (
      <CircleAlert
        aria-hidden
        className={cn(previewRailStatusPanelIconClasses, 'text-semantic-warning')}
      />
    )
  }

  return (
    <Circle
      aria-hidden
      className={cn(previewRailStatusPanelIconClasses, 'text-muted-foreground')}
    />
  )
}

export type PreviewRailStatusPanelProps = {
  variant: PreviewRailStatusPanelVariant
  title: string
  description?: string
  icon?: React.ReactNode
}

function PreviewRailStatusPanel({
  variant,
  title,
  description,
  icon,
}: PreviewRailStatusPanelProps) {
  const resolvedIcon = icon ?? resolveStatusPanelIcon(variant)

  return (
    <Alert variant={variant}>
      <div className="flex w-full items-start gap-3">
        {resolvedIcon}
        <div className={previewRailStatusPanelContentClasses}>
          <p className="font-body-emphasis text-foreground">{title}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </Alert>
  )
}

export type PreviewRailActionProps = {
  label: string
  helperText?: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

function PreviewRailAction({ label, helperText, icon, onClick, disabled }: PreviewRailActionProps) {
  return (
    <div className={previewRailActionStackClasses}>
      <Button
        type="button"
        variant="outline"
        className={previewRailActionButtonClasses}
        onClick={onClick}
        disabled={disabled}
      >
        {icon ? <span aria-hidden>{icon}</span> : null}
        {label}
      </Button>
      {helperText ? <Text variant="small">{helperText}</Text> : null}
    </div>
  )
}

export const PreviewRail = Object.assign(PreviewRailRoot, {
  Header: PreviewRailHeader,
  DraftBadge: PreviewRailDraftBadge,
  Media: PreviewRailMedia,
  AvailabilityLine: PreviewRailAvailabilityLine,
  Identity: PreviewRailIdentity,
  Facts: PreviewRailFacts,
  Sections: PreviewRailSections,
  Section: PreviewRailSection,
  SectionBody: PreviewRailSectionBody,
  StatusPanel: PreviewRailStatusPanel,
  Action: PreviewRailAction,
})

export {
  PreviewRailRoot,
  PreviewRailHeader,
  PreviewRailDraftBadge,
  PreviewRailMedia,
  PreviewRailAvailabilityLine,
  PreviewRailIdentity,
  PreviewRailFacts,
  PreviewRailSections,
  PreviewRailSection,
  PreviewRailSectionBody,
  PreviewRailStatusPanel,
  PreviewRailAction,
}
