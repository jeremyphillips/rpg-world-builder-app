'use client'

import { useId } from 'react'
import { Eyebrow, Text } from '@rpg/ui'
import { useFormSectionContext } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import { resolveOutcomeApplicationAddState } from '../../lib/form/resolution-outcome-effect-availability.lib'
import { resolveOutcomeApplicationSectionChrome } from '../../lib/form/resolution-outcome-application-section.lib'
import {
  appendOutcomeApplicationSelection,
  readOutcomeApplications,
} from '../../lib/form/resolution-outcome-applications.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import { SpellResolutionOutcomeApplicationAddTrigger } from './spell-resolution-outcome-application-add-trigger.client'
import { SpellResolutionOutcomeApplicationsList } from './spell-resolution-outcome-applications-list.client'
import { SpellResolutionOutcomeApplicationSupportingCopy } from './spell-resolution-outcome-application-supporting-copy.client'

export type SpellResolutionOutcomeApplicationSectionProps = {
  outcomeIndex: number
}

/** Applied-effects section chrome, conditional array mount, and state-driven add trigger. */
export function SpellResolutionOutcomeApplicationSection({
  outcomeIndex,
}: SpellResolutionOutcomeApplicationSectionProps) {
  const hintId = useId()
  const { control, getValues, setValue } = useFormContext()
  const { size } = useFormSectionContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const outcome = resolution?.outcomes?.[outcomeIndex]
  const effects = resolution?.effects ?? []
  const applications = readOutcomeApplications(outcome?.applications)
  const outcomeResult = outcome?.result ?? 'hit'
  const selectionContext = resolutionFormToSelectionContext(resolution)
  const addState = resolveOutcomeApplicationAddState(
    effects,
    { applications },
    outcomeResult,
    selectionContext,
  )
  const chrome = resolveOutcomeApplicationSectionChrome(applications.length, addState)

  const appendApplication = (effectId: string) => {
    appendOutcomeApplicationSelection(
      control,
      getValues,
      setValue,
      outcomeIndex,
      effectId,
      outcomeResult,
      effects,
    )
  }

  return (
    <div>
      <Eyebrow size="sm" tone="foreground">
        {RESOLUTION_SECTION_LABELS.appliedEffects}
      </Eyebrow>

      {applications.length > 0 ? (
        <div className="mt-2">
          <SpellResolutionOutcomeApplicationsList outcomeIndex={outcomeIndex} />
        </div>
      ) : null}

      {chrome.showPrimaryEmptySummary ? (
        <Text variant="muted" className="mt-2 mb-3 text-sm">
          {RESOLUTION_SECTION_LABELS.outcomeEmptySummary}
        </Text>
      ) : null}

      {chrome.supportingCopyVisible ? (
        <div id={hintId} className={chrome.hintContainerClassName}>
          <SpellResolutionOutcomeApplicationSupportingCopy addState={addState} />
        </div>
      ) : null}

      {chrome.showAddTrigger ? (
        <div className={chrome.addTriggerWrapperClassName}>
          <SpellResolutionOutcomeApplicationAddTrigger
            addState={addState}
            hintId={hintId}
            size={size}
            onSelectItem={appendApplication}
          />
        </div>
      ) : null}
    </div>
  )
}
