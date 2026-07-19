'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import {
  characterBuilderLevelMessages,
  formatFieldMessage,
  resolveAvailableChoices,
  resolveBuilderLevelConstraints,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import { Badge, Button, Modal, SelectField, Text } from '@rpg/ui'

import {
  buildBuilderLevelSelectOptions,
  evaluateBuilderLevelChange,
  resolveBuilderLevelHelperText,
  summarizeBuilderLevelRemovals,
} from '../lib/builder-level-control.lib'

export type CharacterBuilderLevelChangeConfirmationModalProps = {
  open: boolean
  removalSummaries: string[]
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CharacterBuilderLevelChangeConfirmationModal({
  open,
  removalSummaries,
  onOpenChange,
  onConfirm,
}: CharacterBuilderLevelChangeConfirmationModalProps) {
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    headingRef.current?.focus()
  }, [open])

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm" aria-describedby="character-builder-level-change-description">
        <Modal.Header
          headline={formatFieldMessage(characterBuilderLevelMessages.changeConfirmationHeadline())}
          description={formatFieldMessage(
            characterBuilderLevelMessages.changeConfirmationDescription(),
          )}
          headlineClassName="outline-none"
          ref={headingRef}
          tabIndex={-1}
        />
        <Modal.Body>
          <ul id="character-builder-level-change-description" className="list-disc space-y-1 pl-5">
            {removalSummaries.map((summary) => (
              <li key={summary}>
                <Text as="span" variant="body">
                  {summary}
                </Text>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {formatFieldMessage(characterBuilderLevelMessages.changeCancelLabel())}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {formatFieldMessage(characterBuilderLevelMessages.changeConfirmLabel())}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

export type CharacterBuilderLevelControlProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  onApplyLevelDraft: (nextDraft: CharacterBuilderDraft) => void
}

export function CharacterBuilderLevelControl({
  context,
  draft,
  onApplyLevelDraft,
}: CharacterBuilderLevelControlProps) {
  const constraints = useMemo(() => resolveBuilderLevelConstraints(context), [context])
  const helperText = useMemo(() => resolveBuilderLevelHelperText(constraints), [constraints])
  const levelOptions = useMemo(() => buildBuilderLevelSelectOptions(constraints), [constraints])
  const [pendingLevel, setPendingLevel] = useState<number | null>(null)
  const [confirmation, setConfirmation] = useState<{
    level: number
    nextDraft: CharacterBuilderDraft
    removalSummaries: string[]
  } | null>(null)

  const displayLevel = pendingLevel ?? draft.class.level

  const handleLevelChange = (value: string) => {
    const level = Number(value)
    if (!Number.isFinite(level)) return

    const evaluation = evaluateBuilderLevelChange(draft, level, context)
    if (evaluation.kind === 'unchanged') {
      setPendingLevel(null)
      return
    }

    if (evaluation.kind === 'apply') {
      setPendingLevel(null)
      onApplyLevelDraft(evaluation.nextDraft)
      return
    }

    const choiceSets = resolveAvailableChoices(evaluation.nextDraft, context)
    setPendingLevel(level)
    setConfirmation({
      level: evaluation.level,
      nextDraft: evaluation.nextDraft,
      removalSummaries: summarizeBuilderLevelRemovals(evaluation.removedSelections, choiceSets),
    })
  }

  const handleConfirmLevelChange = () => {
    if (!confirmation) return
    onApplyLevelDraft(confirmation.nextDraft)
    setConfirmation(null)
    setPendingLevel(null)
  }

  const handleCancelLevelChange = () => {
    setConfirmation(null)
    setPendingLevel(null)
  }

  if (constraints.mode === 'fixed') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Text as="span" variant="muted" className="text-sm">
          {formatFieldMessage(characterBuilderLevelMessages.fieldLabel())}
        </Text>
        <Badge appearance="neutral" tone="neutral">
          {constraints.fixedLevel ?? draft.class.level}
        </Badge>
        <Text as="span" variant="muted" className="text-sm">
          {helperText}
        </Text>
      </div>
    )
  }

  return (
    <>
      <SelectField
        id="character-builder-level"
        label={formatFieldMessage(characterBuilderLevelMessages.fieldLabel())}
        hint={helperText}
        options={levelOptions}
        value={String(displayLevel)}
        onValueChange={handleLevelChange}
        width="xs"
        digits={2}
        labelPosition="settings"
      />

      <CharacterBuilderLevelChangeConfirmationModal
        open={confirmation !== null}
        removalSummaries={confirmation?.removalSummaries ?? []}
        onOpenChange={(open) => {
          if (!open) handleCancelLevelChange()
        }}
        onConfirm={handleConfirmLevelChange}
      />
    </>
  )
}
