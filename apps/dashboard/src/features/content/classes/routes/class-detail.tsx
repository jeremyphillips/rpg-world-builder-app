import { useParams } from 'react-router-dom'
import { type CharacterClass, type SkillProficiency, type Subclass } from '@rpg/contracts'

import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { WidePage } from '@/components/layout/page/wide-page'
import { useCampaignRules } from '@/features/campaign'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useClasses } from '../hooks/use-classes'
import { useSubclasses } from '../hooks/use-subclasses'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { ClassProgressionTable } from '../components/detail/class-progression-table'
import { ClassDetailBody } from '../components/detail/class-detail-body'
import { isSubclassChoiceFeatureRow } from '../lib/class-subclass-choice-features'
import { buildClassDetailViewModel } from '../lib/class-display'

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
  const subclassingEnabled = campaignRules.subclassing.enabled
  const visibleFeatures = subclassingEnabled
    ? characterClass.features
    : characterClass.features.filter((feature) => !isSubclassChoiceFeatureRow(feature))

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
    <WidePage spacing="relaxed">
      <ClassDetailBody
        name={characterClass.name}
        nameBadge={<ContentStatusNameBadge status={characterClass.status} />}
        imageUrl={getContentImageUrl(characterClass.imageKey)}
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
        <ClassProgressionTable characterClass={characterClass} campaignRules={campaignRules} />
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
