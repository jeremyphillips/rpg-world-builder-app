'use client'

import { useId, useMemo, useState } from 'react'
import { CollapsibleRadioCardField, Button, Modal, dialogPanelActionRowClasses } from '@rpg/ui'
import type { SiteType } from '@rpg/contracts'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  buildSiteTypeRadioOptions,
  isSiteType,
  resolveSiteCreateSetupDescription,
  SITE_CREATE_SETUP_CHANGE_LABEL,
  SITE_CREATE_SETUP_PROMPT,
  SITE_CREATE_SETUP_SUMMARY_EYEBROW,
} from '../lib/location-site-create-setup.lib'
import { locationCreateSetupModalBodyClasses } from './location-create-setup.variants'

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
  intent,
  onComplete,
}: LocationSiteCreateSetupProps) {
  const [siteType, setSiteType] = useState<SiteType | ''>('')
  const fieldId = useId()
  const options = useMemo(() => buildSiteTypeRadioOptions(), [])
  const description = resolveSiteCreateSetupDescription(intent)

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header headline="Create site" description={description} />
        <Modal.Body className={locationCreateSetupModalBodyClasses}>
          <CollapsibleRadioCardField
            id={fieldId}
            label={SITE_CREATE_SETUP_PROMPT}
            summaryEyebrow={SITE_CREATE_SETUP_SUMMARY_EYEBROW}
            changeLabel={SITE_CREATE_SETUP_CHANGE_LABEL}
            density="compact"
            value={siteType}
            options={options}
            onValueChange={(value) => {
              if (isSiteType(value)) {
                setSiteType(value)
              }
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className={dialogPanelActionRowClasses}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!siteType}
              onClick={() => {
                if (!siteType) return
                onComplete({ kind: 'site', siteType })
                onOpenChange(false)
              }}
            >
              Continue
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
