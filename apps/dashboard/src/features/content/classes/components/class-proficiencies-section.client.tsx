import { Heading, Text } from '@rpg/ui'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { ContentLinkBadge, ContentStaticBadge } from '../../lib/detail/content-link-badge'
import {
  CLASS_DISPLAY_NONE,
  CLASS_PROFICIENCY_GROUP_LABELS,
  type ClassDisplayVocabulary,
  type ClassProficienciesViewModel,
} from '../lib/class-display'

type ClassProficienciesSectionProps = {
  section: ClassProficienciesViewModel
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  vocabulary: ClassDisplayVocabulary
}

function GrantedProficienciesGroup({
  granted,
}: {
  granted: ClassProficienciesViewModel['granted']
}) {
  if (granted.length === 0) return null

  return (
    <div className="space-y-3">
      <Heading variant="subsection" as="h3">
        {CLASS_PROFICIENCY_GROUP_LABELS.granted}
      </Heading>
      <dl className="space-y-3">
        {granted.map((row) => (
          <div key={row.id} className="space-y-1">
            <Heading variant="label" as="dt">
              {row.label}
            </Heading>
            <Text variant="muted" as="dd">
              {row.value}
            </Text>
          </div>
        ))}
      </dl>
    </div>
  )
}

function SkillChoiceLinks({
  campaignId,
  optionSlugs,
  skillProficiencies,
  isPending,
}: {
  campaignId: string
  optionSlugs: string[]
  skillProficiencies: SkillProficiency[]
  isPending: boolean
}) {
  if (isPending) {
    return <Text variant="muted">Loading…</Text>
  }

  const skillsBySlug = new Map(skillProficiencies.map((skill) => [skill.slug, skill]))

  return (
    <ul className="inline-flex flex-wrap gap-2" role="list">
      {optionSlugs.map((slug) => {
        const skill = skillsBySlug.get(slug)

        return (
          <li key={slug}>
            {skill ? (
              <ContentLinkBadge to={ROUTES.content.skillProficiencies.detail(campaignId, skill.id)}>
                {skill.name}
              </ContentLinkBadge>
            ) : (
              <ContentStaticBadge>{slug}</ContentStaticBadge>
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
    <Text variant="muted" as="span">
      {optionSlugs.map((slug) => vocabulary.resolveToolLabel(slug)).join(', ')}
    </Text>
  )
}

function ProficiencyChoiceRow({
  row,
  campaignId,
  skillProficiencies,
  skillsPending,
  vocabulary,
}: {
  row: ClassProficienciesViewModel['choices'][number]
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  vocabulary: ClassDisplayVocabulary
}) {
  const isEmpty = row.optionSlugs.length === 0

  return (
    <div className="space-y-1">
      <Heading variant="label" as="dt">
        {row.label}
      </Heading>
      <dd className="space-y-2">
        {isEmpty ? (
          row.compactSummary !== CLASS_DISPLAY_NONE ? (
            <Text variant="muted">{row.compactSummary}</Text>
          ) : (
            <Text variant="muted">{CLASS_DISPLAY_NONE}</Text>
          )
        ) : row.id === 'skills' ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <Text variant="muted" as="span">
              {row.choicePrefix}
            </Text>
            <SkillChoiceLinks
              campaignId={campaignId}
              optionSlugs={row.optionSlugs}
              skillProficiencies={skillProficiencies}
              isPending={skillsPending}
            />
          </div>
        ) : row.id === 'tools' ? (
          row.optionSlugs.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Text variant="muted" as="span">
                {row.choicePrefix}
              </Text>
              <ToolChoiceLabels optionSlugs={row.optionSlugs} vocabulary={vocabulary} />
            </div>
          ) : (
            <Text variant="muted">{row.compactSummary}</Text>
          )
        ) : (
          <Text variant="muted">{row.compactSummary}</Text>
        )}
      </dd>
    </div>
  )
}

function ProficiencyChoicesGroup({
  choices,
  campaignId,
  skillProficiencies,
  skillsPending,
  vocabulary,
}: {
  choices: ClassProficienciesViewModel['choices']
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  vocabulary: ClassDisplayVocabulary
}) {
  if (choices.length === 0) return null

  return (
    <div className="space-y-3">
      <Heading variant="subsection" as="h3">
        {CLASS_PROFICIENCY_GROUP_LABELS.choices}
      </Heading>
      <dl className="space-y-3">
        {choices.map((row) => (
          <ProficiencyChoiceRow
            key={row.id}
            row={row}
            campaignId={campaignId}
            skillProficiencies={skillProficiencies}
            skillsPending={skillsPending}
            vocabulary={vocabulary}
          />
        ))}
      </dl>
    </div>
  )
}

export function ClassProficienciesSection({
  section,
  campaignId,
  skillProficiencies,
  skillsPending,
  vocabulary,
}: ClassProficienciesSectionProps) {
  return (
    <section aria-labelledby="proficiencies-heading">
      <Heading variant="section" as="h2" id="proficiencies-heading" className="mb-4">
        {section.title}
      </Heading>
      <div className="space-y-6">
        <GrantedProficienciesGroup granted={section.granted} />
        <ProficiencyChoicesGroup
          choices={section.choices}
          campaignId={campaignId}
          skillProficiencies={skillProficiencies}
          skillsPending={skillsPending}
          vocabulary={vocabulary}
        />
      </div>
    </section>
  )
}
