import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ConfirmDialog } from '@rpg/ui'
import type { ClassSpellcastingProgression, ClassSpellSelection } from '@rpg/contracts'

import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'
import { FeatureTableRow } from '@/lib/content-table-surface'

import {
  campaignRulesFromCtx,
  effectiveMaxFromCtx,
} from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from '../lib/class-form-fields'
import {
  buildClassSpellcastingProgressionDraft,
  buildClassSpellcastingProgressionHostConfig,
  formatClassSpellcastingProgressionMetadata,
  mapClassSpellcastingProgressionDraftToProgression,
} from '../lib/class-spellcasting-progression-field.lib'

type ClassSpellcastingProgressionFieldProps = {
  formCtx: ContentFormCtx
}

export function ClassSpellcastingProgressionField({
  formCtx,
}: ClassSpellcastingProgressionFieldProps) {
  const form = useFormContext<ClassFormValues>()
  const grantsCantrips = useWatch({ control: form.control, name: 'grantsCantrips' }) === true
  const spellSelectionModel = useWatch({
    control: form.control,
    name: 'spellSelectionModel',
  }) as ClassSpellSelection['model'] | undefined
  const progression = useWatch({ control: form.control, name: 'spellcasting.progression' }) as
    | ClassSpellcastingProgression
    | undefined
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmClearCantripsOpen, setConfirmClearCantripsOpen] = useState(false)
  const previousGrantsCantrips = useRef(grantsCantrips)

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

  const tableInput = useMemo(
    () => ({ grantsCantrips, spellSelectionModel }),
    [grantsCantrips, spellSelectionModel],
  )

  const hostConfig = useMemo(
    () =>
      buildClassSpellcastingProgressionHostConfig({
        allowedLevels,
        extendedProgression,
        ...tableInput,
      }),
    [allowedLevels, extendedProgression, tableInput],
  )

  const initialDraft = useMemo(
    () =>
      buildClassSpellcastingProgressionDraft(progression, {
        allowedLevels,
        extendedProgression,
        ...tableInput,
      }),
    [allowedLevels, extendedProgression, progression, tableInput],
  )

  function setProgression(next: ClassSpellcastingProgression | undefined) {
    form.setValue('spellcasting.progression', next, { shouldDirty: true, shouldValidate: true })
  }

  function handleSaveDraft(draft: TableBuilderFormValues) {
    setProgression(mapClassSpellcastingProgressionDraftToProgression(draft, tableInput))
  }

  function clearCantripsProgression() {
    form.setValue('grantsCantrips', false, { shouldDirty: true, shouldValidate: true })
    const next = { ...(progression ?? {}) }
    delete next.cantrips
    setProgression(Object.keys(next).length > 0 ? next : undefined)
  }

  useEffect(() => {
    const wasEnabled = previousGrantsCantrips.current
    previousGrantsCantrips.current = grantsCantrips
    const cantripRows = progression?.cantrips?.curve.rows.length ?? 0

    if (wasEnabled && !grantsCantrips && cantripRows > 0) {
      form.setValue('grantsCantrips', true, { shouldDirty: false, shouldValidate: false })
      setConfirmClearCantripsOpen(true)
    }

    if (!wasEnabled && grantsCantrips && progression?.cantrips === undefined) {
      setProgression({
        ...(progression ?? {}),
        cantrips: { curve: { rows: [] }, extension: 'carryForward' },
      })
    }
  }, [form, grantsCantrips, progression])

  if (!spellSelectionModel && !grantsCantrips) return null

  return (
    <>
      <FeatureTableRow
        title="Spellcasting progression"
        metadata={formatClassSpellcastingProgressionMetadata({
          progression,
          grantsCantrips,
          spellSelectionModel,
        })}
        typeLabel="Level progression"
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

      <ConfirmDialog
        open={confirmClearCantripsOpen}
        onOpenChange={setConfirmClearCantripsOpen}
        headline="Remove cantrip progression?"
        description="Turning off cantrips clears the authored breakpoint table for this class."
        confirmLabel="Remove cantrips"
        confirmVariant="destructive"
        onConfirm={() => {
          clearCantripsProgression()
          setConfirmClearCantripsOpen(false)
        }}
      />
    </>
  )
}
