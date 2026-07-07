'use client'

import type { ChoiceSet } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import {
  formatSpellChoiceAddLabel,
  formatSpellSelectionCounter,
  isSpellChoiceSetFull,
  isSpellChoiceSetOverSelected,
  resolveSelectedSpellLabels,
  SPELLS_STEP_SELECTION_FULL_REASON,
} from '../../lib/spells-step.lib'
import {
  spellChoiceSectionClasses,
  spellChoiceSectionHeaderClasses,
  spellChoiceSectionOverSelectionClasses,
  spellChoiceSectionSelectedListClasses,
  spellChoiceSectionSelectedRowClasses,
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
  const selectionFull = isSpellChoiceSetFull(choiceSet, selectedIds)
  const overSelected = isSpellChoiceSetOverSelected(choiceSet, selectedIds)

  return (
    <section className={spellChoiceSectionClasses} aria-labelledby={`${choiceSet.id}-heading`}>
      <div className={spellChoiceSectionHeaderClasses}>
        <div className="space-y-1">
          <Heading variant="subsection" as="h3" id={`${choiceSet.id}-heading`}>
            {choiceSet.label}
          </Heading>
          <Text variant="muted">
            {formatSpellSelectionCounter(selectedIds.length, choiceSet.max)}
          </Text>
        </div>
        <Button type="button" size="sm" disabled={selectionFull} onClick={onAdd}>
          {formatSpellChoiceAddLabel(choiceSet)}
        </Button>
      </div>

      {selectionFull ? <Text variant="muted">{SPELLS_STEP_SELECTION_FULL_REASON}</Text> : null}

      {overSelected ? (
        <p className={spellChoiceSectionOverSelectionClasses} role="status">
          You selected more spells than allowed. Remove extras to continue.
        </p>
      ) : null}

      {selectedSpells.length > 0 ? (
        <ul className={spellChoiceSectionSelectedListClasses}>
          {selectedSpells.map((spell) => (
            <li key={spell.id} className={spellChoiceSectionSelectedRowClasses}>
              <Text as="span" variant="body">
                {spell.label}
              </Text>
              <Button type="button" size="sm" variant="outline" onClick={() => onRemove(spell.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Text variant="muted">No spells selected yet.</Text>
      )}
    </section>
  )
}
