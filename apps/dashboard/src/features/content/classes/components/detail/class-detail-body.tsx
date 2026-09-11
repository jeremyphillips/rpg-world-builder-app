import type { ReactNode } from 'react'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import { type SkillProficiency, type Subclass } from '@rpg/contracts'

import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { ClassProficienciesSection } from './class-proficiencies-section'
import { ClassFeatureItem as ClassFeatureRow } from './class-feature-item'
import {
  type ClassDetailViewModel,
  type ClassDisplayVocabulary,
  type ClassFeatureDetailItem,
} from '../../lib/class-display'

function SubclassFeaturesList({ features }: { features: Subclass['features'] }) {
  if (features.length === 0) return null
  const sorted = [...features].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  return (
    <ul className="mt-4 space-y-4" role="list">
      {sorted.map((feature) => (
        <ClassFeatureRow key={feature.id} feature={feature} />
      ))}
    </ul>
  )
}

function SubclassesList({ subclasses }: { subclasses: Subclass[] }) {
  if (subclasses.length === 0) return null
  return (
    <section aria-labelledby="subclasses-heading">
      <Heading variant="section" as="h2" id="subclasses-heading" className="mb-4">
        Subclasses
      </Heading>
      <ul className="space-y-6" role="list">
        {subclasses.map((sub) => (
          <li key={sub.id} className="space-y-2">
            <Heading variant="label" as="p">
              {sub.name}
            </Heading>
            {sub.tagline && (
              <Text variant="small" className="italic">
                {sub.tagline}
              </Text>
            )}
            {sub.description && <RichTextContent html={sub.description} size="md" tone="muted" />}
            <SubclassFeaturesList features={sub.features} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ClassFeaturesSection({
  section,
}: {
  section: Extract<ClassDetailViewModel['sections'][number], { id: 'features' }>
}) {
  return (
    <section aria-labelledby="features-heading">
      <Heading variant="section" as="h2" id="features-heading" className="mb-4">
        {section.title}
      </Heading>
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <ClassFeatureDetailRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}

function ClassFeatureDetailRow({ item }: { item: ClassFeatureDetailItem }) {
  return (
    <ClassFeatureRow
      feature={{
        level: item.level,
        name: item.title,
        description: item.bodyHtml,
      }}
    />
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
  imageUrl: string
  imageName: string
  viewModel: ClassDetailViewModel
  subclasses: Subclass[]
  subclassingEnabled: boolean
  campaignId: string
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  vocabulary: ClassDisplayVocabulary
  editHref?: string
  children?: ReactNode
}

/** View-model-driven class detail composition — no route chrome, usage, or progression table. */
export function ClassDetailBody({
  name,
  nameBadge,
  imageUrl,
  imageName,
  viewModel,
  subclasses,
  subclassingEnabled,
  campaignId,
  skillProficiencies,
  skillsPending,
  vocabulary,
  editHref,
  children,
}: ClassDetailBodyProps) {
  return (
    <ContentDetailLayout
      name={name}
      nameBadge={nameBadge}
      imageUrl={imageUrl}
      imageName={imageName}
      campaignId={campaignId}
      editHref={editHref}
      statRows={viewModel.statRows}
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
      {children}
    </ContentDetailLayout>
  )
}
