import type { BuilderChoiceSectionModel } from '@rpg/contracts'
import { EmptyPanel, Text } from '@rpg/ui'

import { ChoiceGrantedRow } from './choice-granted-row'
import { ChoiceSelectedRow } from './choice-selected-row'
import {
  choiceSectionGrantedListClasses,
  choiceSectionOverSelectionClasses,
  choiceSectionSelectedListClasses,
  choiceSubsectionBodyMarginClasses,
} from './choice-section.variants'

type ChoiceSectionFlatBodyProps = {
  section: BuilderChoiceSectionModel
  overSelectionMessage: string
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function ChoiceSectionFlatBody({
  section,
  overSelectionMessage,
  onRemoveChoice,
}: ChoiceSectionFlatBodyProps) {
  const hasGrantedRows = section.grantedRows.length > 0
  const hasSelectedRows = section.selectedRows.length > 0
  const showEmptyWell =
    !hasSelectedRows &&
    section.choiceBlocks.length > 0 &&
    !section.levelSliceEmptyMessage &&
    section.choiceBlocks.every((block) => block.isInteractive !== false)

  return (
    <>
      {section.isOverSelected ? (
        <p className={choiceSectionOverSelectionClasses} role="status">
          {overSelectionMessage}
        </p>
      ) : null}

      {section.levelSliceEmptyMessage ? (
        <Text variant="muted" className={choiceSubsectionBodyMarginClasses}>
          {section.levelSliceEmptyMessage}
        </Text>
      ) : null}

      {hasGrantedRows ? (
        <ul className={choiceSectionGrantedListClasses}>
          {section.grantedRows.map((row) => (
            <li key={row.id}>
              <ChoiceGrantedRow row={row} />
            </li>
          ))}
        </ul>
      ) : null}

      {hasSelectedRows ? (
        <ul className={choiceSectionSelectedListClasses}>
          {section.selectedRows.map((row) => (
            <li key={`${row.choiceSetId}:${row.optionId}`}>
              <ChoiceSelectedRow
                row={row}
                onRemove={() => onRemoveChoice(row.choiceSetId, row.optionId)}
              />
            </li>
          ))}
        </ul>
      ) : showEmptyWell ? (
        <EmptyPanel className={choiceSubsectionBodyMarginClasses}>
          {section.emptyMessage}
        </EmptyPanel>
      ) : null}
    </>
  )
}
