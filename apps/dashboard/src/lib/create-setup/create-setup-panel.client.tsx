'use client'

import { useId, useMemo, useState } from 'react'
import {
  CollapsibleRadioCardField,
  FieldLabelContent,
  NumberStepper,
  Button,
  Modal,
  dialogPanelActionRowClasses,
  Text,
  Eyebrow,
} from '@rpg/ui'

import { assertCreateSetupSetsOnReset } from './create-setup-validation.lib'
import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import {
  resolveCreateSetupActiveSetId,
  resolveCreateSetupCanContinue,
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import type { CreateSetupSet } from './create-setup.types'
import { createSetupModalBodyClasses } from './create-setup.variants'

export type CreateSetupPanelProps = {
  sets: CreateSetupSet[]
  changeLabel?: string
  /** Controlled reopen override; omit for uncontrolled (panel owns local state). */
  reopenSetId?: string | null
  onReopenSetIdChange?: (setId: string | null) => void
  className?: string
}

/** Ordered setup stack — sequencer + kind-specific controls. */
export function CreateSetupPanel({
  sets,
  changeLabel = CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  reopenSetId: reopenSetIdProp,
  onReopenSetIdChange,
  className = createSetupModalBodyClasses,
}: CreateSetupPanelProps) {
  assertCreateSetupSetsOnReset(sets)

  const baseId = useId()
  const [uncontrolledReopenSetId, setUncontrolledReopenSetId] = useState<string | null>(null)
  const isReopenControlled = onReopenSetIdChange != null
  const reopenSetId = isReopenControlled ? (reopenSetIdProp ?? null) : uncontrolledReopenSetId
  const setReopenSetId = isReopenControlled ? onReopenSetIdChange : setUncontrolledReopenSetId

  const sequenceItems = useMemo(
    () =>
      sets.map((set) => ({
        id: set.id,
        isComplete: set.isComplete,
        required: set.required,
        dependsOn: set.dependsOn,
        visibleWhenComplete: set.visibleWhenComplete,
        collapseWhenComplete: set.collapseWhenComplete,
        collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete,
      })),
    [sets],
  )

  const activeSetId = resolveCreateSetupActiveSetId({
    sets: sequenceItems,
    reopenSetId,
  })

  const visibleSetIds = resolveCreateSetupVisibleSetIds({
    sets: sequenceItems,
    activeSetId,
  })

  const setById = useMemo(() => {
    const map = new Map<string, CreateSetupSet>()
    for (const set of sets) {
      map.set(set.id, set)
    }
    return map
  }, [sets])

  return (
    <div className={className}>
      {visibleSetIds.map((setId) => {
        const set = setById.get(setId)
        if (!set) return null

        const visible = true
        const expanded = resolveCreateSetupSetExpanded({
          setId,
          activeSetId,
          reopenSetId,
          visible,
          isComplete: set.isComplete,
          required: set.required,
          collapseWhenComplete: set.collapseWhenComplete ?? true,
          collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete ?? false,
        })

        if (set.kind === 'note') {
          return (
            <div key={set.id} data-field-align className="flex flex-col gap-y-2">
              <Eyebrow size="sm">{set.fieldLabel}</Eyebrow>
              <Text variant="small">{set.body}</Text>
              {set.description ? (
                <Text variant="muted" className="text-sm">
                  {set.description}
                </Text>
              ) : null}
            </div>
          )
        }

        if (set.kind === 'choice') {
          return (
            <CollapsibleRadioCardField
              key={set.id}
              id={`${baseId}-${set.id}`}
              label={set.prompt ?? set.fieldLabel}
              summaryEyebrow={set.fieldLabel}
              changeLabel={changeLabel}
              summaryDescription={false}
              collapseAfterSelect={false}
              density="compact"
              value={set.value}
              options={set.options}
              optionGroups={set.optionGroups}
              expanded={expanded}
              onExpandedChange={(nextExpanded) => {
                if (nextExpanded) {
                  setReopenSetId(set.id)
                  return
                }
                if (reopenSetId === set.id) {
                  setReopenSetId(null)
                }
              }}
              onValueChange={(nextValue) => {
                if (reopenSetId === set.id) {
                  setReopenSetId(null)
                }
                const invalidatedIds = resolveCreateSetupSetIdsToInvalidate({
                  sets: sequenceItems,
                  changedSetId: set.id,
                })
                for (const invalidatedId of invalidatedIds) {
                  setById.get(invalidatedId)?.onReset()
                }
                set.onValueChange(nextValue)
              }}
            />
          )
        }

        return (
          <div key={set.id} data-field-align className="flex flex-col gap-y-4">
            <FieldLabelContent label={set.fieldLabel} />
            {set.prompt ? (
              <Text variant="muted" className="text-sm">
                {set.prompt}
              </Text>
            ) : null}
            <NumberStepper
              aria-label={set.fieldLabel}
              size="sm"
              bordered
              digits={set.digits ?? 2}
              min={set.min}
              max={set.max}
              value={set.value}
              onChange={(nextValue) => {
                const invalidatedIds = resolveCreateSetupSetIdsToInvalidate({
                  sets: sequenceItems,
                  changedSetId: set.id,
                })
                for (const invalidatedId of invalidatedIds) {
                  setById.get(invalidatedId)?.onReset()
                }
                set.onValueChange(nextValue)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

export type CreateSetupShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  /**
   * Modal header subhead. Defaults to `false` (hidden). Pass a string for custom
   * copy when a feature needs setup guidance above the panel.
   */
  subhead?: string | false
  sets: CreateSetupSet[]
  changeLabel?: string
  onContinue: () => void
  /** Escape hatch for extra validation beyond required set completion. */
  additionalContinueConstraint?: boolean
}

/** Shared create-setup modal: compact selected summaries + ID-sequenced expansion. */
export function CreateSetupShell({
  open,
  onOpenChange,
  headline,
  subhead = false,
  sets,
  changeLabel,
  onContinue,
  additionalContinueConstraint = true,
}: CreateSetupShellProps) {
  const sequenceItems = useMemo(
    () =>
      sets.map((set) => ({
        id: set.id,
        isComplete: set.isComplete,
        required: set.required,
        dependsOn: set.dependsOn,
        visibleWhenComplete: set.visibleWhenComplete,
        collapseWhenComplete: set.collapseWhenComplete,
        collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete,
      })),
    [sets],
  )

  const canContinue =
    resolveCreateSetupCanContinue({ sets: sequenceItems }) && additionalContinueConstraint

  const description = typeof subhead === 'string' ? subhead : undefined

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm" {...(!description ? { 'aria-describedby': undefined } : {})}>
        <Modal.Header headline={headline} description={description} />
        <Modal.Body>
          <CreateSetupPanel sets={sets} changeLabel={changeLabel} />
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
