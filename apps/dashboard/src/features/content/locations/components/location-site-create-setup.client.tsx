'use client'

import { useMemo, useState } from 'react'
import type { SiteType } from '@rpg/contracts'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  buildSiteTypeRadioOptions,
  isSiteType,
  SITE_CREATE_SETUP_FIELD_LABEL,
  SITE_CREATE_SETUP_HEADLINE,
  SITE_CREATE_SETUP_PROMPT,
} from '../lib/location-site-create-setup.lib'
import { LocationCreateSetupShell } from './location-create-setup-shell.client'

export type LocationSiteCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Site-type setup before a fixed site create session opens. */
export function LocationSiteCreateSetup({
  open,
  onOpenChange,
  onComplete,
}: LocationSiteCreateSetupProps) {
  const [siteType, setSiteType] = useState<SiteType | ''>('')
  const options = useMemo(() => buildSiteTypeRadioOptions(), [])

  return (
    <LocationCreateSetupShell
      open={open}
      onOpenChange={onOpenChange}
      headline={SITE_CREATE_SETUP_HEADLINE}
      choiceSets={[
        {
          id: 'siteType',
          fieldLabel: SITE_CREATE_SETUP_FIELD_LABEL,
          prompt: SITE_CREATE_SETUP_PROMPT,
          options,
          value: siteType,
          onValueChange: (value) => {
            if (isSiteType(value)) {
              setSiteType(value)
            }
          },
        },
      ]}
      onContinue={() => {
        if (!siteType) return
        onComplete({ kind: 'site', siteType })
      }}
    />
  )
}
