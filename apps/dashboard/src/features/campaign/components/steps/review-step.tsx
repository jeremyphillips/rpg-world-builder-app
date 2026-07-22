import { Heading, Text, WizardFooter, useWizard } from '@rpg/ui'

import type { CampaignCreateValues } from '../../lib/campaign-settings-form-values'
import {
  buildFlavorRows,
  buildIdentityRows,
  buildRulesRows,
  type ReviewRowData,
} from './review-step.lib'

interface ReviewStepProps {
  /** Error message from the create-campaign mutation, if any. */
  error?: string | null
  templateName?: string
}

export function ReviewStep({ error, templateName }: ReviewStepProps) {
  const { accumulatedValues, complete } = useWizard()
  const values = accumulatedValues as Partial<CampaignCreateValues>

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void complete()
      }}
    >
      <div className="space-y-6">
        {templateName ? (
          <ReviewSection
            id="review-starting-point"
            heading="Starting point"
            rows={[{ label: 'Template', value: templateName }]}
          />
        ) : null}
        <ReviewSection id="review-identity" heading="Identity" rows={buildIdentityRows(values)} />
        <ReviewSection id="review-rules" heading="Rules" rows={buildRulesRows(values)} />
        <ReviewSection id="review-flavor" heading="Flavor" rows={buildFlavorRows(values)} />
        <ReviewErrorMessage error={error} />
      </div>

      <WizardFooter submitLabel="Create Campaign" />
    </form>
  )
}

function ReviewSection({
  id,
  heading,
  rows,
}: {
  id: string
  heading: string
  rows: ReviewRowData[]
}) {
  return (
    <section aria-labelledby={id}>
      <Text variant="small" as="h3" id={id} className="mb-3 font-semibold uppercase tracking-wide">
        {heading}
      </Text>
      <dl className="space-y-2 text-sm">
        {rows.map((row) => (
          <ReviewRow key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>
    </section>
  )
}

function ReviewErrorMessage({ error }: { error?: string | null }) {
  if (!error) return null

  return (
    <Text variant="destructive" role="alert">
      {error}
    </Text>
  )
}

function ReviewRow({ label, value }: ReviewRowData) {
  return (
    <div className="flex gap-2">
      <Text variant="muted" as="dt" className="w-40 shrink-0">
        {label}
      </Text>
      <Heading variant="label" as="dd">
        {value}
      </Heading>
    </div>
  )
}
