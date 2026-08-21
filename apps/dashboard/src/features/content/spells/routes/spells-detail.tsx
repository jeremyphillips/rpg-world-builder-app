import { useParams } from 'react-router-dom'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import { formatSlugAsLabel } from '@rpg/contracts'
import type { Spell } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { WidePage } from '@/components/layout/page/wide-page'
import { useClasses } from '../../classes/hooks/use-classes'
import {
  getDamageTypeLabelFromVocabulary,
  getSpellSchoolDescriptionFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
  useDamageTypeVocabulary,
  useSpellSchoolVocabulary,
} from '@/features/vocabulary'
import { useSpells } from '../hooks/use-spells'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge.client'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section.client'
import {
  buildSpellDetailViewModel,
  SPELL_SECTION_LABELS,
  type SpellDetailViewModel,
} from '../lib/spell-display'
import { ContentLinkBadge, ContentStaticBadge } from '../../lib/detail/metadata/content-link-badge'

// ---------------------------------------------------------------------------
// Sub-components (markup only — labels and formatting live in spell-display)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main detail component
// ---------------------------------------------------------------------------

type SpellDetailContentProps = {
  spell: Spell
  campaignId: string
}

export function SpellDetailContent({ spell, campaignId }: SpellDetailContentProps) {
  useSetBreadcrumbLabel(spell.name)
  const { data: classes = [] } = useClasses(campaignId)
  const { vocabulary: damageTypeVocabulary } = useDamageTypeVocabulary(campaignId)
  const { vocabulary: spellSchoolVocabulary } = useSpellSchoolVocabulary(campaignId)
  const classesBySlug = new Map(classes.map((cls) => [cls.slug, cls]))

  const viewModel = buildSpellDetailViewModel(spell, {
    resolveSpellSchoolLabel: (schoolId) =>
      getSpellSchoolLabelFromVocabulary(spellSchoolVocabulary, schoolId),
    resolveSpellSchoolDescription: (schoolId) =>
      getSpellSchoolDescriptionFromVocabulary(spellSchoolVocabulary, schoolId),
    resolveDamageTypeLabel: (typeId) =>
      getDamageTypeLabelFromVocabulary(damageTypeVocabulary, typeId),
    resolveClassLabel: (slug) => classesBySlug.get(slug)?.name ?? formatSlugAsLabel(slug),
  })

  return (
    <WidePage>
      <ContentDetailLayout
        name={spell.name}
        nameBadge={<ContentStatusNameBadge status={spell.status} />}
        imageUrl={getContentImageUrl(spell.imageKey)}
        imageName={spell.name}
        campaignId={campaignId}
        editHref={contentEditHref('spells', campaignId, spell.id)}
        statRows={viewModel.statRows}
        descriptionContent={
          viewModel.descriptionHtml ? (
            <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
          ) : undefined
        }
      >
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
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="spells"
          entityId={spell.id}
        />
      </ContentDetailLayout>
    </WidePage>
  )
}

export function SpellDetail() {
  const { campaignId = '', spellId = '' } = useParams<{
    campaignId: string
    spellId: string
  }>()
  const { data: spells = [], isPending, isError } = useSpells(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={spells}
      itemId={spellId}
      loadErrorLabel={formatContentListLoadErrorMessage('spells')}
      notFoundLabel={formatContentNotFoundMessage('spells')}
    >
      {(spell) => <SpellDetailContent spell={spell} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
