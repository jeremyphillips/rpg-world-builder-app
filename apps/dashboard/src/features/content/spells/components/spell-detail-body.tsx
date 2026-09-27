import type { ReactNode } from 'react'
import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'
import { RichTextContent, Text } from '@rpg/ui'

import { RichTextWithTables } from '../../components/rich-text/rich-text-with-tables'

import { ROUTES } from '@/app/routes'
import { useClasses } from '../../classes/hooks/use-classes'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import type { ContentDetailHeroMediaPresentation } from '../../lib/detail/page/content-detail-layout.types'
import { contentDetailNavItemId } from '../../lib/detail/page/content-detail-nav-anchor-id'
import {
  ContentDetailSection,
  ContentDetailSectionItem,
} from '../../lib/detail/page/content-detail-section'
import { ContentLinkBadge, ContentStaticBadge } from '../../lib/detail/metadata/content-link-badge'
import { SPELL_SECTION_LABELS, type SpellDetailViewModel } from '../lib/spell-display'

const SPELL_CLASSES_HEADING_ID = 'spell-classes-heading'
const SPELL_TAGS_HEADING_ID = 'spell-tags-heading'
const SPELL_RESOLUTION_HEADING_ID = 'spell-resolution-heading'

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function SpellClassesList({
  campaignId,
  section,
}: {
  campaignId: string
  section: NonNullable<SpellDetailViewModel['classesSection']>
}) {
  const { data: classes = [], isPending } = useClasses(campaignId)
  const classesBySlug = new Map(classes.map((cls) => [cls.slug, cls]))

  return (
    <ContentDetailSection heading={section.title} headingId={SPELL_CLASSES_HEADING_ID}>
      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : (
        <ul className="flex flex-wrap gap-2" role="list">
          {section.items.map((item) => {
            const cls = classesBySlug.get(item.slug)
            return (
              <li key={item.slug}>
                {cls ? (
                  <ContentLinkBadge to={ROUTES.content.classes.detail(campaignId, cls.id)}>
                    {cls.name}
                  </ContentLinkBadge>
                ) : (
                  <ContentStaticBadge>{item.label}</ContentStaticBadge>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </ContentDetailSection>
  )
}

function SpellTagsSection({
  section,
}: {
  section: NonNullable<SpellDetailViewModel['tagsSection']>
}) {
  return (
    <ContentDetailSection heading={section.title} headingId={SPELL_TAGS_HEADING_ID}>
      <ul className="flex flex-wrap gap-2" role="list">
        {section.labels.map((label) => (
          <li key={label}>
            <ContentStaticBadge>{label}</ContentStaticBadge>
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

function SpellResolutionSection({
  section,
}: {
  section: NonNullable<SpellDetailViewModel['resolutionSection']>
}) {
  return (
    <ContentDetailSection heading={section.title} headingId={SPELL_RESOLUTION_HEADING_ID}>
      <div className="space-y-4">
        {section.subsections.map((subsection) => (
          <ContentDetailSectionItem
            key={subsection.heading}
            id={contentDetailNavItemId('resolution', slugifyHeading(subsection.heading))}
            label={subsection.heading}
          >
            <ul className="list-inside list-disc space-y-1" role="list">
              {subsection.lines.map((line) => (
                <li key={`${subsection.heading}-${line}`}>
                  <Text as="span">{line}</Text>
                </li>
              ))}
            </ul>
          </ContentDetailSectionItem>
        ))}
      </div>
    </ContentDetailSection>
  )
}

function SpellProseSection({
  id,
  title,
  bodyHtml,
}: {
  id: 'cantripScaling' | 'higherLevelSlotEffect'
  title: string
  bodyHtml: string
}) {
  const headingId = `spell-${id}-heading`

  return (
    <ContentDetailSection heading={title} headingId={headingId}>
      <RichTextContent html={bodyHtml} size="md" tone="muted" />
    </ContentDetailSection>
  )
}

function SpellProseSections({ sections }: { sections: SpellDetailViewModel['proseSections'] }) {
  return (
    <>
      {sections.cantripScaling ? (
        <SpellProseSection
          id="cantripScaling"
          title={SPELL_SECTION_LABELS.cantripScaling}
          bodyHtml={sections.cantripScaling}
        />
      ) : null}
      {sections.higherLevelSlotEffect ? (
        <SpellProseSection
          id="higherLevelSlotEffect"
          title={SPELL_SECTION_LABELS.higherLevelSlotEffect}
          bodyHtml={sections.higherLevelSlotEffect}
        />
      ) : null}
    </>
  )
}

function SpellDetailSections({
  viewModel,
  campaignId,
}: {
  viewModel: SpellDetailViewModel
  campaignId: string
}) {
  return (
    <>
      {viewModel.proseSections.cantripScaling || viewModel.proseSections.higherLevelSlotEffect ? (
        <SpellProseSections sections={viewModel.proseSections} />
      ) : null}
      {viewModel.classesSection ? (
        <SpellClassesList campaignId={campaignId} section={viewModel.classesSection} />
      ) : null}
      {viewModel.tagsSection ? <SpellTagsSection section={viewModel.tagsSection} /> : null}
      {viewModel.resolutionSection ? (
        <SpellResolutionSection section={viewModel.resolutionSection} />
      ) : null}
    </>
  )
}

export type SpellDetailBodyProps = {
  name: string
  nameBadge?: ReactNode
  imageName: string
  displayImage?: ContentDisplayImage
  displayFallback?: ContentDisplayFallback
  mediaPresentation?: ContentDetailHeroMediaPresentation
  viewModel: SpellDetailViewModel
  campaignId: string
  editHref?: string
  children?: ReactNode
}

/** View-model-driven spell detail composition — no route chrome or usage section. */
export function SpellDetailBody({
  name,
  nameBadge,
  imageName,
  displayImage,
  displayFallback,
  mediaPresentation,
  viewModel,
  campaignId,
  editHref,
  children,
}: SpellDetailBodyProps) {
  return (
    <ContentDetailLayout
      contentTypeKey="spells"
      name={name}
      nameBadge={nameBadge}
      imageName={imageName}
      displayImage={displayImage}
      displayFallback={displayFallback}
      mediaPresentation={mediaPresentation}
      campaignId={campaignId}
      editHref={editHref}
      heroDescription={false}
      statRows={viewModel.statRows}
      descriptionContent={
        viewModel.descriptionHtml ? (
          viewModel.descriptionTables?.length ? (
            <RichTextWithTables
              html={viewModel.descriptionHtml}
              tables={viewModel.descriptionTables}
              size="md"
              tone="muted"
            />
          ) : (
            <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
          )
        ) : undefined
      }
    >
      <SpellDetailSections viewModel={viewModel} campaignId={campaignId} />
      {children}
    </ContentDetailLayout>
  )
}
