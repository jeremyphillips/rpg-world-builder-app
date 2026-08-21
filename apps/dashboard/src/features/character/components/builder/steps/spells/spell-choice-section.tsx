import type { ChoiceSet } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'
import {
  formatChoiceSetDrawerTriggerLabel,
  formatSpellSelectionCounter,
  isSpellChoiceSetOverSelected,
  resolveSelectedSpellLabels,
} from '../../../../lib/spells/spells-step.lib'
import { shouldShowSelectionFullNotice } from '../../../../lib/choice-sets/selection-counter.lib'
import { BuilderInventoryRemoveAction } from '../../inventory/builder-inventory-remove-action'
import {
  spellChoiceSectionClasses,
  spellChoiceSectionCounterRowClasses,
  spellChoiceSectionHeaderClasses,
  spellChoiceSectionOverSelectionClasses,
  spellChoiceSectionSelectedListClasses,
} from './spell-choice-section.variants'

export type SpellChoiceSectionProps = {
  choiceSet: ChoiceSet
  selectedIds: string[]
  onAdd: () => void
  onRemove: (spellId: string) => void
}

export function SpellChoiceSection({
  choiceSet,
  selectedIds,
  onAdd,
  onRemove,
}: SpellChoiceSectionProps) {
  const selectedSpells = resolveSelectedSpellLabels(choiceSet, selectedIds)
  const selectedCount = selectedIds.length
  const isFull = selectedCount >= choiceSet.max
  const overSelected = isSpellChoiceSetOverSelected(choiceSet, selectedIds)
  const drawerTriggerLabel = formatChoiceSetDrawerTriggerLabel(choiceSet, {
    selectedCount,
    max: choiceSet.max,
  })
  const showSelectionFull = shouldShowSelectionFullNotice(choiceSet, isFull, drawerTriggerLabel)

  return (
    <section className={spellChoiceSectionClasses} aria-labelledby={`${choiceSet.id}-heading`}>
      <div className={spellChoiceSectionHeaderClasses}>
        <Heading variant="subsection" as="h3" id={`${choiceSet.id}-heading`}>
          {choiceSet.label}
        </Heading>
        <Button type="button" size="sm" onClick={onAdd}>
          {drawerTriggerLabel}
        </Button>
      </div>

      <div className={spellChoiceSectionCounterRowClasses}>
        <Text variant="muted">{formatSpellSelectionCounter(selectedCount, choiceSet.max)}</Text>
        {showSelectionFull ? <Text variant="muted">Selection full</Text> : null}
      </div>

      {overSelected ? (
        <p className={spellChoiceSectionOverSelectionClasses} role="status">
          You selected more spells than allowed. Remove extras to continue.
        </p>
      ) : null}

      {selectedSpells.length > 0 ? (
        <ul className={spellChoiceSectionSelectedListClasses}>
          {selectedSpells.map((spell) => (
            <li key={spell.id}>
              <ContentEntityCard
                entity={{ heading: spell.label }}
                trailing={{
                  kind: 'action',
                  content: (
                    <BuilderInventoryRemoveAction
                      itemLabel={spell.label}
                      onRemove={() => onRemove(spell.id)}
                    />
                  ),
                }}
                density="compact"
              />
            </li>
          ))}
        </ul>
      ) : (
        <Text variant="muted">No spells selected yet.</Text>
      )}
    </section>
  )
}
