import type { ReactNode } from 'react'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import type { ContentTable } from '@rpg/contracts'
import {
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type SkillProficiency,
  type Subclass,
} from '@rpg/contracts'

import { ContentTableView } from '../../../components/tables/content-table-view'
import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { contentDetailNavItemId } from '../../../lib/detail/page/content-detail-nav-anchor-id'
import {
  ContentDetailSection,
  ContentDetailSectionItem,
} from '../../../lib/detail/page/content-detail-section'
import { ClassProficienciesSection } from './class-proficiencies-section'
import {
  type ClassDetailViewModel,
  type ClassDisplayVocabulary,
  type ClassFeatureDetailItem,
} from '../../lib/class-display'

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
            <RichTextContent html={feature.description} size="md" tone="muted" />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function SubclassesList({ subclasses }: { subclasses: Subclass[] }) {
  if (subclasses.length === 0) return null

  return (
    <ContentDetailSection heading="Subclasses" headingId={SUBCLASSES_HEADING_ID}>
      <ul className="space-y-6" role="list">
        {subclasses.map((sub) => (
          <li key={sub.id}>
            <ContentDetailSectionItem
              id={contentDetailNavItemId('subclass', sub.id)}
              label={sub.name}
            >
              {sub.tagline ? (
                <Text variant="small" className="italic">
                  {sub.tagline}
                </Text>
              ) : null}
              {sub.description ? (
                <RichTextContent html={sub.description} size="md" tone="muted" />
              ) : null}
              <SubclassFeaturesList features={sub.features} />
            </ContentDetailSectionItem>
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

function ClassFeatureDetailRow({ item }: { item: ClassFeatureDetailItem }) {
  const inlineTables = (item.tables ?? []).filter((table) => table.kind === 'general')

  return (
    <ContentDetailSectionItem
      id={contentDetailNavItemId('feature', item.id)}
      label={item.title}
      navLabel={`Level ${item.level}: ${item.title}`}
    >
      {item.bodyHtml ? <RichTextContent html={item.bodyHtml} size="md" tone="muted" /> : null}
      {inlineTables.length > 0 ? (
        <div className="space-y-4">
          {inlineTables.map((table: ContentTable) => (
            <ContentTableView key={table.id} table={table} />
          ))}
        </div>
      ) : null}
    </ContentDetailSectionItem>
  )
}

function ClassFeaturesSection({
  section,
}: {
  section: Extract<ClassDetailViewModel['sections'][number], { id: 'features' }>
}) {
  return (
    <ContentDetailSection heading={section.title} headingId={FEATURES_HEADING_ID}>
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <li key={item.id}>
            <ClassFeatureDetailRow item={item} />
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

function ClassDetailSections({
  sections,
  campaignId,
  skillProficiencies,
  skillsPending,
  vocabulary,
}: {
  sections: ClassDetailViewModel['sections']
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
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
  subclassingEnabled: boolean
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
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
  subclassingEnabled,
  campaignId,
  skillProficiencies,
  skillsPending,
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
          <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
        ) : undefined
      }
    >
      <ClassDetailSections
        sections={viewModel.sections}
        campaignId={campaignId}
        skillProficiencies={skillProficiencies}
        skillsPending={skillsPending}
        vocabulary={vocabulary}
      />
      {subclassingEnabled ? <SubclassesList subclasses={subclasses} /> : null}
      {progressionTable}
      {children}
    </ContentDetailLayout>
  )
}
