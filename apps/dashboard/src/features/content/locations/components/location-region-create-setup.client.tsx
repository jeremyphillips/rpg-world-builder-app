'use client'

import { useMemo, useState } from 'react'
import type { RegionClassificationKind } from '@rpg/contracts'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  buildRegionClassificationKindRadioOptions,
  buildRegionTypeRadioOptions,
  parseRegionClassification,
  REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
  REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
  REGION_CREATE_SETUP_TYPE_PROMPT,
  resolveRegionCreateSetupDescription,
  resolveRegionCreateSetupHeadline,
  resolveRegionCreateSetupPrompt,
} from '../lib/location-region-create-setup.lib'
import { LocationCreateSetupShell } from './location-create-setup-shell.client'

export type LocationRegionCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Region classification + type setup before a fixed region create session opens. */
export function LocationRegionCreateSetup({
  open,
  onOpenChange,
  intent,
  onComplete,
}: LocationRegionCreateSetupProps) {
  const [classificationKind, setClassificationKind] = useState<RegionClassificationKind | ''>('')
  const [regionType, setRegionType] = useState('')
  const kindOptions = useMemo(() => buildRegionClassificationKindRadioOptions(), [])
  const typeOptions = useMemo(
    () => (classificationKind ? buildRegionTypeRadioOptions(classificationKind) : []),
    [classificationKind],
  )
  const prompt = resolveRegionCreateSetupPrompt(intent)
  const classification = parseRegionClassification(classificationKind, regionType)

  return (
    <LocationCreateSetupShell
      open={open}
      onOpenChange={onOpenChange}
      headline={resolveRegionCreateSetupHeadline(intent)}
      description={resolveRegionCreateSetupDescription(intent)}
      choiceSets={[
        {
          id: 'classification',
          fieldLabel: REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL,
          prompt,
          options: kindOptions,
          value: classificationKind,
          onValueChange: (value) => {
            setClassificationKind(value as RegionClassificationKind | '')
            setRegionType('')
          },
        },
        {
          id: 'regionType',
          fieldLabel: REGION_CREATE_SETUP_TYPE_FIELD_LABEL,
          prompt: REGION_CREATE_SETUP_TYPE_PROMPT,
          options: typeOptions,
          value: regionType,
          onValueChange: setRegionType,
        },
      ]}
      onContinue={() => {
        if (!classification) return
        onComplete({ kind: 'region', classification })
      }}
      additionalContinueConstraint={Boolean(classification)}
    />
  )
}
