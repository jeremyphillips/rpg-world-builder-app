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
import { alertTitleVariants } from '../ui/alert.variants'
import { ScrollBoundaryRegion } from '../ui/scroll-boundary-region.client'
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
  previewRailActionHelperTextClasses,
  previewRailActionStackClasses,
  previewRailAvailabilityDetailSeparatorClasses,
  previewRailAvailabilityInactiveIconClasses,
  previewRailAvailabilityRowClasses,
  previewRailDividerClasses,
  previewRailFooterClasses,
  previewRailFooterSectionShellClasses,
  previewRailFactCompactTextClasses,
  previewRailFactLabelClasses,
  previewRailFactValueClasses,
  previewRailFactsGridClasses,
  previewRailFactsGridCompactClasses,
  previewRailHeaderRowClasses,
  previewRailHeaderSectionContentClasses,
  previewRailHeaderSectionShellClasses,
  previewRailIdentityContentClasses,
  previewRailIdentityRowClasses,
  previewRailIdentitySectionContentClasses,
  previewRailIdentitySectionShellClasses,
  previewRailIdentityStackClasses,
  previewRailScrollRegionContentClasses,
  previewRailScrollRegionShellClasses,
  previewRailMediaFallbackVariants,
  previewRailMediaIconClasses,
  previewRailRootVariants,
  previewRailSectionBodyClasses,
  previewRailSectionBodyDescriptionClasses,
  previewRailSectionInsetVariants,
  previewRailSectionLabelClasses,
  previewRailSectionMarkerClasses,
  previewRailSectionMarkerToneClasses,
  previewRailSectionStatusSpacerClasses,
  previewRailSectionTriggerClasses,
  previewRailCaptionTextClasses,
  previewRailSectionsHeaderClasses,
  previewRailStatusPanelContentClasses,
  previewRailStatusPanelDescriptionClasses,
  previewRailStatusPanelIconClasses,
} from './preview-rail.variants'

const PreviewRailContext = React.createContext<PreviewRailChrome>('card')

function usePreviewRailChrome() {
  return React.useContext(PreviewRailContext)
}

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
    <PreviewRailContext.Provider value={chrome}>
      <aside className={cn(previewRailRootVariants({ chrome, sticky }), className)} {...props}>
        {children}
      </aside>
    </PreviewRailContext.Provider>
  )
}

export type PreviewRailHeaderProps = {
  title: React.ReactNode
  badge?: React.ReactNode
}

function PreviewRailHeader({ title, badge }: PreviewRailHeaderProps) {
  const chrome = usePreviewRailChrome()

  return (
    <div className={previewRailHeaderSectionShellClasses}>
      <div
        className={cn(
          previewRailHeaderRowClasses,
          previewRailSectionInsetVariants({ chrome }),
          previewRailHeaderSectionContentClasses,
        )}
      >
        <Heading variant="card" as="h2" className="min-w-0 truncate">
          {title}
        </Heading>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
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
      <span className="font-medium">{statusLabel}</span>
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
  const chrome = usePreviewRailChrome()

  return (
    <div className={previewRailIdentitySectionShellClasses} data-slot="preview-rail-identity">
      <div
        className={cn(
          previewRailIdentityStackClasses,
          previewRailSectionInsetVariants({ chrome }),
          previewRailIdentitySectionContentClasses,
        )}
      >
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
          </>
        ) : null}
      </div>
    </div>
  )
}

export type PreviewRailFactsProps = {
  facts: PreviewRailFact[]
  /** Accordion bodies use tighter metadata typography. */
  density?: 'comfortable' | 'compact'
}

function PreviewRailFacts({ facts, density = 'comfortable' }: PreviewRailFactsProps) {
  const compact = density === 'compact'

  return (
    <dl
      className={cn(
        previewRailFactsGridClasses,
        compact ? previewRailFactsGridCompactClasses : null,
      )}
    >
      {facts.map((fact) => (
        <React.Fragment key={fact.label}>
          <Text
            as="dt"
            variant="muted"
            className={cn(
              previewRailFactLabelClasses,
              compact ? previewRailFactCompactTextClasses : null,
            )}
          >
            {fact.label}
          </Text>
          <Text
            as="dd"
            className={cn(
              previewRailFactValueClasses,
              compact ? previewRailFactCompactTextClasses : null,
            )}
          >
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
        {description ? <p className={previewRailCaptionTextClasses}>{description}</p> : null}
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

  if (marker === 'incomplete') {
    return <Circle aria-hidden className={className} />
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
      {facts && facts.length > 0 ? <PreviewRailFacts facts={facts} density="compact" /> : null}
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
    <Alert variant={variant} density="compact">
      <div className="flex w-full items-start gap-2">
        {resolvedIcon}
        <div className={previewRailStatusPanelContentClasses}>
          <p className={alertTitleVariants({ variant, density: 'compact' })}>{title}</p>
          {description ? (
            <p className={previewRailStatusPanelDescriptionClasses}>{description}</p>
          ) : null}
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
      {helperText ? <p className={previewRailActionHelperTextClasses}>{helperText}</p> : null}
    </div>
  )
}

function PreviewRailScrollRegion({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const chrome = usePreviewRailChrome()

  return (
    <ScrollBoundaryRegion
      className={cn(previewRailScrollRegionShellClasses, className)}
      viewportClassName={previewRailSectionInsetVariants({ chrome })}
      {...props}
    >
      <div className={previewRailScrollRegionContentClasses}>{children}</div>
    </ScrollBoundaryRegion>
  )
}

function PreviewRailFooter({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const chrome = usePreviewRailChrome()

  return (
    <div className={previewRailFooterSectionShellClasses}>
      <div
        className={cn(
          previewRailFooterClasses,
          previewRailSectionInsetVariants({ chrome }),
          className,
        )}
        {...props}
      >
        {children}
      </div>
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
  ScrollRegion: PreviewRailScrollRegion,
  Footer: PreviewRailFooter,
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
  PreviewRailScrollRegion,
  PreviewRailFooter,
}
