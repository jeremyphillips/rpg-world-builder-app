import type { ReactNode } from 'react'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import {
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type SkillProficiency,
  type Subclass,
} from '@rpg/contracts'

import { DetailNavFlushStack } from '../../../lib/detail/collection/item-stack/detail-nav-flush-stack'
import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { ContentDetailQueryStatus } from '../../../lib/detail/page/content-detail-query-status'
import { contentDetailProseProps } from '../../../lib/detail/page/content-detail-prose'
import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import { ClassFeatureLevelTable } from './class-feature-level-table'
import { ClassProficienciesSection } from './class-proficiencies-section'
import { type ClassDetailViewModel, type ClassDisplayVocabulary } from '../../lib/class-display'

const FEATURES_HEADING_ID = 'features-heading'
const SUBCLASSES_HEADING_ID = 'subclasses-heading'

function SubclassFeaturesList({ features }: { features: Subclass['features'] }) {
  if (features.length === 0) return null
  const sorted = [...features].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  return (
    <ul className="mt-4 space-y-4" role="list">
      {sorted.map((feature) => (
        <li key={feature.id} className="space-y-2">
          <Heading variant="label" as="p">
            {`Level ${feature.level}: ${feature.name}`}
          </Heading>
          {feature.description ? (
            <RichTextContent html={feature.description} {...contentDetailProseProps} />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function SubclassesList({
  subclasses,
  isPending,
  isLoadingError,
}: {
  subclasses: readonly Subclass[]
  isPending: boolean
  isLoadingError: boolean
}) {
  if (isLoadingError) {
    return (
      <ContentDetailSection heading="Subclasses" headingId={SUBCLASSES_HEADING_ID}>
        <ContentDetailQueryStatus status="error" subject="subclasses" />
      </ContentDetailSection>
    )
  }

  if (isPending) {
    return (
      <ContentDetailSection heading="Subclasses" headingId={SUBCLASSES_HEADING_ID}>
        <ContentDetailQueryStatus status="pending" />
      </ContentDetailSection>
    )
  }

  if (subclasses.length === 0) return null

  return (
    <ContentDetailSection heading="Subclasses" headingId={SUBCLASSES_HEADING_ID} bodyLayout="flush">
      <DetailNavFlushStack
        navPrefix="subclass"
        items={subclasses}
        getLabel={(sub) => sub.name}
        renderItem={(sub) => (
          <>
            {sub.tagline ? (
              <Text variant="supporting" className="italic">
                {sub.tagline}
              </Text>
            ) : null}
            {sub.description ? (
              <RichTextContent html={sub.description} {...contentDetailProseProps} />
            ) : null}
            <SubclassFeaturesList features={sub.features} />
          </>
        )}
      />
    </ContentDetailSection>
  )
}

function ClassFeaturesSection({
  section,
}: {
  section: Extract<ClassDetailViewModel['sections'][number], { id: 'features' }>
}) {
  return (
    <ContentDetailSection
      heading={section.title}
      headingId={FEATURES_HEADING_ID}
      bodyLayout="flush"
    >
      <ClassFeatureLevelTable items={section.items} />
    </ContentDetailSection>
  )
}

function ClassDetailSections({
  sections,
  campaignId,
  skillProficiencies,
  skillsPending,
  skillsLoadingError,
  vocabulary,
}: {
  sections: ClassDetailViewModel['sections']
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  skillsLoadingError: boolean
  vocabulary: ClassDisplayVocabulary
}) {
  return (
    <>
      {sections.map((section) =>
        section.id === 'proficiencies' ? (
          <ClassProficienciesSection
            key={section.id}
            section={section}
            campaignId={campaignId}
            skillProficiencies={skillProficiencies}
            skillsPending={skillsPending}
            skillsLoadingError={skillsLoadingError}
            vocabulary={vocabulary}
          />
        ) : (
          <ClassFeaturesSection key={section.id} section={section} />
        ),
      )}
    </>
  )
}

export type ClassDetailBodyProps = {
  name: string
  nameBadge?: ReactNode
  displayImage?: ContentDisplayImage
  displayFallback?: ContentDisplayFallback
  imageName: string
  viewModel: ClassDetailViewModel
  subclasses: Subclass[]
  subclassesPending?: boolean
  subclassesLoadingError?: boolean
  subclassingEnabled: boolean
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  skillsLoadingError?: boolean
  vocabulary: ClassDisplayVocabulary
  editHref?: string
  progressionTable?: ReactNode
  children?: ReactNode
  pageShell?: boolean
}

/** View-model-driven class detail composition — no route chrome or usage section. */
export function ClassDetailBody({
  name,
  nameBadge,
  displayImage,
  displayFallback,
  imageName,
  viewModel,
  subclasses,
  subclassesPending = false,
  subclassesLoadingError = false,
  subclassingEnabled,
  campaignId,
  skillProficiencies,
  skillsPending,
  skillsLoadingError = false,
  vocabulary,
  editHref,
  progressionTable,
  children,
  pageShell,
}: ClassDetailBodyProps) {
  return (
    <ContentDetailLayout
      pageShell={pageShell}
      contentTypeKey="classes"
      name={name}
      nameBadge={nameBadge}
      displayImage={displayImage}
      displayFallback={displayFallback}
      imageName={imageName}
      campaignId={campaignId}
      editHref={editHref}
      statRows={viewModel.statRows}
      heroDescription={false}
      descriptionContent={
        viewModel.descriptionHtml ? (
          <RichTextContent html={viewModel.descriptionHtml} {...contentDetailProseProps} />
        ) : undefined
      }
    >
      <ClassDetailSections
        sections={viewModel.sections}
        campaignId={campaignId}
        skillProficiencies={skillProficiencies}
        skillsPending={skillsPending}
        skillsLoadingError={skillsLoadingError}
        vocabulary={vocabulary}
      />
      {subclassingEnabled ? (
        <SubclassesList
          subclasses={subclasses}
          isPending={subclassesPending}
          isLoadingError={subclassesLoadingError}
        />
      ) : null}
      {progressionTable}
      {children}
    </ContentDetailLayout>
  )
}
