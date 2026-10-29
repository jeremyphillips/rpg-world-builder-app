import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { resolveMechanicsPatch, type Monster, type SystemRulesetId } from '@rpg/contracts'

import { useRulesetPatch } from '@/features/homebrew'

import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { buildSeedCreatureTypeVocabulary, getCreatureTypeLabel } from '@/features/vocabulary'
import { useEquipment } from '../../equipment/hooks/use-equipment'
import type { NonEmptyContentTypeKeys } from '../../lib/detail/page/content-detail-query-status.lib'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import {
  getContentDisplayImage,
  resolveDashboardDetailDisplayFallback,
} from '../../lib/detail/page/content-display-image'
import { buildMonsterContentDisplayImageInput } from '../../lib/detail/page/content-display-image-input'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { MonsterDetailBody } from '../components/detail/monster-detail-body'
import {
  buildMonsterDetailViewModel,
  buildMonsterEquipmentCatalog,
  tryDeriveMonsterStatBlock,
  type MonsterCatalogLoadState,
} from '../lib/monster-display'
import { useMonsters } from '../hooks/use-monsters'

const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()

function failedMonsterCatalogSubjects(
  equipmentLoadingError: boolean,
  skillsLoadingError: boolean,
): NonEmptyContentTypeKeys | undefined {
  if (equipmentLoadingError && skillsLoadingError) {
    return ['equipment', 'skill-proficiencies']
  }
  if (equipmentLoadingError) return ['equipment']
  if (skillsLoadingError) return ['skill-proficiencies']
  return undefined
}

type MonsterDetailContentProps = {
  monster: Monster
  campaignId: string
  monsterId: string
}

export function MonsterDetailContent({
  monster,
  campaignId,
  monsterId,
}: MonsterDetailContentProps) {
  useSetBreadcrumbLabel(monster.name)

  const equipmentQuery = useEquipment(campaignId)
  const skillsQuery = useSkillProficiencies(campaignId)
  const { data: rulesetPatch } = useRulesetPatch(campaignId)
  const rulesetId = (monster.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  const magicPropertyProvider = useMemo(
    () => createMagicPropertyDefinitionProvider(rulesetId),
    [rulesetId],
  )
  const acBase = rulesetPatch?.mechanics.armorClass.base ?? resolveMechanicsPatch().armorClass.base
  const equipment = equipmentQuery.data
  const skillProficiencies = skillsQuery.data

  const catalogState: MonsterCatalogLoadState = useMemo(() => {
    if (equipmentQuery.isPending || skillsQuery.isPending) return 'pending'
    if (equipmentQuery.isLoadingError || skillsQuery.isLoadingError) return 'error'
    return 'ready'
  }, [
    equipmentQuery.isLoadingError,
    equipmentQuery.isPending,
    skillsQuery.isLoadingError,
    skillsQuery.isPending,
  ])

  const catalogLoadErrors =
    catalogState === 'error'
      ? failedMonsterCatalogSubjects(equipmentQuery.isLoadingError, skillsQuery.isLoadingError)
      : undefined

  const derived = useMemo(() => {
    if (catalogState !== 'ready') return null
    return tryDeriveMonsterStatBlock(monster, equipment ?? [], skillProficiencies ?? [], {
      acBase,
      magicPropertyProvider,
    })
  }, [acBase, catalogState, equipment, magicPropertyProvider, monster, skillProficiencies])

  const equipmentById = useMemo(() => buildMonsterEquipmentCatalog(equipment ?? []), [equipment])

  const viewModel = useMemo(
    () =>
      buildMonsterDetailViewModel({
        monster,
        creatureTypeLabel: getCreatureTypeLabel(creatureTypeVocabulary, monster.creatureType),
        equipmentById,
        catalogState: derived === null && catalogState === 'ready' ? 'error' : catalogState,
        derived,
      }),
    [catalogState, derived, equipmentById, monster],
  )

  return (
    <MonsterDetailBody
      name={monster.name}
      nameBadge={<ContentStatusNameBadge status={monster.status} />}
      displayImage={getContentDisplayImage(buildMonsterContentDisplayImageInput(monster, 'detail'))}
      displayFallback={resolveDashboardDetailDisplayFallback('monster')}
      imageName={monster.name}
      campaignId={campaignId}
      editHref={contentEditHref('monsters', campaignId, monsterId)}
      viewModel={viewModel}
      catalogLoadErrors={catalogLoadErrors}
      descriptionHtml={monster.description}
      usageSection={
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="monsters"
          entityId={monsterId}
        />
      }
    />
  )
}

export function MonsterDetail() {
  const { campaignId = '', monsterId = '' } = useParams<{ campaignId: string; monsterId: string }>()
  const { data: monsters = [], isPending, isError } = useMonsters(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={monsters}
      itemId={monsterId}
      loadErrorLabel={formatContentListLoadErrorMessage('monsters')}
      notFoundLabel={formatContentNotFoundMessage('monsters')}
    >
      {(monster) => (
        <MonsterDetailContent monster={monster} campaignId={campaignId} monsterId={monsterId} />
      )}
    </ContentDetailResolver>
  )
}
