import type { ReactNode } from 'react'
import { Heading, Text } from '@rpg/ui'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { LinkBadge, StaticBadge } from '@/lib/link-badge'

import { ContentStatList } from '../../../lib/detail/metadata/content-stat-row'
import type { ContentStatRowData } from '../../../lib/detail/metadata/content-stat-rows'
import { ContentDetailQueryStatus } from '../../../lib/detail/page/content-detail-query-status'
import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import { contentDetailSectionPanelContentHeadingClasses } from '../../../lib/detail/page/content-detail-section.variants'
import {
  CLASS_DISPLAY_NONE,
  CLASS_PROFICIENCY_GROUP_LABELS,
  type ClassDisplayVocabulary,
  type ClassProficienciesViewModel,
} from '../../lib/class-display'

const PROFICIENCIES_HEADING_ID = 'proficiencies-heading'

type ClassProficienciesSectionProps = {
  section: ClassProficienciesViewModel
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  skillsLoadingError?: boolean
  vocabulary: ClassDisplayVocabulary
}

function grantedProficiencyRows(
  granted: ClassProficienciesViewModel['granted'],
): ContentStatRowData[] {
  return granted.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
  }))
}

function SkillChoiceLinks({
  campaignId,
  optionSlugs,
  skillProficiencies,
  isPending,
  isLoadingError,
}: {
  campaignId: string
  optionSlugs: string[]
  skillProficiencies: readonly SkillProficiency[]
  isPending: boolean
  isLoadingError: boolean
}) {
  if (isLoadingError) {
    return <ContentDetailQueryStatus status="error" subject="skill-proficiencies" />
  }

  if (isPending) {
    return <ContentDetailQueryStatus status="pending" />
  }

  const skillsBySlug = new Map(skillProficiencies.map((skill) => [skill.slug, skill]))

  return (
    <ul className="inline-flex flex-wrap gap-2" role="list">
      {optionSlugs.map((slug) => {
        const skill = skillsBySlug.get(slug)

        return (
          <li key={slug}>
            {skill ? (
              <LinkBadge to={ROUTES.content.skillProficiencies.detail(campaignId, skill.id)}>
                {skill.name}
              </LinkBadge>
            ) : (
              <StaticBadge>{slug}</StaticBadge>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function ToolChoiceLabels({
  optionSlugs,
  vocabulary,
}: {
  optionSlugs: string[]
  vocabulary: ClassDisplayVocabulary
}) {
  return (
    <Text variant="supporting" as="span">
      {optionSlugs.map((slug) => vocabulary.resolveToolLabel(slug)).join(', ')}
    </Text>
  )
}

function proficiencyChoiceRowData(
  row: ClassProficienciesViewModel['choices'][number],
  campaignId: string,
  skillProficiencies: SkillProficiency[],
  skillsPending: boolean,
  skillsLoadingError: boolean,
  vocabulary: ClassDisplayVocabulary,
): ContentStatRowData {
  const isEmpty = row.optionSlugs.length === 0

  let valueContent: ReactNode
  if (isEmpty) {
    valueContent =
      row.compactSummary !== CLASS_DISPLAY_NONE ? row.compactSummary : CLASS_DISPLAY_NONE
  } else if (row.id === 'skills') {
    valueContent = (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <Text variant="supporting" as="span">
          {row.choicePrefix}
        </Text>
        <SkillChoiceLinks
          campaignId={campaignId}
          optionSlugs={row.optionSlugs}
          skillProficiencies={skillProficiencies}
          isPending={skillsPending}
          isLoadingError={skillsLoadingError}
        />
      </div>
    )
  } else if (row.id === 'tools' && row.optionSlugs.length > 0) {
    valueContent = (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <Text variant="supporting" as="span">
          {row.choicePrefix}
        </Text>
        <ToolChoiceLabels optionSlugs={row.optionSlugs} vocabulary={vocabulary} />
      </div>
    )
  } else {
    valueContent = row.compactSummary
  }

  return {
    id: row.id,
    label: row.label,
    value: row.compactSummary,
    valueContent,
  }
}

function GrantedProficienciesGroup({
  granted,
}: {
  granted: ClassProficienciesViewModel['granted']
}) {
  const rows = grantedProficiencyRows(granted)
  if (rows.length === 0) return null

  return (
    <div className="space-y-3">
      <Heading
        variant="subsection"
        as="h3"
        className={contentDetailSectionPanelContentHeadingClasses}
      >
        {CLASS_PROFICIENCY_GROUP_LABELS.granted}
      </Heading>
      <ContentStatList rows={rows} />
    </div>
  )
}

function ProficiencyChoicesGroup({
  choices,
  campaignId,
  skillProficiencies,
  skillsPending,
  skillsLoadingError,
  vocabulary,
}: {
  choices: ClassProficienciesViewModel['choices']
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  skillsLoadingError: boolean
  vocabulary: ClassDisplayVocabulary
}) {
  if (choices.length === 0) return null

  const rows = choices.map((row) =>
    proficiencyChoiceRowData(
      row,
      campaignId,
      skillProficiencies,
      skillsPending,
      skillsLoadingError,
      vocabulary,
    ),
  )

  return (
    <div className="space-y-3">
      <Heading
        variant="subsection"
        as="h3"
        className={contentDetailSectionPanelContentHeadingClasses}
      >
        {CLASS_PROFICIENCY_GROUP_LABELS.choices}
      </Heading>
      <ContentStatList rows={rows} />
    </div>
  )
}

export function ClassProficienciesSection({
  section,
  campaignId,
  skillProficiencies,
  skillsPending,
  skillsLoadingError = false,
  vocabulary,
}: ClassProficienciesSectionProps) {
  return (
    <ContentDetailSection heading={section.title} headingId={PROFICIENCIES_HEADING_ID}>
      <div className="space-y-6">
        <GrantedProficienciesGroup granted={section.granted} />
        <ProficiencyChoicesGroup
          choices={section.choices}
          campaignId={campaignId}
          skillProficiencies={skillProficiencies}
          skillsPending={skillsPending}
          skillsLoadingError={skillsLoadingError}
          vocabulary={vocabulary}
        />
      </div>
    </ContentDetailSection>
  )
}
