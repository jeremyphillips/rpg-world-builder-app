import { ChoiceSelectionCounter, Heading, Text, type ChoiceSelectionCounterProps } from '@rpg/ui'

import { QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE } from './quick-npc-starting-choices.variants'
import {
  quickNpcStartingChoiceHeadingRowClasses,
  quickNpcStartingChoiceIdentityStackClasses,
  quickNpcStartingChoiceProvenanceClasses,
  quickNpcStartingChoiceSubsectionDescriptionClasses,
} from './quick-npc-starting-choices.variants'

export type QuickNpcStartingChoiceSubsectionHeaderProps = {
  title: string
  description: string
  subtitle?: string
  selectionCounter?: Pick<ChoiceSelectionCounterProps, 'selectedCount' | 'max' | 'verb'>
  itemCountLabel?: string
}

export function QuickNpcStartingChoiceSubsectionHeader({
  title,
  description,
  subtitle,
  selectionCounter,
  itemCountLabel,
}: QuickNpcStartingChoiceSubsectionHeaderProps) {
  return (
    <div className={quickNpcStartingChoiceIdentityStackClasses}>
      <div className={quickNpcStartingChoiceHeadingRowClasses}>
        <Heading variant="group" as="p">
          {title}
        </Heading>
        {selectionCounter ? (
          <ChoiceSelectionCounter
            {...selectionCounter}
            size={QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE}
          />
        ) : itemCountLabel ? (
          <Text variant="caption" className="text-muted-foreground">
            {itemCountLabel}
          </Text>
        ) : null}
      </div>
      {subtitle ? <p className={quickNpcStartingChoiceProvenanceClasses}>{subtitle}</p> : null}
      <p className={quickNpcStartingChoiceSubsectionDescriptionClasses}>{description}</p>
    </div>
  )
}
