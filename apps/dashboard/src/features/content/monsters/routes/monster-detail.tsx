import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  formatMonsterClassificationReference,
  MONSTER_CLASSIFICATION_DISABLED,
  MONSTER_CLASSIFICATION_DRAFT,
  type Monster,
  type SystemRulesetId,
} from '@rpg/contracts'

import { useRulesetPatch } from '@/features/homebrew'

import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import {
  useCreatureFamilyVocabulary,
  useCreatureTypeVocabulary,
  getCreatureTypeLabel,
} from '@/features/vocabulary'
import { useClasses } from '../../classes/hooks/use-classes'
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
import { useSpells } from '../../spells/hooks/use-spells'
import { MonsterDetailBody } from '../components/detail/monster-detail-body'
import {
  buildMonsterDetailViewModel,
  buildMonsterEquipmentCatalog,
  tryDeriveMonsterStatBlock,
  type MonsterCatalogLoadState,
} from '../lib/monster-display'
import { useMonsters } from '../hooks/use-monsters'

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

  const { vocabulary: creatureTypeVocabulary } = useCreatureTypeVocabulary(campaignId)
  const { vocabulary: familyVocabulary } = useCreatureFamilyVocabulary(campaignId)
  const classesQuery = useClasses(campaignId)
  const equipmentQuery = useEquipment(campaignId)
  const skillsQuery = useSkillProficiencies(campaignId)
  const spellsQuery = useSpells(campaignId)
  const rulesetQuery = useRulesetPatch(campaignId)
  const rulesetPatch = rulesetQuery.data
  const magicPropertyProvider = useMemo(
    () => createMagicPropertyDefinitionProvider(monster.rulesetId),
    [monster.rulesetId],
  )
  const armorClassRules = rulesetPatch?.mechanics.armorClass
  const equipment = equipmentQuery.data
  const skillProficiencies = skillsQuery.data

  const catalogState: MonsterCatalogLoadState = useMemo(() => {
    if (equipmentQuery.isPending || skillsQuery.isPending || rulesetQuery.isPending)
      return 'pending'
    if (equipmentQuery.isLoadingError || skillsQuery.isLoadingError || rulesetQuery.isError) {
      return 'error'
    }
    return 'ready'
  }, [
    equipmentQuery.isLoadingError,
    equipmentQuery.isPending,
    skillsQuery.isLoadingError,
    skillsQuery.isPending,
    rulesetQuery.isError,
    rulesetQuery.isPending,
  ])

  const catalogLoadErrors =
    catalogState === 'error'
      ? failedMonsterCatalogSubjects(equipmentQuery.isLoadingError, skillsQuery.isLoadingError)
      : undefined

  const derived = useMemo(() => {
    if (catalogState !== 'ready') return null
    return tryDeriveMonsterStatBlock(monster, equipment ?? [], skillProficiencies ?? [], {
      armorClassRules,
      magicPropertyProvider,
    })
  }, [armorClassRules, catalogState, equipment, magicPropertyProvider, monster, skillProficiencies])

  const equipmentById = useMemo(() => buildMonsterEquipmentCatalog(equipment ?? []), [equipment])

  const viewModel = useMemo(
    () =>
      buildMonsterDetailViewModel({
        monster,
        creatureTypeLabel: getCreatureTypeLabel(creatureTypeVocabulary, monster.creatureType),
        familyLabel: (id) => {
          const row = familyVocabulary?.byId.get(id)
          return formatMonsterClassificationReference(
            id,
            row?.label,
            row?.status === 'disabled' ? MONSTER_CLASSIFICATION_DISABLED : undefined,
          )
        },
        classLabel: (id) => {
          const row = classesQuery.data?.find((row) => row.id === id)
          return formatMonsterClassificationReference(
            id,
            row?.name,
            row?.status === 'draft' ? MONSTER_CLASSIFICATION_DRAFT : undefined,
          )
        },
        equipmentById,
        catalogState: derived === null && catalogState === 'ready' ? 'error' : catalogState,
        derived,
        spellsById: new Map((spellsQuery.data ?? []).map((spell) => [spell.id, spell])),
        spellCatalogStatus: spellsQuery.isError
          ? 'unavailable'
          : spellsQuery.isPending
            ? 'unavailable'
            : 'ready',
        magicPropertyProvider,
      }),
    [
      catalogState,
      creatureTypeVocabulary,
      familyVocabulary,
      classesQuery.data,
      derived,
      equipmentById,
      monster,
      spellsQuery.data,
      magicPropertyProvider,
      spellsQuery.isError,
      spellsQuery.isPending,
    ],
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
