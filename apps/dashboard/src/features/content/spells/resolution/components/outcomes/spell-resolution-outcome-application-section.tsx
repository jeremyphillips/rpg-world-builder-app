import { useId } from 'react'
import { Eyebrow, Text } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import { getArrayFieldMutators } from '@rpg/ui/form'

import { createResolutionEffectAppendDefaults } from '../../lib/effects/resolution-effect-add-menu.lib'
import type { ResolutionEffectKind } from '../../lib/effects/resolution-effect-add-menu.lib'
import { resolveOutcomeApplicationAddState } from '../../lib/form/resolution-outcome-effect-availability.lib'
import { resolveOutcomeApplicationSectionChrome } from '../../lib/form/resolution-outcome-application-section.lib'
import { appendOutcomeApplicationSelection } from '../../lib/form/resolution-outcome-applications.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type {
  ResolutionFormValues,
  ResolutionOutcomeFormItem,
} from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import { SpellResolutionOutcomeApplicationAddTrigger } from './spell-resolution-outcome-application-add-trigger'
import { SpellResolutionOutcomeApplicationsList } from './spell-resolution-outcome-applications-list'
import { SpellResolutionOutcomeApplicationSupportingCopy } from './spell-resolution-outcome-application-supporting-copy'

export type SpellResolutionOutcomeApplicationSectionProps = {
  outcomeIndex: number
}

/** Applied-effects section chrome, conditional array mount, and state-driven add trigger. */
export function SpellResolutionOutcomeApplicationSection({
  outcomeIndex,
}: SpellResolutionOutcomeApplicationSectionProps) {
  const hintId = useId()
  const { control, getValues, setValue } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const outcome = resolution?.outcomes?.[outcomeIndex]
  const effects = resolution?.effects ?? []
  const effectCount = outcome?.effects?.length ?? 0
  const outcomeResult = outcome?.result ?? 'hit'
  const selectionContext = resolutionFormToSelectionContext(resolution)
  const addState = resolveOutcomeApplicationAddState(
    effects,
    { effects: (outcome?.effects ?? []) as ResolutionOutcomeFormItem['effects'] },
    outcomeResult,
    selectionContext,
  )
  const chrome = resolveOutcomeApplicationSectionChrome(effectCount, addState)

  const appendApplication = (itemId: string) => {
    if (itemId === 'note') {
      const outcomes = getValues(RESOLUTION_FIELD_NAME)?.outcomes
      const current = outcomes?.[outcomeIndex]
      if (!outcomes || !current) return
      const next = outcomes.map(
        (entry: NonNullable<ResolutionFormValues['outcomes']>[number], index: number) =>
          index === outcomeIndex
            ? {
                ...entry,
                effects: [...(entry.effects ?? []), { kind: 'note' as const, description: 'Note' }],
              }
            : entry,
      )
      setValue(`${RESOLUTION_FIELD_NAME}.outcomes`, next, {
        shouldDirty: true,
        shouldValidate: false,
      })
      return
    }
    if (itemId.startsWith('create:')) {
      const definition = createResolutionEffectAppendDefaults(
        itemId.slice(7) as ResolutionEffectKind,
      )
      const effectId = String(definition.id)
      getArrayFieldMutators(control, `${RESOLUTION_FIELD_NAME}.effects`)?.append(definition)
      appendOutcomeApplicationSelection(
        control,
        getValues,
        setValue,
        outcomeIndex,
        effectId,
        outcomeResult,
        [...effects, definition as (typeof effects)[number]],
      )
      return
    }
    appendOutcomeApplicationSelection(
      control,
      getValues,
      setValue,
      outcomeIndex,
      itemId,
      outcomeResult,
      effects,
    )
  }

  return (
    <div>
      <Eyebrow size="sm" tone="foreground">
        {RESOLUTION_SECTION_LABELS.appliedEffects}
      </Eyebrow>

      {effectCount > 0 ? (
        <div className="mt-2">
          <SpellResolutionOutcomeApplicationsList outcomeIndex={outcomeIndex} />
        </div>
      ) : null}

      {chrome.showPrimaryEmptySummary ? (
        <Text variant="supporting" className="mt-2 mb-3">
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
            onSelectItem={appendApplication}
          />
        </div>
      ) : null}
    </div>
  )
}
