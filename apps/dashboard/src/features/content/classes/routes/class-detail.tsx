import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type CharacterClass, type SkillProficiency, type Subclass } from '@rpg/contracts'

import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { WidePage } from '@/components/layout/page/wide-page'
import { useCampaignRules } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'
import { resolveCampaignSpellcastingProgression } from '@/lib/campaign-spellcasting-progression.lib'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useClasses } from '../hooks/use-classes'
import { useSubclasses } from '../hooks/use-subclasses'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentDisplayImage } from '../../lib/detail/page/content-display-image'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { ClassProgressionTable } from '../components/detail/class-progression-table'
import { ClassDetailBody } from '../components/detail/class-detail-body'
import { buildClassDetailViewModel, projectVisibleClassFeatures } from '../lib/class-display'

type ClassDetailContentProps = {
  characterClass: CharacterClass
  campaignId: string
  classId: string
  subclasses: Subclass[]
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  showProgressionTable?: boolean
}

export function ClassDetailContent({
  characterClass,
  campaignId,
  classId,
  subclasses,
  skillProficiencies,
  skillsPending,
  showProgressionTable = true,
}: ClassDetailContentProps) {
  useSetBreadcrumbLabel(characterClass.name)
  const campaignRules = useCampaignRules(campaignId)
  const { data: rulesetPatch } = useRulesetPatch(campaignId)
  const spellcastingProgression = useMemo(
    () =>
      resolveCampaignSpellcastingProgression(
        characterClass.rulesetId,
        rulesetPatch?.characterCreation.progression.spellcasting,
      ),
    [characterClass.rulesetId, rulesetPatch?.characterCreation.progression.spellcasting],
  )
  const subclassingEnabled = campaignRules.subclassing.enabled
  const visibleFeatures = projectVisibleClassFeatures(characterClass.features, {
    subclassingEnabled,
  })

  const vocabulary = {
    resolveToolLabel: (slug: string) =>
      slug
        .split('-')
        .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join(' '),
  }

  const viewModel = buildClassDetailViewModel(characterClass, vocabulary, {
    surface: 'content-detail',
    features: visibleFeatures,
  })

  return (
    <WidePage rhythm="relaxed">
      <ClassDetailBody
        name={characterClass.name}
        nameBadge={<ContentStatusNameBadge status={characterClass.status} />}
        displayImage={getContentDisplayImage({
          media: characterClass.media,
          imageKey: characterClass.imageKey,
          contentType: 'classes',
          slug: characterClass.slug,
          contentSource: characterClass.source,
          rulesetId: characterClass.rulesetId,
          role: 'primary',
        })}
        imageName={characterClass.name}
        viewModel={viewModel}
        subclasses={subclasses}
        subclassingEnabled={subclassingEnabled}
        campaignId={campaignId}
        skillProficiencies={skillProficiencies}
        skillsPending={skillsPending}
        vocabulary={vocabulary}
        editHref={contentEditHref('classes', campaignId, classId)}
      >
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="classes"
          entityId={classId}
        />
      </ClassDetailBody>
      {showProgressionTable ? (
        <ClassProgressionTable
          characterClass={characterClass}
          spellcastingProgression={spellcastingProgression}
          campaignRules={campaignRules}
        />
      ) : null}
    </WidePage>
  )
}

export function ClassDetail() {
  const { campaignId = '', classId = '' } = useParams<{ campaignId: string; classId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)
  const { data: subclasses = [] } = useSubclasses(campaignId, classId)
  const { data: skillProficiencies = [], isPending: skillsPending } =
    useSkillProficiencies(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={classes}
      itemId={classId}
      loadErrorLabel={formatContentListLoadErrorMessage('classes')}
      notFoundLabel={formatContentNotFoundMessage('classes')}
    >
      {(characterClass) => (
        <ClassDetailContent
          characterClass={characterClass}
          campaignId={campaignId}
          classId={classId}
          subclasses={subclasses}
          skillProficiencies={skillProficiencies}
          skillsPending={skillsPending}
        />
      )}
    </ContentDetailResolver>
  )
}
