'use client'

import { useMemo, useState } from 'react'
import type { SettlementType } from '@rpg/contracts'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  buildSettlementTypeRadioOptions,
  isSettlementType,
  resolveSettlementCreateSetupDescription,
  SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
  SETTLEMENT_CREATE_SETUP_HEADLINE,
  SETTLEMENT_CREATE_SETUP_PROMPT,
} from '../lib/location-settlement-create-setup.lib'
import { LocationCreateSetupShell } from './location-create-setup-shell.client'

export type LocationSettlementCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Settlement-type setup before a fixed settlement create session opens. */
export function LocationSettlementCreateSetup({
  open,
  onOpenChange,
  intent,
  onComplete,
}: LocationSettlementCreateSetupProps) {
  const [settlementType, setSettlementType] = useState<SettlementType | ''>('')
  const options = useMemo(() => buildSettlementTypeRadioOptions(), [])
  const description = resolveSettlementCreateSetupDescription(intent)

  return (
    <LocationCreateSetupShell
      open={open}
      onOpenChange={onOpenChange}
      headline={SETTLEMENT_CREATE_SETUP_HEADLINE}
      description={description}
      choiceSets={[
        {
          id: 'settlementType',
          fieldLabel: SETTLEMENT_CREATE_SETUP_FIELD_LABEL,
          prompt: SETTLEMENT_CREATE_SETUP_PROMPT,
          options,
          value: settlementType,
          onValueChange: (value) => {
            if (isSettlementType(value)) {
              setSettlementType(value)
            }
          },
        },
      ]}
      onContinue={() => {
        if (!settlementType) return
        onComplete({ kind: 'settlement', settlementType })
      }}
    />
  )
}
