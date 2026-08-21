import type { BuilderStepReadinessState } from '@rpg/contracts'
import { Alert, Text } from '@rpg/ui'

export type BuilderStepReadinessPanelProps = {
  state: Pick<
    BuilderStepReadinessState,
    'message' | 'helperText' | 'readiness' | 'classDependentBlocked'
  >
}

export function BuilderStepReadinessPanel({ state }: BuilderStepReadinessPanelProps) {
  const { message, helperText, classDependentBlocked } = state
  if (!message && !helperText) return null

  if (classDependentBlocked) {
    return <Alert variant="info" title={message} description={helperText} />
  }

  return (
    <div className="space-y-1">
      {message ? <Text variant="muted">{message}</Text> : null}
      {helperText ? <Text variant="muted">{helperText}</Text> : null}
    </div>
  )
}
