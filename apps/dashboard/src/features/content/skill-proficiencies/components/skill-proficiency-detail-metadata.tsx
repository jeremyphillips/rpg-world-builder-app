import { Heading, Text } from '@rpg/ui'

import { ContentStatRow, type ContentStatRowSize } from '../../lib/detail/metadata/content-stat-row'
import { type SkillProficiencyDetailViewModel } from '../lib/skill-proficiency-display'

export type SkillProficiencyDetailMetadataProps = {
  viewModel: SkillProficiencyDetailViewModel
  statRowSize?: ContentStatRowSize
}

export function SkillProficiencyDetailMetadata({
  viewModel,
  statRowSize = 'sm',
}: SkillProficiencyDetailMetadataProps) {
  return (
    <section className="space-y-3" aria-label="Skill details">
      <ContentStatRow
        size={statRowSize}
        label="Governing Ability"
        value={viewModel.governingAbilityLabel}
      />

      {viewModel.summarySentence ? <Text variant="muted">{viewModel.summarySentence}</Text> : null}

      {viewModel.examples.length > 0 ? (
        <section aria-labelledby="skill-examples-heading">
          <Heading variant="label" as="h4" id="skill-examples-heading" className="mb-2">
            {viewModel.examplesSectionTitle}
          </Heading>
          <ul className="list-disc space-y-1 pl-5" role="list">
            {viewModel.examples.map((example) => (
              <li key={example}>
                <Text variant="muted">{example}</Text>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  )
}
