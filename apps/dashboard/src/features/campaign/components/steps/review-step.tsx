import { WizardFooter, useWizard } from '@rpg/ui'

import type { CampaignSettingsValues } from '../../lib/campaign-settings-values'
import {
  PLAY_STYLE_LABELS,
  MOOD_LABELS,
  MAGIC_LEVEL_LABELS,
  DIFFICULTY_LABELS,
  IMPORTED_CHARACTERS_POLICY_LABELS,
} from '../../lib/labels'

interface ReviewStepProps {
  /** Error message from the create-campaign mutation, if any. */
  error?: string | null
}

export function ReviewStep({ error }: ReviewStepProps) {
  const { accumulatedValues, complete } = useWizard()
  const values = accumulatedValues as Partial<CampaignSettingsValues>

  const bannerFile = values.banner?.[0]
  const playStyles = values.playStyle?.map((v) => PLAY_STYLE_LABELS[v]).join(', ')
  const moods = values.mood?.map((v) => MOOD_LABELS[v]).join(', ')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void complete()
      }}
    >
      <div className="space-y-6">
        <ReviewSection id="review-identity" heading="Identity">
          <ReviewRow label="Name" value={values.name ?? '—'} />
          {values.description && <ReviewRow label="Description" value={values.description} />}
          {bannerFile && <ReviewRow label="Image" value={bannerFile.name} />}
        </ReviewSection>

        <ReviewSection id="review-rules" heading="Rules">
          <ReviewRow
            label="Starting level"
            value={values.startingLevel !== undefined ? String(values.startingLevel) : '—'}
          />
          <ReviewRow
            label="Imported characters"
            value={
              values.importedCharactersPolicy
                ? IMPORTED_CHARACTERS_POLICY_LABELS[values.importedCharactersPolicy]
                : '—'
            }
          />
        </ReviewSection>

        <ReviewSection id="review-flavor" heading="Flavor">
          <ReviewRow label="Play style" value={playStyles || '—'} />
          <ReviewRow label="Mood" value={moods || '—'} />
          <ReviewRow
            label="Magic level"
            value={values.magicLevel ? MAGIC_LEVEL_LABELS[values.magicLevel] : '—'}
          />
          <ReviewRow
            label="Difficulty"
            value={values.difficulty ? DIFFICULTY_LABELS[values.difficulty] : '—'}
          />
        </ReviewSection>

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

function ReviewSection({
  id,
  heading,
  children,
}: {
  id: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <h3
        id={id}
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {heading}
      </h3>
      <dl className="space-y-2 text-sm">{children}</dl>
    </section>
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
