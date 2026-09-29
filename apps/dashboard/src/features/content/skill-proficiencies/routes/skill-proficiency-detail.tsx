import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { RichTextContent, Text } from '@rpg/ui'
import { classesOfferingSkillChoice } from '@rpg/contracts'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useClasses } from '../../classes/hooks/use-classes'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentDetailSection } from '../../lib/detail/page/content-detail-section'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { ContentStatRowInlineLinks } from '../../lib/detail/metadata/content-stat-row-inline-links'
import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import {
  buildSkillProficiencyDetailViewModel,
  buildSkillProficiencyHeroStatRows,
  SKILL_PROFICIENCY_DETAIL_STAT_LABELS,
} from '../lib/skill-proficiency-display'

const SKILL_EXAMPLES_HEADING_ID = 'skill-examples-heading'

function SkillExamplesList({
  examples,
  sectionTitle,
}: {
  examples: string[]
  sectionTitle: string
}) {
  if (examples.length === 0) return null

  return (
    <ContentDetailSection heading={sectionTitle} headingId={SKILL_EXAMPLES_HEADING_ID}>
      <ul className="list-disc space-y-1 pl-5" role="list">
        {examples.map((example) => (
          <li key={example}>
            <Text variant="muted">{example}</Text>
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

type SkillDetailContentProps = {
  skill: SkillProficiency
  campaignId: string
  skillId: string
}

export function SkillDetailContent({ skill, campaignId, skillId }: SkillDetailContentProps) {
  useSetBreadcrumbLabel(skill.name)
  const viewModel = buildSkillProficiencyDetailViewModel(skill)
  const { data: classes = [], isPending: classesPending } = useClasses(campaignId)
  const offeringClasses = classesOfferingSkillChoice(skill.slug, classes)

  const statRows = useMemo((): ContentStatRowData[] => {
    const rows = buildSkillProficiencyHeroStatRows(viewModel.governingAbilityLabel)

    if (classesPending) {
      rows.push({
        label: SKILL_PROFICIENCY_DETAIL_STAT_LABELS.classSkillChoices,
        value: 'Loading…',
      })
    } else if (offeringClasses.length > 0) {
      rows.push({
        label: SKILL_PROFICIENCY_DETAIL_STAT_LABELS.classSkillChoices,
        value: offeringClasses.map((cls) => cls.name).join(', '),
        valueContent: (
          <ContentStatRowInlineLinks
            items={offeringClasses.map((cls) => ({
              to: ROUTES.content.classes.detail(campaignId, cls.id),
              label: cls.name,
            }))}
          />
        ),
      })
    }

    return rows
  }, [campaignId, classesPending, offeringClasses, viewModel.governingAbilityLabel])

  return (
    <ContentDetailLayout
      contentTypeKey="skill-proficiencies"
      name={skill.name}
      nameBadge={<ContentStatusNameBadge status={skill.status} />}
      imageName={skill.name}
      campaignId={campaignId}
      editHref={contentEditHref('skillProficiencies', campaignId, skillId)}
      heroDescription={false}
      statRows={statRows}
      descriptionContent={
        skill.description ? (
          <RichTextContent html={skill.description} size="md" tone="muted" />
        ) : undefined
      }
    >
      <SkillExamplesList
        examples={viewModel.examples}
        sectionTitle={viewModel.examplesSectionTitle}
      />
      <ContentUsageReferencesSection
        campaignId={campaignId}
        routeKey="skill-proficiencies"
        entityId={skillId}
      />
    </ContentDetailLayout>
  )
}

export function SkillProficiencyDetail() {
  const { campaignId = '', skillId = '' } = useParams<{ campaignId: string; skillId: string }>()
  const { data: skillProficiencies = [], isPending, isError } = useSkillProficiencies(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={skillProficiencies}
      itemId={skillId}
      loadErrorLabel={formatContentListLoadErrorMessage('skill-proficiencies')}
      notFoundLabel={formatContentNotFoundMessage('skill-proficiencies')}
    >
      {(skill) => <SkillDetailContent skill={skill} campaignId={campaignId} skillId={skillId} />}
    </ContentDetailResolver>
  )
}
