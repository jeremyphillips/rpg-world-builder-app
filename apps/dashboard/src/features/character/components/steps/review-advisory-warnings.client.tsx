'use client'

import { Alert } from '@rpg/ui'

/**
 * Non-blocking recommendations surfaced on the Review step.
 *
 * Blocking gaps (name, class, choice sets, ability scores) belong in
 * `resolveReviewBlockingSummary` — not here.
 *
 * Future advisory examples:
 * - `Your Constitution is low for Barbarian.`
 * - `You have no martial weapons.`
 */
export type ReviewAdvisoryWarningsProps = {
  warnings: readonly string[]
}

export function ReviewAdvisoryWarnings({ warnings }: ReviewAdvisoryWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <Alert
      variant="warning"
      title="Advisory notes"
      description={
        <ul className="list-disc space-y-1 pl-5">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      }
    />
  )
}
