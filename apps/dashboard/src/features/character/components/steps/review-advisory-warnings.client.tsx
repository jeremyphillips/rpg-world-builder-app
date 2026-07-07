'use client'

import { Alert } from '@rpg/ui'

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
