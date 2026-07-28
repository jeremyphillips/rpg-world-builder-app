'use client'

import { useMemo, useState } from 'react'

import {
  resolveAvailableContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Badge, BuilderOptionDetailsSheet, Button, RadioCard, Text } from '@rpg/ui'

import {
  buildClassDetailsSheetContent,
  formatClassCardOption,
} from '../../lib/builder/builder-option-display.lib'
import { BuilderStepFrame } from './builder-step-frame.client'

const SELECT_CLASS_ACTION_LABEL = 'Select class'
const SELECTED_CLASS_LABEL = 'Selected'

export type ClassStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ClassStep({ context, draft, validationIssues, onDraftChange }: ClassStepProps) {
  const [detailsClassId, setDetailsClassId] = useState<string | null>(null)

  const classes = useMemo(() => resolveAvailableContent(context).classes, [context])

  const options = useMemo(
    () =>
      classes.map((entry) => ({
        value: entry.id,
        ...formatClassCardOption(entry),
        onDetails: () => setDetailsClassId(entry.id),
      })),
    [classes],
  )

  const detailsClass = useMemo(
    () => classes.find((entry) => entry.id === detailsClassId) ?? null,
    [classes, detailsClassId],
  )

  const detailsContent = useMemo(() => {
    if (!detailsClass) return null
    return buildClassDetailsSheetContent(detailsClass, context.catalog)
  }, [context.catalog, detailsClass])

  const isDetailsClassSelected = detailsClassId != null && draft.class.classId === detailsClassId

  if (options.length === 0) {
    return (
      <BuilderStepFrame stepId="class" validationIssues={validationIssues}>
        <Text variant="muted">No classes are available for this ruleset.</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="class" validationIssues={validationIssues}>
      <RadioCard
        density="compact"
        value={draft.class.classId ?? ''}
        onValueChange={(classId) => {
          onDraftChange({
            class: {
              ...draft.class,
              classId: classId || undefined,
            },
          })
        }}
        options={options}
        idPrefix="character-builder-class"
      />

      {detailsContent ? (
        <BuilderOptionDetailsSheet
          open={detailsClassId != null}
          onOpenChange={(open) => {
            if (!open) setDetailsClassId(null)
          }}
          title={detailsContent.title}
          eyebrow={detailsContent.eyebrow}
          descriptionHtml={detailsContent.descriptionHtml}
          metadata={detailsContent.metadata}
          sections={detailsContent.sections}
          primaryAction={
            isDetailsClassSelected ? (
              <Badge appearance="neutral" tone="neutral">
                {SELECTED_CLASS_LABEL}
              </Badge>
            ) : (
              <Button
                onClick={() => {
                  if (!detailsClassId) return
                  onDraftChange({
                    class: {
                      ...draft.class,
                      classId: detailsClassId,
                    },
                  })
                  setDetailsClassId(null)
                }}
              >
                {SELECT_CLASS_ACTION_LABEL}
              </Button>
            )
          }
        />
      ) : null}
    </BuilderStepFrame>
  )
}
