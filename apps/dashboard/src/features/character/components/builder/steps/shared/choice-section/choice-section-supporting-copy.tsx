import type { BuilderChoiceBlock, BuilderChoiceSectionModel } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  choiceSectionIdentityLineClasses,
  choiceSectionSourceLineClasses,
  choiceSectionSubheadClasses,
} from './choice-section.variants'

type ChoiceSectionSupportingCopyProps = {
  section: BuilderChoiceSectionModel
  singleChoiceBlock?: BuilderChoiceBlock
}

export function ChoiceSectionSupportingCopy({
  section,
  singleChoiceBlock,
}: ChoiceSectionSupportingCopyProps) {
  if (singleChoiceBlock) {
    return (
      <>
        {section.identityLine ? (
          <Heading variant="group" as="p" className={choiceSectionIdentityLineClasses}>
            {section.identityLine}
          </Heading>
        ) : null}
        {section.subheadLines?.map((line) => (
          <p key={line} className={choiceSectionSubheadClasses}>
            {line}
          </p>
        ))}
        {section.subhead ? <p className={choiceSectionSubheadClasses}>{section.subhead}</p> : null}
        {singleChoiceBlock.sourceLine ? (
          <Text className={choiceSectionSourceLineClasses}>{singleChoiceBlock.sourceLine}</Text>
        ) : null}
      </>
    )
  }

  if (section.subheadLines?.length) {
    return (
      <>
        {section.subheadLines.map((line) => (
          <p key={line} className={choiceSectionSubheadClasses}>
            {line}
          </p>
        ))}
        {section.subhead ? <p className={choiceSectionSubheadClasses}>{section.subhead}</p> : null}
      </>
    )
  }

  if (!section.subhead) return null

  return <p className={choiceSectionSubheadClasses}>{section.subhead}</p>
}
