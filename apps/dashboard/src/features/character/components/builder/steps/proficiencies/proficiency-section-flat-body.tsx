import type { ProficiencyInteractiveSection } from '@rpg/contracts'
import { EmptyPanel } from '@rpg/ui'

import { PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE } from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencySelectedRow } from './proficiency-selected-row'
import {
  proficiencySectionOverSelectionClasses,
  proficiencySectionSelectedListClasses,
  proficiencySubsectionBodyMarginClasses,
} from './proficiency-section.variants'

type ProficiencySectionFlatBodyProps = {
  section: ProficiencyInteractiveSection
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function ProficiencySectionFlatBody({
  section,
  onRemoveChoice,
}: ProficiencySectionFlatBodyProps) {
  return (
    <>
      {section.isOverSelected ? (
        <p className={proficiencySectionOverSelectionClasses} role="status">
          {PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE}
        </p>
      ) : null}

      {section.selectedRows.length > 0 ? (
        <ul className={proficiencySectionSelectedListClasses}>
          {section.selectedRows.map((row) => (
            <li key={`${row.choiceSetId}:${row.optionId}`}>
              <ProficiencySelectedRow
                row={row}
                onRemove={() => onRemoveChoice(row.choiceSetId, row.optionId)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyPanel className={proficiencySubsectionBodyMarginClasses}>
          {section.emptyMessage}
        </EmptyPanel>
      )}
    </>
  )
}
