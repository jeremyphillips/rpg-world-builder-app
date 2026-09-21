import type { BuilderChoiceBlock, BuilderChoiceSectionModel } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Heading } from '@rpg/ui'

import { ChoiceAddAction } from './choice-add-action'
import { ChoiceSectionValidationMessages } from './choice-section-validation-messages'
import { ChoiceSectionSupportingCopy } from './choice-section-supporting-copy'
import { ChoiceSelectionCounter } from './choice-selection-counter'
import {
  choiceSectionHeaderClasses,
  choiceSectionHeadingRowClasses,
  choiceSectionHeaderDetailsClasses,
} from './choice-section.variants'

type ChoiceSectionHeaderProps = {
  section: BuilderChoiceSectionModel
  headingId: string
  singleChoiceBlock?: BuilderChoiceBlock
  sectionValidationIssues: readonly CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
}

export function ChoiceSectionHeader({
  section,
  headingId,
  singleChoiceBlock,
  sectionValidationIssues,
  onOpenChoiceSet,
}: ChoiceSectionHeaderProps) {
  const isMultiBlockSection = section.choiceBlocks.length > 1

  return (
    <div className={choiceSectionHeaderClasses}>
      <div>
        <div className={choiceSectionHeadingRowClasses}>
          <Heading variant="subsection" as="h3" id={headingId}>
            {section.heading}
          </Heading>
          {section.aggregateCount ? (
            <ChoiceSelectionCounter
              selectedCount={section.aggregateCount.selected}
              max={section.aggregateCount.max}
            />
          ) : null}
        </div>
        <div className={choiceSectionHeaderDetailsClasses}>
          <ChoiceSectionSupportingCopy section={section} singleChoiceBlock={singleChoiceBlock} />
          {!isMultiBlockSection ? (
            <ChoiceSectionValidationMessages issues={sectionValidationIssues} />
          ) : null}
        </div>
      </div>

      {singleChoiceBlock ? (
        <ChoiceAddAction
          compactAddLabel={singleChoiceBlock.compactAddLabel}
          isFull={singleChoiceBlock.isFull}
          onClick={() => onOpenChoiceSet(singleChoiceBlock.choiceSet.id)}
        />
      ) : null}
    </div>
  )
}
