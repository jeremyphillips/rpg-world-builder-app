'use client'

import type { ReactNode } from 'react'

import { Button, Text, cn } from '@rpg/ui'

import type { CampaignAccessSummary } from './campaign-access-summary'
import {
  CAMPAIGN_ACCESS_CHANGE_LABEL,
  CAMPAIGN_ACCESS_DONE_LABEL,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
  CAMPAIGN_ACCESS_UNSAVED_SUFFIX,
} from './campaign-access-labels'

const disclosureActionButtonClasses = 'h-auto min-h-0 shrink-0 px-0 py-0 font-normal'
const disclosureHeaderClasses = 'flex items-center justify-between gap-2'

export type CampaignAccessDisclosureProps = {
  summary: CampaignAccessSummary
  isDirty: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  idPrefix: string
  children: ReactNode
  pending?: boolean
}

export function CampaignAccessDisclosure({
  summary,
  isDirty,
  open,
  onOpenChange,
  idPrefix,
  children,
  pending = false,
}: CampaignAccessDisclosureProps) {
  const legendId = `${idPrefix}-campaign-access-legend`
  const panelId = `${idPrefix}-campaign-access-panel`

  if (!open) {
    return (
      <section aria-labelledby={legendId} className="flex flex-col gap-1">
        <Text id={legendId} variant="muted" className="text-sm">
          {CAMPAIGN_ACCESS_SECTION_LEGEND}
        </Text>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            aria-expanded={false}
            aria-controls={panelId}
            disabled={pending}
            onClick={() => onOpenChange(true)}
          >
            <Text as="span" className="text-sm">
              {summary.primary}
              {isDirty ? (
                <Text as="span" variant="muted">
                  {CAMPAIGN_ACCESS_UNSAVED_SUFFIX}
                </Text>
              ) : null}
            </Text>
            {summary.secondary ? (
              <Text variant="muted" className="mt-1 text-sm">
                {summary.secondary}
              </Text>
            ) : null}
          </button>
          <Button
            type="button"
            variant="text"
            size="sm"
            className={disclosureActionButtonClasses}
            aria-expanded={false}
            aria-controls={panelId}
            disabled={pending}
            onClick={() => onOpenChange(true)}
          >
            {CAMPAIGN_ACCESS_CHANGE_LABEL}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={legendId} className="flex flex-col gap-3">
      <div className={disclosureHeaderClasses}>
        <Text id={legendId} className="text-sm font-medium">
          {CAMPAIGN_ACCESS_SECTION_LEGEND}
        </Text>
        <Button
          type="button"
          variant="text"
          size="sm"
          className={disclosureActionButtonClasses}
          aria-expanded
          aria-controls={panelId}
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          {CAMPAIGN_ACCESS_DONE_LABEL}
        </Button>
      </div>
      <div id={panelId} className={cn('border-t border-border pt-3')}>
        {children}
      </div>
    </section>
  )
}
