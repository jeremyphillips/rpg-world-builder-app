import { Alert } from '@rpg/ui'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import { presentBuildAdvisoryList } from '../../../../lib/build-advisories/build-advisory-presentation.lib'

/**
 * Non-blocking notes surfaced on the Review step: build advisories (create still
 * allowed, with confirmation) plus preview-fidelity notes.
 *
 * Blocking gaps (name, class, choice sets, ability scores) belong in
 * `resolveReviewBlockingSummary` — not here.
 */
export type ReviewAdvisoryWarningsProps = {
  advisories?: readonly CharacterBuildAdvisory[]
  /** Preview-fidelity notes (`preview.warnings`). */
  notes: readonly string[]
}

export function ReviewAdvisoryWarnings({ advisories = [], notes }: ReviewAdvisoryWarningsProps) {
  if (advisories.length === 0 && notes.length === 0) return null

  return (
    <Alert
      variant="warning"
      title="Advisory notes"
      description={
        <ul className="list-disc space-y-1 pl-5">
          {presentBuildAdvisoryList(advisories).map((item) => (
            <li key={item.key}>{item.title ? `${item.title} — ${item.message}` : item.message}</li>
          ))}
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      }
    />
  )
}
