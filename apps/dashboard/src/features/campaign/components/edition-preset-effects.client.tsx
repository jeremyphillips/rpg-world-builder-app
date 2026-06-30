'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { getEditionPresetMechanics, type EditionPresetId } from '@rpg/contracts'

import type { MechanicsValues } from '../lib/rules/mechanics/mechanics-form-fields'

/** Applies edition preset knob bundles when the user selects a different preset. */
export function EditionPresetEffects() {
  const { control, setValue } = useFormContext<MechanicsValues>()
  const editionPresetId = useWatch({ control, name: 'editionPresetId' })
  const previousPresetId = useRef<EditionPresetId | undefined>(undefined)

  useEffect(() => {
    if (editionPresetId === undefined) return

    if (previousPresetId.current === undefined) {
      previousPresetId.current = editionPresetId
      return
    }

    if (previousPresetId.current === editionPresetId) return

    const bundle = getEditionPresetMechanics(editionPresetId)
    setValue('armorClassMode', bundle.armorClass.mode, { shouldDirty: true })
    setValue(
      'armorClassBase',
      String(bundle.armorClass.base) as MechanicsValues['armorClassBase'],
      {
        shouldDirty: true,
      },
    )
    setValue('attackResolutionMode', bundle.attackResolution.mode, { shouldDirty: true })
    previousPresetId.current = editionPresetId
  }, [editionPresetId, setValue])

  return null
}
