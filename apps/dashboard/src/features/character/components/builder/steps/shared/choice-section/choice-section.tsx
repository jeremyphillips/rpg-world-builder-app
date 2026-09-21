import type { BuilderChoiceSectionModel } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import { ChoiceBlockRow } from './choice-block-row'
import { ChoiceSectionFlatBody } from './choice-section-flat-body'
import { ChoiceSectionHeader } from './choice-section-header'
import {
  choiceSectionChoiceBlocksClasses,
  choiceSectionClasses,
  choiceSectionDividerClasses,
} from './choice-section.variants'

export type ChoiceSectionProps = {
  section: BuilderChoiceSectionModel
  sectionIdPrefix: string
  overSelectionMessage: string
  validationIssues?: readonly CharacterBuildValidationIssue[]
  validationIssuesForChoiceSet?: (
    issues: readonly CharacterBuildValidationIssue[],
    choiceSetId: string,
  ) => CharacterBuildValidationIssue[]
  validationIssuesForSection?: (
    issues: readonly CharacterBuildValidationIssue[],
    section: BuilderChoiceSectionModel,
  ) => CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

function selectedRowsForBlock(
  section: BuilderChoiceSectionModel,
  block: BuilderChoiceSectionModel['choiceBlocks'][number],
) {
  return section.selectedRows.filter((row) => row.choiceSetId === block.choiceSet.id)
}

export function ChoiceSection({
  section,
  sectionIdPrefix,
  overSelectionMessage,
  validationIssues = [],
  validationIssuesForChoiceSet = () => [],
  validationIssuesForSection = () => [],
  onOpenChoiceSet,
  onRemoveChoice,
}: ChoiceSectionProps) {
  const headingId = `${sectionIdPrefix}-${section.id}-heading`
  const isMultiBlockSection = section.choiceBlocks.length > 1
  const singleChoiceBlock = isMultiBlockSection ? undefined : section.choiceBlocks[0]
  const sectionValidationIssues = validationIssuesForSection(validationIssues, section)

  return (
    <section aria-labelledby={headingId} className={choiceSectionClasses}>
      <ChoiceSectionHeader
        section={section}
        headingId={headingId}
        singleChoiceBlock={singleChoiceBlock}
        sectionValidationIssues={sectionValidationIssues}
        onOpenChoiceSet={onOpenChoiceSet}
      />

      {!isMultiBlockSection ? (
        <div className={choiceSectionDividerClasses} role="presentation" aria-hidden />
      ) : null}

      {isMultiBlockSection ? (
        <div className={choiceSectionChoiceBlocksClasses}>
          {section.choiceBlocks.map((block) => (
            <ChoiceBlockRow
              key={block.choiceSet.id}
              block={block}
              selectedRows={selectedRowsForBlock(section, block)}
              validationIssues={validationIssuesForChoiceSet(validationIssues, block.choiceSet.id)}
              overSelectionMessage={overSelectionMessage}
              onOpenDrawer={() => onOpenChoiceSet(block.choiceSet.id)}
              onRemoveChoice={onRemoveChoice}
            />
          ))}
        </div>
      ) : (
        <ChoiceSectionFlatBody
          section={section}
          overSelectionMessage={overSelectionMessage}
          onRemoveChoice={onRemoveChoice}
        />
      )}
    </section>
  )
}
