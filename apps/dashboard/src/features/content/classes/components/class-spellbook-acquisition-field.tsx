import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ClassGainProgression } from '@rpg/contracts'
import { Button, SemanticText } from '@rpg/ui'

import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'
import { FeatureTableRow } from '@/lib/content-table-surface'

import {
  campaignRulesFromCtx,
  effectiveMaxFromCtx,
} from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from '../lib/class-form-fields'
import {
  detectRegularGain,
  formatRegularGainSummary,
  materializeRegularGain,
} from '../lib/class-spell-selection-form.lib'
import {
  buildClassSpellbookAcquisitionDraft,
  buildClassSpellbookAcquisitionHostConfig,
} from '../lib/class-spellbook-acquisition-field.lib'
import { mapClassSpellbookAcquisitionDraftToProgression } from '../lib/class-spellbook-acquisition-field.lib'

type ClassSpellbookAcquisitionFieldProps = {
  formCtx: ContentFormCtx
  mode: 'regular' | 'irregular'
}

export function ClassSpellbookAcquisitionField({
  formCtx,
  mode,
}: ClassSpellbookAcquisitionFieldProps) {
  const form = useFormContext<ClassFormValues>()
  const starting = useWatch({ control: form.control, name: 'spellbookAcquisitionStarting' })
  const perLevel = useWatch({ control: form.control, name: 'spellbookAcquisitionPerLevel' })
  const throughLevel = useWatch({ control: form.control, name: 'spellbookAcquisitionThroughLevel' })
  const curve = useWatch({ control: form.control, name: 'spellbookAcquisitionCurve' }) as
    | ClassGainProgression
    | undefined
  const [modalOpen, setModalOpen] = useState(false)

  const campaignRules = campaignRulesFromCtx(formCtx)
  const maxLevel = effectiveMaxFromCtx(formCtx)
  const allowedLevels = useMemo(
    () => Array.from({ length: maxLevel }, (_, index) => index + 1),
    [maxLevel],
  )
  const extendedProgression = campaignRules.extendedProgression
    ? {
        standardMaxLevel: campaignRules.standardMaxCharacterLevel,
        tierName: campaignRules.extendedProgression.tierName,
      }
    : undefined

  const hostConfig = useMemo(
    () =>
      buildClassSpellbookAcquisitionHostConfig({
        allowedLevels,
        extendedProgression,
      }),
    [allowedLevels, extendedProgression],
  )

  const tableDraftSource =
    mode === 'irregular'
      ? curve
      : starting !== undefined && perLevel !== undefined && throughLevel !== undefined
        ? materializeRegularGain({ starting, perLevel, throughLevel })
        : undefined

  const initialDraft = useMemo(
    () => buildClassSpellbookAcquisitionDraft(tableDraftSource),
    [tableDraftSource],
  )

  function handleSaveDraft(draft: TableBuilderFormValues) {
    const next = mapClassSpellbookAcquisitionDraftToProgression(draft)
    const regular = detectRegularGain(next)
    if (regular) {
      form.setValue('spellbookAcquisitionIrregular', false, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionStarting', regular.starting, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionPerLevel', regular.perLevel, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionThroughLevel', regular.throughLevel, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionCurve', undefined, { shouldDirty: true })
    } else {
      form.setValue('spellbookAcquisitionIrregular', true, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionCurve', next, { shouldDirty: true, shouldValidate: true })
    }
    setModalOpen(false)
  }

  if (mode === 'regular') {
    const summary = formatRegularGainSummary({ starting, perLevel, throughLevel })
    return (
      <div className="flex flex-col gap-2">
        <SemanticText tone="neutral">{summary}</SemanticText>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            if (starting !== undefined && perLevel !== undefined && throughLevel !== undefined) {
              form.setValue(
                'spellbookAcquisitionCurve',
                materializeRegularGain({ starting, perLevel, throughLevel }),
                { shouldDirty: true },
              )
            }
            form.setValue('spellbookAcquisitionIrregular', true, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
        >
          Edit progression
        </Button>
      </div>
    )
  }

  return (
    <>
      <FeatureTableRow
        title="Spellbook acquisition"
        metadata={formatRegularGainSummary({ acquisition: curve })}
        typeLabel="Gain progression"
        onEdit={() => setModalOpen(true)}
      />

      {modalOpen ? (
        <TableBuilderModal
          open
          mode="edit"
          config={hostConfig}
          initialDraft={initialDraft}
          onSaveDraft={handleSaveDraft}
          onOpenChange={setModalOpen}
        />
      ) : null}
    </>
  )
}
