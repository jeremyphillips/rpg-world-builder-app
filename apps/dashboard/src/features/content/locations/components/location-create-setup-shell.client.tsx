'use client'

import { useId, useMemo, useState } from 'react'
import {
  CollapsibleRadioCardField,
  Button,
  Modal,
  dialogPanelActionRowClasses,
  type RadioCardOption,
} from '@rpg/ui'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  isCreateSetupChoiceSetComplete,
  resolveCreateSetupActiveChoiceSetId,
  resolveCreateSetupCanContinue,
  resolveCreateSetupChoiceSetExpanded,
  resolveCreateSetupVisibleChoiceSetIds,
} from '../lib/location-create-setup-sequence.lib'
import { locationCreateSetupModalBodyClasses } from './location-create-setup.variants'

export type LocationCreateSetupChoiceSet = {
  id: string
  fieldLabel: string
  prompt: string
  options: RadioCardOption[]
  value: string
  onValueChange: (value: string) => void
  required?: boolean
}

export type LocationCreateSetupShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  description: string
  choiceSets: LocationCreateSetupChoiceSet[]
  onContinue: () => void
  /** Escape hatch for extra validation beyond required choice-set completion. */
  additionalContinueConstraint?: boolean
}

/** Shared create-setup modal: compact selected summaries + ID-sequenced expansion. */
export function LocationCreateSetupShell({
  open,
  onOpenChange,
  headline,
  description,
  choiceSets,
  onContinue,
  additionalContinueConstraint = true,
}: LocationCreateSetupShellProps) {
  const baseId = useId()
  const [reopenChoiceSetId, setReopenChoiceSetId] = useState<string | null>(null)

  const sequenceItems = useMemo(
    () =>
      choiceSets.map((choiceSet) => ({
        id: choiceSet.id,
        isComplete: isCreateSetupChoiceSetComplete(choiceSet.value),
        required: choiceSet.required,
      })),
    [choiceSets],
  )

  const activeChoiceSetId = resolveCreateSetupActiveChoiceSetId({
    choiceSets: sequenceItems,
    reopenChoiceSetId,
  })

  const visibleChoiceSetIds = resolveCreateSetupVisibleChoiceSetIds({
    choiceSets: sequenceItems,
    activeChoiceSetId,
  })

  const canContinue =
    resolveCreateSetupCanContinue({ choiceSets: sequenceItems }) && additionalContinueConstraint

  const choiceSetById = useMemo(() => {
    const map = new Map<string, LocationCreateSetupChoiceSet>()
    for (const choiceSet of choiceSets) {
      map.set(choiceSet.id, choiceSet)
    }
    return map
  }, [choiceSets])

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header headline={headline} description={description} />
        <Modal.Body className={locationCreateSetupModalBodyClasses}>
          {visibleChoiceSetIds.map((choiceSetId) => {
            const choiceSet = choiceSetById.get(choiceSetId)
            if (!choiceSet) return null

            const expanded = resolveCreateSetupChoiceSetExpanded({
              choiceSetId,
              activeChoiceSetId,
            })

            return (
              <CollapsibleRadioCardField
                key={choiceSet.id}
                id={`${baseId}-${choiceSet.id}`}
                label={choiceSet.prompt}
                summaryEyebrow={choiceSet.fieldLabel}
                changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
                summaryDescription={false}
                collapseAfterSelect={false}
                density="compact"
                value={choiceSet.value}
                options={choiceSet.options}
                expanded={expanded}
                onExpandedChange={(nextExpanded) => {
                  if (nextExpanded) {
                    setReopenChoiceSetId(choiceSet.id)
                    return
                  }
                  if (reopenChoiceSetId === choiceSet.id) {
                    setReopenChoiceSetId(null)
                  }
                }}
                onValueChange={(nextValue) => {
                  if (reopenChoiceSetId === choiceSet.id) {
                    setReopenChoiceSetId(null)
                  }
                  choiceSet.onValueChange(nextValue)
                }}
              />
            )
          })}
        </Modal.Body>
        <Modal.Footer>
          <div className={dialogPanelActionRowClasses}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                if (!canContinue) return
                onContinue()
                onOpenChange(false)
              }}
            >
              Continue
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
