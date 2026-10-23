import { MetadataList, Text, WizardFooter, useWizard } from '@rpg/ui'

import type { CampaignCreateValues } from '../../lib/settings/campaign-settings-form-values'
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
  const { accumulatedValues, completeStep } = useWizard()
  const values = accumulatedValues as Partial<CampaignCreateValues>

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        completeStep({})
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

      <WizardFooter submitLabel="Next" />
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
      <h3 id={id} className="eyebrow-style-sm mb-3 text-foreground">
        {heading}
      </h3>
      <MetadataList
        size="sm"
        divider={false}
        emphasis="value"
        items={rows.map((row) => ({ id: row.label, label: row.label, value: row.value }))}
      />
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
