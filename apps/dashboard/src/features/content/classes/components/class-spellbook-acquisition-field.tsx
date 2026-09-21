import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ClassGainProgression } from '@rpg/contracts'

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
  SPELLBOOK_GAIN_MODE_REGULAR,
  SPELLBOOK_GAIN_MODE_VARIABLE,
} from '../lib/class-spell-selection-form.lib'
import { buildClassSpellbookAcquisitionDraft } from '../lib/class-spellbook-acquisition-field.lib'
import {
  ClassSpellbookAcquisitionModal,
  type ClassSpellbookAcquisitionModalSavePayload,
} from './class-spellbook-acquisition-modal'

type ClassSpellbookAcquisitionFieldProps = {
  formCtx: ContentFormCtx
}

export function ClassSpellbookAcquisitionField({ formCtx }: ClassSpellbookAcquisitionFieldProps) {
  const form = useFormContext<ClassFormValues>()
  const irregular =
    useWatch({ control: form.control, name: 'spellbookAcquisitionIrregular' }) === true
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

  const metadata = irregular
    ? formatRegularGainSummary({ acquisition: curve })
    : formatRegularGainSummary({ starting, perLevel, throughLevel })

  const initialTableDraft = useMemo(() => {
    if (irregular) {
      return buildClassSpellbookAcquisitionDraft(curve)
    }
    if (starting !== undefined && perLevel !== undefined && throughLevel !== undefined) {
      return buildClassSpellbookAcquisitionDraft(
        materializeRegularGain({ starting, perLevel, throughLevel }),
      )
    }
    return buildClassSpellbookAcquisitionDraft(undefined)
  }, [curve, irregular, perLevel, starting, throughLevel])

  function handleSave(payload: ClassSpellbookAcquisitionModalSavePayload) {
    if (!payload.irregular) {
      form.setValue('spellbookAcquisitionIrregular', false, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionStarting', payload.starting, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionPerLevel', payload.perLevel, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionThroughLevel', payload.throughLevel, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('spellbookAcquisitionCurve', undefined, { shouldDirty: true })
      return
    }

    const regular = detectRegularGain(payload.curve)
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
      return
    }

    form.setValue('spellbookAcquisitionIrregular', true, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('spellbookAcquisitionCurve', payload.curve, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <>
      <FeatureTableRow
        title="Spellbook acquisition"
        metadata={metadata}
        onEdit={() => setModalOpen(true)}
      />

      {modalOpen ? (
        <ClassSpellbookAcquisitionModal
          open
          formCtx={formCtx}
          maxLevel={maxLevel}
          allowedLevels={allowedLevels}
          extendedProgression={extendedProgression}
          initialGainMode={irregular ? SPELLBOOK_GAIN_MODE_VARIABLE : SPELLBOOK_GAIN_MODE_REGULAR}
          initialStarting={starting}
          initialPerLevel={perLevel}
          initialThroughLevel={throughLevel}
          initialTableDraft={initialTableDraft}
          onSave={handleSave}
          onOpenChange={setModalOpen}
        />
      ) : null}
    </>
  )
}
