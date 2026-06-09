import { WizardFooter, useWizard } from '@rpg/ui'

import type { CreateCampaignInput } from '@rpg/contracts'

interface AccumulatedValues {
  name?: string
  description?: string
  banner?: File[]
  settings?: CreateCampaignInput['settings']
}

const POLICY_LABELS: Record<string, string> = {
  approval_required: 'Yes, with DM approval',
  disabled: 'No, players must roll new characters',
}

interface ReviewStepProps {
  /** Error message from the create-campaign mutation, if any. */
  error?: string | null
}

export function ReviewStep({ error }: ReviewStepProps) {
  const { accumulatedValues, complete } = useWizard()
  const values = accumulatedValues as AccumulatedValues

  const settings = values.settings?.characterCreation
  const bannerFile = values.banner?.[0]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void complete()
      }}
    >
      <div className="space-y-6">
        <section aria-labelledby="review-identity">
          <h3
            id="review-identity"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Identity
          </h3>
          <dl className="space-y-2 text-sm">
            <ReviewRow label="Name" value={values.name ?? '—'} />
            {values.description && <ReviewRow label="Description" value={values.description} />}
            {bannerFile && <ReviewRow label="Image" value={bannerFile.name} />}
          </dl>
        </section>

        <section aria-labelledby="review-rules">
          <h3
            id="review-rules"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Rules
          </h3>
          <dl className="space-y-2 text-sm">
            <ReviewRow
              label="Starting level"
              value={settings ? String(settings.startingLevel) : '—'}
            />
            <ReviewRow
              label="Imported characters"
              value={settings ? (POLICY_LABELS[settings.importedCharacters.policy] ?? '—') : '—'}
            />
          </dl>
        </section>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <WizardFooter submitLabel="Create Campaign" />
    </form>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-40 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
