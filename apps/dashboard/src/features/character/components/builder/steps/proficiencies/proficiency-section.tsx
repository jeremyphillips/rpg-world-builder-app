import type { ProficiencyInteractiveSection } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  validationIssuesForProficiencyChoiceSet,
  validationIssuesForProficiencySection,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencyChoiceBlockRow } from './proficiency-choice-block-row'
import { ProficiencySectionFlatBody } from './proficiency-section-flat-body'
import { ProficiencySectionHeader } from './proficiency-section-header'
import {
  proficiencySectionChoiceBlocksClasses,
  proficiencySectionClasses,
  proficiencySectionDividerClasses,
} from './proficiency-section.variants'

export type ProficiencySectionProps = {
  section: ProficiencyInteractiveSection
  validationIssues?: readonly CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

function selectedRowsForBlock(
  section: ProficiencyInteractiveSection,
  block: ProficiencyInteractiveSection['choiceBlocks'][number],
) {
  return section.selectedRows.filter((row) => row.choiceSetId === block.choiceSet.id)
}

export function ProficiencySection({
  section,
  validationIssues = [],
  onOpenChoiceSet,
  onRemoveChoice,
}: ProficiencySectionProps) {
  const headingId = `proficiency-section-${section.kind}-heading`
  const isMultiBlockSection = section.choiceBlocks.length > 1
  const singleChoiceBlock = isMultiBlockSection ? undefined : section.choiceBlocks[0]
  const sectionValidationIssues = validationIssuesForProficiencySection(validationIssues, section)

  return (
    <section aria-labelledby={headingId} className={proficiencySectionClasses}>
      <ProficiencySectionHeader
        section={section}
        headingId={headingId}
        singleChoiceBlock={singleChoiceBlock}
        sectionValidationIssues={sectionValidationIssues}
        onOpenChoiceSet={onOpenChoiceSet}
      />

      {!isMultiBlockSection ? (
        <div className={proficiencySectionDividerClasses} role="presentation" aria-hidden />
      ) : null}

      {isMultiBlockSection ? (
        <div className={proficiencySectionChoiceBlocksClasses}>
          {section.choiceBlocks.map((block) => (
            <ProficiencyChoiceBlockRow
              key={block.choiceSet.id}
              block={block}
              selectedRows={selectedRowsForBlock(section, block)}
              validationIssues={validationIssuesForProficiencyChoiceSet(
                validationIssues,
                block.choiceSet.id,
              )}
              onOpenDrawer={() => onOpenChoiceSet(block.choiceSet.id)}
              onRemoveChoice={onRemoveChoice}
            />
          ))}
        </div>
      ) : (
        <ProficiencySectionFlatBody section={section} onRemoveChoice={onRemoveChoice} />
      )}
    </section>
  )
}
