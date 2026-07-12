import { useParams } from 'react-router-dom'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import {
  formatSlugAsLabel,
  getEffectConditionLabel,
  getSpellFunctionTagLabel,
  getSpellRoleTagLabel,
} from '@rpg/contracts'
import type { Spell, SpellTags } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useClasses } from '../../classes/hooks/use-classes'
import {
  getDamageTypeLabelFromVocabulary,
  useDamageTypeVocabulary,
  useSpellSchoolVocabulary,
} from '@/features/homebrew'
import { useSpells } from '../hooks/use-spells'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { buildSpellStatRows } from '../lib/spell-stat-rows'
import { ContentLinkBadge, ContentStaticBadge } from '../../lib/detail/content-link-badge'

function SpellClassesList({ campaignId, classIds }: { campaignId: string; classIds: string[] }) {
  const { data: classes = [], isPending } = useClasses(campaignId)

  if (classIds.length === 0) return null

  const classesBySlug = new Map(classes.map((cls) => [cls.slug, cls]))

  return (
    <section aria-labelledby="spell-classes-heading">
      <Heading variant="section" as="h2" id="spell-classes-heading" className="mb-3">
        Classes
      </Heading>
      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : (
        <ul className="flex flex-wrap gap-2" role="list">
          {classIds.map((slug) => {
            const cls = classesBySlug.get(slug)
            return (
              <li key={slug}>
                {cls ? (
                  <ContentLinkBadge to={ROUTES.content.classes.detail(campaignId, cls.id)}>
                    {cls.name}
                  </ContentLinkBadge>
                ) : (
                  <ContentStaticBadge>{formatSlugAsLabel(slug)}</ContentStaticBadge>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function collectTagLabels(
  tags: SpellTags,
  damageTypeVocabulary: ReturnType<typeof useDamageTypeVocabulary>['vocabulary'],
): string[] {
  const labels: string[] = []
  tags.roles?.forEach((role) => labels.push(getSpellRoleTagLabel(role)))
  tags.functions?.forEach((fn) => labels.push(getSpellFunctionTagLabel(fn)))
  tags.damageTypes?.forEach((type) =>
    labels.push(getDamageTypeLabelFromVocabulary(damageTypeVocabulary, type)),
  )
  tags.conditions?.forEach((condition) => labels.push(getEffectConditionLabel(condition)))
  return labels
}

function SpellTagsSection({
  tags,
  damageTypeVocabulary,
}: {
  tags?: SpellTags
  damageTypeVocabulary: ReturnType<typeof useDamageTypeVocabulary>['vocabulary']
}) {
  if (!tags) return null

  const labels = collectTagLabels(tags, damageTypeVocabulary)
  if (labels.length === 0) return null

  return (
    <section aria-labelledby="spell-tags-heading">
      <Heading variant="section" as="h2" id="spell-tags-heading" className="mb-3">
        Tags
      </Heading>
      <ul className="flex flex-wrap gap-2" role="list">
        {labels.map((label) => (
          <li key={label}>
            <ContentStaticBadge>{label}</ContentStaticBadge>
          </li>
        ))}
      </ul>
    </section>
  )
}

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
  const statRows = buildSpellStatRows(spell, { classesBySlug, spellSchoolVocabulary }).filter(
    (row) => row.label !== 'Classes',
  )

  return (
    <WidePage>
      <ContentDetailLayout
        name={spell.name}
        imageUrl={getContentImageUrl(spell.imageKey)}
        imageName={spell.name}
        campaignId={campaignId}
        editHref={contentEditHref('spells', campaignId, spell.id)}
        statRows={statRows}
        descriptionContent={
          spell.description ? (
            <RichTextContent html={spell.description} size="md" tone="muted" />
          ) : undefined
        }
      >
        <SpellClassesList campaignId={campaignId} classIds={spell.classIds} />
        <SpellTagsSection tags={spell.tags} damageTypeVocabulary={damageTypeVocabulary} />
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
