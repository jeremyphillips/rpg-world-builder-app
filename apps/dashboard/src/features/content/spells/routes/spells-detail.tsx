import { useParams } from 'react-router-dom'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import { formatSlugAsLabel } from '@rpg/contracts'
import type { Spell } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useClasses } from '../../classes/hooks/use-classes'
import {
  getDamageTypeLabelFromVocabulary,
  getSpellSchoolDescriptionFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
  useDamageTypeVocabulary,
  useSpellSchoolVocabulary,
} from '@/features/homebrew'
import { useSpells } from '../hooks/use-spells'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { buildSpellDetailViewModel, type SpellDetailViewModel } from '../lib/spell-display'
import { ContentLinkBadge, ContentStaticBadge } from '../../lib/detail/content-link-badge'

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
        {viewModel.classesSection ? (
          <SpellClassesList campaignId={campaignId} section={viewModel.classesSection} />
        ) : null}
        {viewModel.tagsSection ? <SpellTagsSection section={viewModel.tagsSection} /> : null}
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
      loadErrorLabel="Could not load spells."
      notFoundLabel="Spell not found."
    >
      {(spell) => <SpellDetailContent spell={spell} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
