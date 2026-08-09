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
  resolveCreateSetupChoiceSetIdsToInvalidate,
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
  /** Upstream choice-set ids — sequencer clears this set when any change. */
  dependsOn?: readonly string[]
}

export type LocationCreateSetupPanelProps = {
  choiceSets: LocationCreateSetupChoiceSet[]
  /** Controlled reopen override; omit for uncontrolled (shell owns local state). */
  reopenChoiceSetId?: string | null
  onReopenChoiceSetIdChange?: (choiceSetId: string | null) => void
  className?: string
}

/** Choice-set stack only — embed in page setup Modal or LocationCreateModal. */
export function LocationCreateSetupPanel({
  choiceSets,
  reopenChoiceSetId: reopenChoiceSetIdProp,
  onReopenChoiceSetIdChange,
  className = locationCreateSetupModalBodyClasses,
}: LocationCreateSetupPanelProps) {
  const baseId = useId()
  const [uncontrolledReopenChoiceSetId, setUncontrolledReopenChoiceSetId] = useState<string | null>(
    null,
  )
  const isReopenControlled = onReopenChoiceSetIdChange != null
  const reopenChoiceSetId = isReopenControlled
    ? (reopenChoiceSetIdProp ?? null)
    : uncontrolledReopenChoiceSetId
  const setReopenChoiceSetId = isReopenControlled
    ? onReopenChoiceSetIdChange
    : setUncontrolledReopenChoiceSetId

  const sequenceItems = useMemo(
    () =>
      choiceSets.map((choiceSet) => ({
        id: choiceSet.id,
        isComplete: isCreateSetupChoiceSetComplete(choiceSet.value),
        required: choiceSet.required,
        dependsOn: choiceSet.dependsOn,
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

  const choiceSetById = useMemo(() => {
    const map = new Map<string, LocationCreateSetupChoiceSet>()
    for (const choiceSet of choiceSets) {
      map.set(choiceSet.id, choiceSet)
    }
    return map
  }, [choiceSets])

  return (
    <div className={className}>
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
              const invalidatedIds = resolveCreateSetupChoiceSetIdsToInvalidate({
                choiceSets: sequenceItems,
                changedChoiceSetId: choiceSet.id,
              })
              for (const invalidatedId of invalidatedIds) {
                choiceSetById.get(invalidatedId)?.onValueChange('')
              }
              choiceSet.onValueChange(nextValue)
            }}
          />
        )
      })}
    </div>
  )
}

export type LocationCreateSetupShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  /**
   * Modal header subhead. Defaults to `false` (hidden). Pass a string for custom
   * copy, or `resolveLocationCreateSetupDefaultSubhead(noun)` for the generic fallback.
   */
  subhead?: string | false
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
  subhead = false,
  choiceSets,
  onContinue,
  additionalContinueConstraint = true,
}: LocationCreateSetupShellProps) {
  const sequenceItems = useMemo(
    () =>
      choiceSets.map((choiceSet) => ({
        id: choiceSet.id,
        isComplete: isCreateSetupChoiceSetComplete(choiceSet.value),
        required: choiceSet.required,
        dependsOn: choiceSet.dependsOn,
      })),
    [choiceSets],
  )

  const canContinue =
    resolveCreateSetupCanContinue({ choiceSets: sequenceItems }) && additionalContinueConstraint

  const description = typeof subhead === 'string' ? subhead : undefined

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm" {...(!description ? { 'aria-describedby': undefined } : {})}>
        <Modal.Header headline={headline} description={description} />
        <Modal.Body>
          <LocationCreateSetupPanel choiceSets={choiceSets} />
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
