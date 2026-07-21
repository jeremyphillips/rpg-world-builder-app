'use client'

import { useMemo } from 'react'
import type { CampaignTemplate } from '@rpg/contracts'
import { Heading, RadioCard, Spinner, Text } from '@rpg/ui'

export const BLANK_CAMPAIGN_TEMPLATE_VALUE = 'blank'

export interface CampaignTemplateChooserProps {
  templates: CampaignTemplate[]
  value: string
  onValueChange: (value: string) => void
  isPending?: boolean
  isError?: boolean
}

function plainText(html: string | undefined): string | undefined {
  return html?.replace(/<[^>]*>/g, '').trim() || undefined
}

export function CampaignTemplateChooser({
  templates,
  value,
  onValueChange,
  isPending = false,
  isError = false,
}: CampaignTemplateChooserProps) {
  const options = useMemo(
    () => [
      {
        value: BLANK_CAMPAIGN_TEMPLATE_VALUE,
        label: 'Blank campaign',
        description: 'Start with the standard rules and configure every field yourself.',
      },
      ...templates.map((template) => ({
        value: template.metadata.id,
        label: template.metadata.name,
        description: plainText(template.metadata.description),
        titleMeta: `v${template.metadata.version}`,
      })),
    ],
    [templates],
  )

  return (
    <section aria-labelledby="campaign-template-heading">
      <Heading variant="label" as="h2" id="campaign-template-heading">
        Starting point
      </Heading>
      <Text variant="muted">
        Templates prefill editable fields. Changing this selection resets the creation form.
      </Text>
      <RadioCard
        aria-label="Campaign starting point"
        idPrefix="campaign-template"
        value={value}
        onValueChange={onValueChange}
        options={options}
      />
      {isPending ? <Spinner aria-label="Loading campaign templates" /> : null}
      {isError ? (
        <Text variant="destructive" role="alert">
          Templates could not be loaded. You can still create a blank campaign.
        </Text>
      ) : null}
    </section>
  )
}
