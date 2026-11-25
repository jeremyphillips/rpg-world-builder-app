import { useParams } from 'react-router-dom'
import {
  createEquipmentCatalogContext,
  createSpellCatalogContext,
  type Species,
} from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
  formatContentReferenceUnavailable,
} from '@/features/content/lib/content-type-labels'
import {
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
  findVocabularyLabel,
  useDamageTypeVocabulary,
  getSenseLabelFromVocabulary,
} from '@/features/vocabulary'
import { getCreatureTypeLabel } from '../lib/creature-type-field-options'
import { buildSpeciesDetailViewModel } from '../lib/species-display'
import { useSpecies } from '../hooks/use-species'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import {
  getContentDisplayImage,
  resolveDashboardDetailDisplayFallback,
} from '../../lib/detail/page/content-display-image'
import { buildSpeciesContentDisplayImageInput } from '../../lib/detail/page/content-display-image-input'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { useEquipment } from '../../equipment/hooks/use-equipment'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { useSpells } from '../../spells/hooks/use-spells'
import { SpeciesDetailBody } from '../components/detail/species-detail-body'

type SpeciesDetailContentProps = { species: Species; campaignId: string }

export function SpeciesDetailContent({ species, campaignId }: SpeciesDetailContentProps) {
  useSetBreadcrumbLabel(species.name)

  const { vocabulary: creatureTypeVocabulary } = useCreatureTypeVocabulary(campaignId)
  const { vocabulary: senseVocabulary } = useSenseVocabulary(campaignId)
  const { vocabulary: damageTypeVocabulary } = useDamageTypeVocabulary(campaignId)
  const { vocabulary: languageVocabulary } = useLanguageVocabulary(campaignId)

  const spells = useSpells(campaignId)
  const equipment = useEquipment(campaignId)
  const skills = useSkillProficiencies(campaignId)
  const spellCatalog = createSpellCatalogContext({
    status: spells.isError ? 'error' : spells.isPending ? 'pending' : 'ready',
    spellsById: new Map(spells.data?.map((spell) => [spell.id, spell])),
  })

  const viewModel = buildSpeciesDetailViewModel(species, {
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(id, { creatureTypeVocabulary }),
    resolveDamageTypeLabel: (id) => findVocabularyLabel(damageTypeVocabulary, id),
    resolveLanguageLabel: (id) => findVocabularyLabel(languageVocabulary, id),
    resolveSenseLabel: (type) => getSenseLabelFromVocabulary(senseVocabulary, type),
    spellCatalog,
    equipmentCatalog: createEquipmentCatalogContext({
      status: equipment.isError ? 'error' : equipment.isPending ? 'pending' : 'ready',
      scope: { rulesetId: species.rulesetId, campaignId },
      equipmentById: new Map(equipment.data?.map((item) => [item.id, item])),
    }),
    resolveSkillName: (slug) =>
      skills.data?.find((skill) => skill.slug === slug)?.name ??
      formatContentReferenceUnavailable('skill-proficiencies'),
  })

  return (
    <SpeciesDetailBody
      name={species.name}
      nameBadge={<ContentStatusNameBadge status={species.status} />}
      displayImage={getContentDisplayImage(buildSpeciesContentDisplayImageInput(species, 'detail'))}
      displayFallback={resolveDashboardDetailDisplayFallback('species')}
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
