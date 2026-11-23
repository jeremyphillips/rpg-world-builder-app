import type { FacingInvalidCode } from '@rpg/contracts'

import { Alert } from './alert'
import { Eyebrow } from './eyebrow'
import { Icon } from './icon/icon'
import { Panel } from './panel'
import { SemanticText } from './semantic-text/semantic-text'
import { Text } from './text'
import { facingInvalidMessage } from './facing-host-panel.lib'

export function FacingGuidance({ message }: { message: string }) {
  return (
    <Text variant="caption">
      <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
        {message}
      </SemanticText>
    </Text>
  )
}

export function FacingHostInvalidPanel({
  label,
  code,
}: {
  label: string
  code: FacingInvalidCode
}) {
  return (
    <Panel tone="subtle" density="compact">
      <Eyebrow size="sm" className="mb-1">
        {label}
      </Eyebrow>
      <Alert variant="destructive" density="compact">
        {facingInvalidMessage(code)}
      </Alert>
    </Panel>
  )
}
