'use client'

import * as React from 'react'
import { CircleSlash } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion.client'
import { Alert } from '../ui/alert'
import { ScrollBoundaryRegion } from '../ui/scroll-boundary-region.client'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button.client'
import { IdentityRowHeadingLine } from '../ui/identity-row.client'
import { IconContainer } from '../ui/icon-container.client'
import { IdentityFrame } from '../ui/identity-frame.client'
import { Panel } from '../ui/panel'
import { contentCardHeadingScaleClass } from '../ui/content-card.variants'
import { Eyebrow } from '../ui/eyebrow'
import { Heading } from '../ui/heading'
import { Text } from '../ui/text'
import { SemanticText } from '../ui/semantic-text/semantic-text'
import { StatusDot } from '../ui/status-dot'
import { StatusIcon } from '../ui/status-icon.client'
import type { StatusIconVariant } from '../ui/status-icon.variants'
import { InlineMetadata } from '../ui/inline-metadata'
import { MetadataList } from '../ui/metadata-list'
import type {
  PreviewRailAvailability,
  PreviewRailChrome,
  PreviewRailFact,
  PreviewRailLayout,
  PreviewRailSectionMarker,
  PreviewRailStatusPanelVariant,
  PreviewRailStatusTone,
} from './preview-rail.types'
import { previewRailLayoutVariants, previewRailSectionInsetVariants } from './preview-rail.variants'

const PreviewRailContext = React.createContext<PreviewRailChrome>('card')

function usePreviewRailChrome() {
  return React.useContext(PreviewRailContext)
}

export type PreviewRailProps = React.ComponentPropsWithoutRef<'aside'> & {
  chrome?: PreviewRailChrome
  layout?: PreviewRailLayout
}

function PreviewRailRoot({
  chrome = 'card',
  layout = 'default',
  className,
  children,
  ...props
}: PreviewRailProps) {
  const classes = cn(
    'ui-preview-rail flex min-w-0 w-full flex-col',
    previewRailLayoutVariants({ layout }),
    chrome === 'card' && 'text-card-foreground',
    className,
  )

  return (
    <PreviewRailContext.Provider value={chrome}>
      {chrome === 'card' ? (
        <Panel as="aside" tone="quiet" bleed className={classes} {...props}>
          {children}
        </Panel>
      ) : (
        <aside className={classes} {...props}>
          {children}
        </aside>
      )}
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
    <div className="ui-preview-rail__header ui-border--subtle">
      <div
        className={cn(
          'flex items-center justify-between gap-2',
          previewRailSectionInsetVariants({ chrome }),
          'pt-4',
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

function PreviewRailLeadingMediaShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ui-anatomy-leading-media"
      data-shape="box"
      data-slot="preview-rail-leading-media"
    >
      <div className="size-full overflow-hidden [&>*]:size-full">{children}</div>
    </div>
  )
}

function PreviewRailMedia({ imageSrc, imageAlt = '', fallbackIcon }: PreviewRailMediaProps) {
  if (imageSrc) {
    return (
      <PreviewRailLeadingMediaShell>
        <IdentityFrame src={imageSrc} alt={imageAlt} shape="box" className="!size-full" />
      </PreviewRailLeadingMediaShell>
    )
  }

  return (
    <PreviewRailLeadingMediaShell>
      <IconContainer className="!size-full">{fallbackIcon}</IconContainer>
    </PreviewRailLeadingMediaShell>
  )
}

export type PreviewRailAvailabilityLineProps = PreviewRailAvailability

function PreviewRailAvailabilityLine({
  available,
  statusLabel,
  detail,
}: PreviewRailAvailabilityLineProps) {
  return (
    <Text as="p" variant="caption" className="mt-1 flex min-w-0 items-center gap-1.5">
      {available ? (
        <StatusDot tone="success" size="sm" />
      ) : (
        <CircleSlash aria-hidden className="size-icon-glyph-md shrink-0 text-semantic-warning" />
      )}
      <InlineMetadata role="supporting" density="compact" wrap={false} className="min-w-0 flex-1">
        <InlineMetadata.Item className="font-medium">{statusLabel}</InlineMetadata.Item>
        {detail ? (
          <InlineMetadata.Item truncate className="truncate">
            {detail}
          </InlineMetadata.Item>
        ) : null}
      </InlineMetadata>
    </Text>
  )
}

export type PreviewRailIdentityProps = {
  media?: React.ReactNode
  name: React.ReactNode
  /** Primary detail line under the name — availability, level/class, etc. */
  status: React.ReactNode
  facts?: PreviewRailFact[]
}

function PreviewRailIdentity({ media, name, status, facts }: PreviewRailIdentityProps) {
  const chrome = usePreviewRailChrome()

  return (
    <div className="ui-preview-rail__identity ui-border--subtle" data-slot="preview-rail-identity">
      <div
        className={cn('flex flex-col gap-4', previewRailSectionInsetVariants({ chrome }), 'pt-4')}
      >
        <div className="ui-identity-row--comfortable flex min-w-0 items-start gap-4">
          {media}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center">
              <div className={cn(contentCardHeadingScaleClass('comfortable'), 'min-w-0')}>
                <IdentityRowHeadingLine heading={name} />
              </div>
            </div>
            {status ? <Text variant="supporting">{status}</Text> : null}
          </div>
        </div>
        {facts && facts.length > 0 ? (
          <>
            <div className="border-t ui-border--subtle" />
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
  return (
    <MetadataList
      items={facts.map((fact) => ({ id: fact.label, label: fact.label, value: fact.value }))}
      size={density === 'compact' ? 'xs' : 'sm'}
      columnGap="sm"
      rowGap={density === 'compact' ? 'sm' : 'md'}
      valueTrack="fill"
      emphasis="value"
      divider={false}
    />
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
      <div className="flex flex-col gap-1">
        <Eyebrow as="h3" size="sm" tone="foreground">
          {title}
        </Eyebrow>
        {description ? (
          <Text as="p" variant="caption">
            {description}
          </Text>
        ) : null}
      </div>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        className="ui-preview-rail__accordion ui-border--subtle"
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
  /** When false, the row is static — no chevron and no accordion panel. Default: true. */
  expandable?: boolean
  children?: React.ReactNode
}

function PreviewRailSectionMarker({ marker }: { marker: PreviewRailSectionMarker }) {
  return <StatusIcon variant={marker} size="md" />
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

function PreviewRailSectionRowChrome({
  label,
  marker,
  status,
  statusTone,
  trailing,
}: {
  label: string
  marker?: PreviewRailSectionMarker
  status?: string
  statusTone?: PreviewRailStatusTone
  trailing?: React.ReactNode
}) {
  return (
    <>
      {marker ? <PreviewRailSectionMarker marker={marker} /> : null}
      <span className="min-w-0 shrink-0">{label}</span>
      <span className="min-w-0 flex-1" />
      {status ? <PreviewRailSectionStatus status={status} statusTone={statusTone} /> : null}
      {trailing}
    </>
  )
}

function PreviewRailSection({
  id,
  label,
  marker,
  status,
  statusTone,
  expandable = true,
  children,
}: PreviewRailSectionProps) {
  if (!expandable) {
    return (
      <div className="ui-preview-rail__accordion-item ui-border--subtle">
        <div className="flex w-full cursor-default items-center justify-start gap-2 px-3 py-2.5 text-left text-sm font-body-emphasis hover:text-inherit">
          <PreviewRailSectionRowChrome
            label={label}
            marker={marker}
            status={status}
            statusTone={statusTone}
            trailing={<span aria-hidden className="size-icon-glyph-md shrink-0" />}
          />
        </div>
      </div>
    )
  }

  return (
    <AccordionItem value={id} className="ui-preview-rail__accordion-item ui-border--subtle">
      <AccordionTrigger className="flex flex-1 items-center justify-start gap-2 px-3 py-2.5 text-left text-sm font-body-emphasis hover:text-foreground/80 hover:no-underline">
        <PreviewRailSectionRowChrome
          label={label}
          marker={marker}
          status={status}
          statusTone={statusTone}
        />
      </AccordionTrigger>
      <AccordionContent className="[&>div]:px-3 [&>div]:pb-3 [&>div]:pt-1">
        {children}
      </AccordionContent>
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
    <div className="ui-preview-rail__section-body ui-border--subtle">
      {description ? (
        <Text as="p" variant="caption" className="line-clamp-2">
          {description}
        </Text>
      ) : null}
      {facts && facts.length > 0 ? <PreviewRailFacts facts={facts} density="compact" /> : null}
      {children}
    </div>
  )
}

const PREVIEW_RAIL_STATUS_PANEL_TO_STATUS_ICON = {
  success: 'ready',
  warning: 'needsAttention',
  default: 'incomplete',
} as const satisfies Record<PreviewRailStatusPanelVariant, StatusIconVariant>

function resolveStatusPanelIcon(variant: PreviewRailStatusPanelVariant) {
  return <StatusIcon variant={PREVIEW_RAIL_STATUS_PANEL_TO_STATUS_ICON[variant]} size="lg" />
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
    <Alert
      variant={variant}
      density="compact"
      leading={resolvedIcon}
      title={title}
      description={description}
    />
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
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onClick}
        disabled={disabled}
      >
        {icon ? <span aria-hidden>{icon}</span> : null}
        {label}
      </Button>
      {helperText ? (
        <Text as="p" variant="caption">
          {helperText}
        </Text>
      ) : null}
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
      className={cn('min-h-0 flex-1', className)}
      viewportClassName={previewRailSectionInsetVariants({ chrome })}
      {...props}
    >
      <div className="pb-4 pt-4">{children}</div>
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
    <div className="ui-preview-rail__footer ui-border--subtle">
      <div
        className={cn(
          'flex flex-col gap-4 py-4',
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
