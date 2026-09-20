import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ClassGainProgression, ClassSpellSelection } from '@rpg/contracts'

import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'
import { FeatureTableRow } from '@/lib/content-table-surface'

import {
  campaignRulesFromCtx,
  effectiveMaxFromCtx,
} from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from '../lib/class-form-fields'
import { formatRegularGainSummary } from '../lib/class-spell-selection-form.lib'
import {
  buildClassSpellbookAcquisitionDraft,
  buildClassSpellbookAcquisitionHostConfig,
  formatClassSpellbookAcquisitionMetadata,
  mapClassSpellbookAcquisitionDraftToProgression,
} from '../lib/class-spellbook-acquisition-field.lib'

type ClassSpellbookAcquisitionFieldProps = {
  formCtx: ContentFormCtx
}

export function ClassSpellbookAcquisitionField({ formCtx }: ClassSpellbookAcquisitionFieldProps) {
  const form = useFormContext<ClassFormValues>()
  const spellSelection = useWatch({
    control: form.control,
    name: 'spellcasting.spellSelection',
  }) as ClassSpellSelection | undefined
  const [modalOpen, setModalOpen] = useState(false)

  const acquisition =
    spellSelection?.model === 'prepareFromLearnedCollection'
      ? spellSelection.acquisition
      : undefined

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

  const initialDraft = useMemo(
    () => buildClassSpellbookAcquisitionDraft(acquisition),
    [acquisition],
  )

  if (spellSelection?.model !== 'prepareFromLearnedCollection') return null

  function setAcquisition(next: ClassGainProgression) {
    if (spellSelection?.model !== 'prepareFromLearnedCollection') return
    form.setValue(
      'spellcasting.spellSelection',
      {
        model: 'prepareFromLearnedCollection',
        collection: 'spellbook',
        acquisition: next,
        change: spellSelection.change,
      },
      { shouldDirty: true, shouldValidate: true },
    )
  }

  function handleSaveDraft(draft: TableBuilderFormValues) {
    setAcquisition(mapClassSpellbookAcquisitionDraftToProgression(draft))
  }

  return (
    <>
      <FeatureTableRow
        title="Spellbook acquisition"
        metadata={formatClassSpellbookAcquisitionMetadata(acquisition, formatRegularGainSummary)}
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
