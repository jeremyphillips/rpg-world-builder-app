import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ConfirmDialog } from '@rpg/ui'
import type { ClassCapacityProgression } from '@rpg/contracts'

import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'
import { FeatureTableRow } from '@/lib/content-table-surface'

import {
  campaignRulesFromCtx,
  effectiveMaxFromCtx,
} from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from '../lib/class-form-fields'
import {
  buildClassCantripProgressionDraft,
  buildClassCantripProgressionHostConfig,
  formatClassCantripProgressionMetadata,
  mapClassCantripProgressionDraftToCantrips,
} from '../lib/class-cantrip-progression-field.lib'

type ClassCantripProgressionFieldProps = {
  formCtx: ContentFormCtx
}

export function ClassCantripProgressionField({ formCtx }: ClassCantripProgressionFieldProps) {
  const form = useFormContext<ClassFormValues>()
  const grantsCantrips = useWatch({ control: form.control, name: 'grantsCantrips' }) === true
  const cantrips = useWatch({ control: form.control, name: 'spellcasting.cantrips' }) as
    | ClassCapacityProgression
    | undefined
  const previousGrantsCantrips = useRef(grantsCantrips)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

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
      buildClassCantripProgressionHostConfig({
        allowedLevels,
        extendedProgression,
      }),
    [allowedLevels, extendedProgression],
  )

  const initialDraft = useMemo(
    () =>
      buildClassCantripProgressionDraft(cantrips, {
        allowedLevels,
        extendedProgression,
      }),
    [allowedLevels, cantrips, extendedProgression],
  )

  function setCantrips(next: ClassCapacityProgression | undefined) {
    form.setValue('spellcasting.cantrips', next, { shouldDirty: true, shouldValidate: true })
  }

  function handleSaveDraft(draft: TableBuilderFormValues) {
    setCantrips(mapClassCantripProgressionDraftToCantrips(draft))
  }

  function disableCantrips() {
    form.setValue('grantsCantrips', false, { shouldDirty: true, shouldValidate: true })
    setCantrips(undefined)
  }

  useEffect(() => {
    const wasEnabled = previousGrantsCantrips.current
    previousGrantsCantrips.current = grantsCantrips

    if (wasEnabled && !grantsCantrips && (cantrips?.curve.rows.length ?? 0) > 0) {
      form.setValue('grantsCantrips', true, { shouldDirty: false, shouldValidate: false })
      setConfirmClearOpen(true)
    }

    if (!wasEnabled && grantsCantrips && cantrips === undefined) {
      setCantrips({ curve: { rows: [] }, extension: 'carryForward' })
    }
  }, [cantrips, form, grantsCantrips])

  return (
    <>
      <FeatureTableRow
        title="Cantrip progression"
        metadata={formatClassCantripProgressionMetadata(cantrips)}
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
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        headline="Remove cantrip progression?"
        description="Turning off cantrips clears the authored breakpoint table for this class."
        confirmLabel="Remove cantrips"
        confirmVariant="destructive"
        onConfirm={() => {
          disableCantrips()
          setConfirmClearOpen(false)
        }}
      />
    </>
  )
}
