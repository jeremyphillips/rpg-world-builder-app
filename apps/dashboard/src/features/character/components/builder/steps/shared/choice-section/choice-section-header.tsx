import type { BuilderChoiceBlock, BuilderChoiceSectionModel } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Heading } from '@rpg/ui'

import { ChoiceAddAction } from './choice-add-action'
import { ChoiceSectionValidationMessages } from './choice-section-validation-messages'
import { ChoiceSectionSupportingCopy } from './choice-section-supporting-copy'
import { ChoiceSelectionCounter } from './choice-selection-counter'
import {
  choiceSectionHeaderActionClasses,
  choiceSectionHeaderClasses,
  choiceSectionHeaderDetailsClasses,
  choiceSectionHeaderMainClasses,
  choiceSectionHeadingRowClasses,
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
      <div className={choiceSectionHeaderMainClasses}>
        <div className={choiceSectionHeadingRowClasses}>
          <Heading variant="subsection" as="h3" id={headingId}>
            {section.heading}
          </Heading>
          {section.aggregateCount ? (
            <ChoiceSelectionCounter
              selectedCount={section.aggregateCount.selected}
              max={section.aggregateCount.max}
              verb={section.aggregateCount.verb}
              requiredToComplete={section.aggregateCount.requiredToComplete}
              effectiveRequiredCount={section.aggregateCount.effectiveRequiredCount}
            />
          ) : null}
        </div>
      </div>

      {singleChoiceBlock && singleChoiceBlock.isInteractive !== false ? (
        <div className={choiceSectionHeaderActionClasses}>
          <ChoiceAddAction
            compactAddLabel={singleChoiceBlock.compactAddLabel}
            isFull={singleChoiceBlock.isFull}
            onClick={() => onOpenChoiceSet(singleChoiceBlock.choiceSet.id)}
          />
        </div>
      ) : null}

      <div className={choiceSectionHeaderDetailsClasses}>
        <ChoiceSectionSupportingCopy section={section} singleChoiceBlock={singleChoiceBlock} />
        {!isMultiBlockSection ? (
          <ChoiceSectionValidationMessages issues={sectionValidationIssues} />
        ) : null}
      </div>
    </div>
  )
}
