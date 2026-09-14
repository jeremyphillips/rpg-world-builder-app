import { useParams } from 'react-router-dom'
import type { Species } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { WidePage } from '@/components/layout/page/wide-page'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import {
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
  getLanguageLabelFromVocabulary,
  getSenseLabelFromVocabulary,
} from '@/features/vocabulary'
import { getCreatureTypeLabel } from '../lib/creature-type-field-options'
import { buildSpeciesDetailViewModel } from '../lib/species-display'
import { useSpecies } from '../hooks/use-species'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { SpeciesDetailBody } from '../components/detail/species-detail-body'

type SpeciesDetailContentProps = { species: Species; campaignId: string }

export function SpeciesDetailContent({ species, campaignId }: SpeciesDetailContentProps) {
  useSetBreadcrumbLabel(species.name)

  const { vocabulary: creatureTypeVocabulary } = useCreatureTypeVocabulary(campaignId)
  const { vocabulary: senseVocabulary } = useSenseVocabulary(campaignId)
  const { vocabulary: languageVocabulary } = useLanguageVocabulary(campaignId)

  const viewModel = buildSpeciesDetailViewModel(species, {
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(id, { creatureTypeVocabulary }),
    resolveLanguageLabel: (id) => getLanguageLabelFromVocabulary(languageVocabulary, id),
    resolveSenseLabel: (type) => getSenseLabelFromVocabulary(senseVocabulary, type),
    resolveSpell: () => undefined,
  })

  return (
    <WidePage>
      <SpeciesDetailBody
        name={species.name}
        nameBadge={<ContentStatusNameBadge status={species.status} />}
        imageUrl={getContentImageUrl(species.imageKey)}
        imageName={species.name}
        viewModel={viewModel}
        campaignId={campaignId}
        editHref={contentEditHref('species', campaignId, species.id)}
      >
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="species"
          entityId={species.id}
        />
      </SpeciesDetailBody>
    </WidePage>
  )
}

export function SpeciesDetail() {
  const { campaignId = '', speciesId = '' } = useParams<{
    campaignId: string
    speciesId: string
  }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={species}
      itemId={speciesId}
      loadErrorLabel={formatContentListLoadErrorMessage('species')}
      notFoundLabel={formatContentNotFoundMessage('species')}
    >
      {(item) => <SpeciesDetailContent species={item} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
