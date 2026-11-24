import { Icon } from './icon/icon'
import { SemanticText } from './semantic-text/semantic-text'
import { Text } from './text'

function FacingNeutralGuidance({ message }: { message: string }) {
  return (
    <Text variant="caption">
      <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
        {message}
      </SemanticText>
    </Text>
  )
}

function FacingFailureGuidance({ message }: { message: string }) {
  return (
    <Text variant="caption" role="status">
      <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
        {message}
      </SemanticText>
    </Text>
  )
}

export function FacingGuidance({
  message,
  tone = 'neutral',
}: {
  message: string
  tone?: 'neutral' | 'failure'
}) {
  if (tone === 'failure') return <FacingFailureGuidance message={message} />
  return <FacingNeutralGuidance message={message} />
}
