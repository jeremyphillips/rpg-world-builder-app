import type { ReactNode } from 'react'
import { Heading, RichTextContent, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useClasses } from '../../classes/hooks/use-classes'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentLinkBadge, ContentStaticBadge } from '../../lib/detail/metadata/content-link-badge'
import { SPELL_SECTION_LABELS, type SpellDetailViewModel } from '../lib/spell-display'

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
    <section aria-labelledby="spell-classes-heading">
      <Heading variant="section" as="h2" id="spell-classes-heading" className="mb-3">
        {section.title}
      </Heading>
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
    </section>
  )
}

function SpellTagsSection({
  section,
}: {
  section: NonNullable<SpellDetailViewModel['tagsSection']>
}) {
  return (
    <section aria-labelledby="spell-tags-heading">
      <Heading variant="section" as="h2" id="spell-tags-heading" className="mb-3">
        {section.title}
      </Heading>
      <ul className="flex flex-wrap gap-2" role="list">
        {section.labels.map((label) => (
          <li key={label}>
            <ContentStaticBadge>{label}</ContentStaticBadge>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SpellResolutionSection({
  section,
}: {
  section: NonNullable<SpellDetailViewModel['resolutionSection']>
}) {
  return (
    <section aria-labelledby="spell-resolution-heading">
      <Heading variant="section" as="h2" id="spell-resolution-heading" className="mb-3">
        {section.title}
      </Heading>
      <div className="space-y-4">
        {section.subsections.map((subsection) => (
          <div key={subsection.heading}>
            <Heading variant="subsection" as="h3" className="mb-2">
              {subsection.heading}
            </Heading>
            <ul className="list-inside list-disc space-y-1" role="list">
              {subsection.lines.map((line) => (
                <li key={`${subsection.heading}-${line}`}>
                  <Text as="span">{line}</Text>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
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
  return (
    <section aria-labelledby={`spell-${id}-heading`}>
      <Heading variant="section" as="h2" id={`spell-${id}-heading`} className="mb-3">
        {title}
      </Heading>
      <RichTextContent html={bodyHtml} size="md" tone="muted" />
    </section>
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
  imageUrl: string
  imageName: string
  viewModel: SpellDetailViewModel
  campaignId: string
  editHref?: string
  children?: ReactNode
}

/** View-model-driven spell detail composition — no route chrome or usage section. */
export function SpellDetailBody({
  name,
  nameBadge,
  imageUrl,
  imageName,
  viewModel,
  campaignId,
  editHref,
  children,
}: SpellDetailBodyProps) {
  return (
    <ContentDetailLayout
      name={name}
      nameBadge={nameBadge}
      imageUrl={imageUrl}
      imageName={imageName}
      campaignId={campaignId}
      editHref={editHref}
      statRows={viewModel.statRows}
      descriptionContent={
        viewModel.descriptionHtml ? (
          <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
        ) : undefined
      }
    >
      <SpellDetailSections viewModel={viewModel} campaignId={campaignId} />
      {children}
    </ContentDetailLayout>
  )
}
