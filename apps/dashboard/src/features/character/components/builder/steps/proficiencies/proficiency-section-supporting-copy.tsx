import type { ProficiencyChoiceBlock, ProficiencyInteractiveSection } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  proficiencySectionIdentityLineClasses,
  proficiencySectionSourceLineClasses,
  proficiencySectionSubheadClasses,
} from './proficiency-section.variants'

type ProficiencySectionSupportingCopyProps = {
  section: ProficiencyInteractiveSection
  singleChoiceBlock?: ProficiencyChoiceBlock
}

export function ProficiencySectionSupportingCopy({
  section,
  singleChoiceBlock,
}: ProficiencySectionSupportingCopyProps) {
  if (singleChoiceBlock) {
    return (
      <>
        {section.identityLine ? (
          <p className={proficiencySectionIdentityLineClasses}>{section.identityLine}</p>
        ) : null}
        {section.subhead ? (
          <p className={proficiencySectionSubheadClasses}>{section.subhead}</p>
        ) : null}
        {singleChoiceBlock.sourceLine ? (
          <Text className={proficiencySectionSourceLineClasses}>
            {singleChoiceBlock.sourceLine}
          </Text>
        ) : null}
      </>
    )
  }

  if (!section.subhead) return null

  return <p className={proficiencySectionSubheadClasses}>{section.subhead}</p>
}
