import { useParams } from 'react-router-dom'
import { formatSlugAsLabel } from '@rpg/contracts'
import type { Spell } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { WidePage } from '@/components/layout/page/wide-page'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useClasses } from '../../classes/hooks/use-classes'
import {
  getDamageTypeLabelFromVocabulary,
  getSpellSchoolDescriptionFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
  useDamageTypeVocabulary,
  useSpellSchoolVocabulary,
} from '@/features/vocabulary'
import { useSpells } from '../hooks/use-spells'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { buildSpellDetailViewModel } from '../lib/spell-display'
import { SpellDetailBody } from '../components/spell-detail-body'

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
      <SpellDetailBody
        name={spell.name}
        nameBadge={<ContentStatusNameBadge status={spell.status} />}
        imageUrl={getContentImageUrl(spell.imageKey)}
        imageName={spell.name}
        viewModel={viewModel}
        campaignId={campaignId}
        editHref={contentEditHref('spells', campaignId, spell.id)}
      >
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="spells"
          entityId={spell.id}
        />
      </SpellDetailBody>
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
