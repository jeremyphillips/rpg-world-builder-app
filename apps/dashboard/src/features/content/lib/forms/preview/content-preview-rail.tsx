import { useMemo, useState } from 'react'
import { useFormContext, useWatch, type FieldValues } from 'react-hook-form'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  getContentTypeTerm,
  type ContentCampaignAccessPatch,
  type ContentTypeKey,
  type VocabularyTerm,
} from '@rpg/contracts'
import { Button, PreviewRail, Sheet } from '@rpg/ui'
import {
  useTabbedFormChrome,
  useTabbedFormTabValidationState,
  type FieldGroupSummary,
  type TabbedFormTab,
} from '@rpg/ui/form'
import { Eye, type LucideIcon } from 'lucide-react'

import { useCampaignAccessForm } from '../../campaign-access/campaign-access-form-context'
import { resolveCampaignAccessSummary } from '../../campaign-access/campaign-access-summary'
import { useSubclasses } from '../../../classes/hooks/use-subclasses'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'
import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import {
  CONTENT_PREVIEW_AS_PLAYER_LABEL,
  CONTENT_PREVIEW_COMPACT_LABEL,
  CONTENT_PREVIEW_SECTIONS_TITLE,
  contentPreviewAsPlayerHelper,
  contentPreviewHeaderTitle,
  contentPreviewSectionsDescription,
} from './content-form-preview-copy'
import {
  resolveContentPreviewAvailability,
  resolveContentPreviewReadinessPanel,
  resolvePreviewRailFallbackIcon,
  resolvePreviewRailOpenSection,
} from './content-preview-rail.lib'
import { resolveContentPreviewSectionPresentation } from './content-preview-section-state'
import { contentPreviewCompactTriggerClasses } from './content-preview-rail.variants'
import { useContentPreviewUi } from './content-preview-ui-context'
import { useContentPublishReadiness } from './use-content-publish-readiness'
import { useMediaMinWidth, VIEWPORT_MD_MIN_QUERY } from './use-media-min-width'
import { ContentPreviewPlayerHost } from './content-preview-player-host'
import type { ContentPreviewIdentity, ContentPreviewSection } from './content-form-preview.types'

export function ContentPreviewCompactTrigger() {
  const { setSheetOpen } = useContentPreviewUi()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={contentPreviewCompactTriggerClasses}
      onClick={() => setSheetOpen(true)}
    >
      <Eye aria-hidden />
      {CONTENT_PREVIEW_COMPACT_LABEL}
    </Button>
  )
}

export type ContentPreviewRailProps = {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  tabs: TabbedFormTab[]
  showDraftBadge: boolean
}

type PreviewRailBodyProps = ContentPreviewRailProps & {
  chrome: 'card' | 'plain'
  sticky?: boolean
  hideHeader?: boolean
}

function ContentPreviewRailBody({
  def,
  ctx,
  tabs,
  showDraftBadge,
  chrome,
  sticky = false,
  hideHeader = false,
}: PreviewRailBodyProps) {
  const { control, getValues } = useFormContext<FieldValues>()
  const values = (useWatch({ control }) ?? getValues()) as FieldValues
  const chromeCtx = useTabbedFormChrome()
  const { setPlayerOpen } = useContentPreviewUi()
  const { pendingAccess } = useCampaignAccessForm()
  const publishSchema = useMemo(() => resolveContentPublishSchema(def, ctx), [def, ctx])
  const readiness = useContentPublishReadiness({ schema: publishSchema, tabs })
  const { hasAttemptedPublish, tabStates } = useTabbedFormTabValidationState(tabs)
  const activeTabId = chromeCtx?.activeTabId ?? tabs[0]?.id ?? ''
  const [manualSection, setManualSection] = useState<{ forTabId: string; value: string } | null>(
    null,
  )
  const openSection = resolvePreviewRailOpenSection(activeTabId, manualSection)
  const preview = def.preview
  const contentTypeKey = def.routeKey as ContentTypeKey
  const term = getContentTypeTerm(contentTypeKey)
  const FallbackIcon = resolvePreviewRailFallbackIcon(contentTypeKey)
  const isClassPreview = def.routeKey === 'classes'

  const { data: subclasses = [] } = useSubclasses(
    isClassPreview ? ctx.campaignId : undefined,
    isClassPreview ? ctx.entityId : undefined,
  )

  const identity = useMemo(() => preview?.buildIdentity(values, ctx), [preview, values, ctx])
  const sections = useMemo(
    () => preview?.buildSections(values, ctx, { subclasses }) ?? {},
    [preview, values, ctx, subclasses],
  )

  const access = pendingAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
  const accessSummary = resolveCampaignAccessSummary(access)
  const attentionCount = tabStates.filter((state) => state.count > 0).length

  if (!preview || !identity) {
    return null
  }

  return (
    <ContentPreviewRailView
      chrome={chrome}
      sticky={sticky}
      hideHeader={hideHeader}
      showDraftBadge={showDraftBadge}
      term={term}
      FallbackIcon={FallbackIcon}
      identity={identity}
      access={access}
      accessSummary={accessSummary}
      openSection={openSection}
      activeTabId={activeTabId}
      onOpenSectionChange={setManualSection}
      tabs={tabs}
      sections={sections}
      invalidTabIds={readiness.invalidTabIds}
      hasAttemptedPublish={hasAttemptedPublish}
      valid={readiness.valid}
      attentionCount={attentionCount}
      onPreviewAsPlayer={() => setPlayerOpen(true)}
    />
  )
}

type ContentPreviewRailViewProps = {
  chrome: 'card' | 'plain'
  sticky?: boolean
  hideHeader: boolean
  showDraftBadge: boolean
  term: VocabularyTerm
  FallbackIcon: LucideIcon
  identity: ContentPreviewIdentity
  access: ContentCampaignAccessPatch
  accessSummary: FieldGroupSummary
  openSection: string
  activeTabId: string
  onOpenSectionChange: (next: { forTabId: string; value: string }) => void
  tabs: TabbedFormTab[]
  sections: Record<string, ContentPreviewSection | null>
  invalidTabIds: ReadonlySet<string>
  hasAttemptedPublish: boolean
  valid: boolean
  attentionCount: number
  onPreviewAsPlayer: () => void
}

function ContentPreviewRailView({
  chrome,
  sticky,
  hideHeader,
  showDraftBadge,
  term,
  FallbackIcon,
  identity,
  access,
  accessSummary,
  openSection,
  activeTabId,
  onOpenSectionChange,
  tabs,
  sections,
  invalidTabIds,
  hasAttemptedPublish,
  valid,
  attentionCount,
  onPreviewAsPlayer,
}: ContentPreviewRailViewProps) {
  return (
    <PreviewRail chrome={chrome} sticky={sticky}>
      {hideHeader ? null : (
        <PreviewRail.Header
          title={contentPreviewHeaderTitle(term)}
          badge={showDraftBadge ? <PreviewRail.DraftBadge /> : undefined}
        />
      )}
      <PreviewRail.Identity
        media={<PreviewRail.Media imageSrc={identity.imageSrc} fallbackIcon={<FallbackIcon />} />}
        name={identity.name}
        availability={resolveContentPreviewAvailability(access, accessSummary)}
        facts={identity.facts}
      />
      <PreviewRail.ScrollRegion>
        <PreviewRail.Sections
          title={CONTENT_PREVIEW_SECTIONS_TITLE}
          description={contentPreviewSectionsDescription(term)}
          value={openSection}
          onValueChange={(value) => onOpenSectionChange({ forTabId: activeTabId, value })}
        >
          <ContentPreviewRailSectionList
            tabs={tabs}
            sections={sections}
            invalidTabIds={invalidTabIds}
            hasAttemptedPublish={hasAttemptedPublish}
          />
        </PreviewRail.Sections>
      </PreviewRail.ScrollRegion>
      <PreviewRail.Footer>
        <PreviewRail.StatusPanel
          {...resolveContentPreviewReadinessPanel(valid, hasAttemptedPublish, attentionCount)}
        />
        <PreviewRail.Action
          label={CONTENT_PREVIEW_AS_PLAYER_LABEL}
          helperText={contentPreviewAsPlayerHelper(term)}
          icon={<Eye />}
          onClick={onPreviewAsPlayer}
        />
      </PreviewRail.Footer>
    </PreviewRail>
  )
}

function ContentPreviewRailSectionList({
  tabs,
  sections,
  invalidTabIds,
  hasAttemptedPublish,
}: {
  tabs: TabbedFormTab[]
  sections: Record<string, ContentPreviewSection | null>
  invalidTabIds: ReadonlySet<string>
  hasAttemptedPublish: boolean
}) {
  return tabs.map((tab) => {
    const section = sections[tab.id]
    if (section == null) return null
    return (
      <PreviewRailSectionItem
        key={tab.id}
        tabId={tab.id}
        label={tab.label}
        section={section}
        sectionValid={!invalidTabIds.has(tab.id)}
        hasAttemptedPublish={hasAttemptedPublish}
      />
    )
  })
}

function PreviewRailSectionItem({
  tabId,
  label,
  section,
  sectionValid,
  hasAttemptedPublish,
}: {
  tabId: string
  label: string
  section: ContentPreviewSection
  sectionValid: boolean
  hasAttemptedPublish: boolean
}) {
  const presentation = resolveContentPreviewSectionPresentation(
    section,
    sectionValid,
    hasAttemptedPublish,
  )

  return (
    <PreviewRail.Section
      id={tabId}
      label={label}
      marker={presentation.marker}
      status={presentation.status}
      statusTone={presentation.statusTone}
    >
      {section.description || (section.facts && section.facts.length > 0) ? (
        <PreviewRail.SectionBody description={section.description} facts={section.facts} />
      ) : null}
    </PreviewRail.Section>
  )
}

export function ContentPreviewRail(props: ContentPreviewRailProps) {
  const { sheetOpen, setSheetOpen, playerOpen, setPlayerOpen } = useContentPreviewUi()
  const isMdUp = useMediaMinWidth(VIEWPORT_MD_MIN_QUERY)
  const term = getContentTypeTerm(props.def.routeKey as ContentTypeKey)
  const title = contentPreviewHeaderTitle(term)

  return (
    <>
      <ContentPreviewRailBody {...props} chrome="card" sticky />
      <Sheet.Root open={sheetOpen} onOpenChange={setSheetOpen}>
        <Sheet.Content
          side={isMdUp ? 'right' : 'bottom'}
          size="lg"
          surface="field-container"
          closeLabel="Close preview"
        >
          <Sheet.Header
            headline={title}
            endSlot={props.showDraftBadge ? <PreviewRail.DraftBadge /> : undefined}
          />
          <Sheet.Body>
            <ContentPreviewRailBody {...props} chrome="plain" hideHeader />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>
      <ContentPreviewPlayerHost
        def={props.def}
        ctx={props.ctx}
        open={playerOpen}
        onOpenChange={setPlayerOpen}
      />
    </>
  )
}
