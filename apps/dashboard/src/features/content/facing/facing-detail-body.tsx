import type { FacingResolution } from '@rpg/contracts'
import { FacingBody, Icon, SemanticText, Text } from '@rpg/ui'

import { facingBlockRenderers } from './facing-block-renderers'
import { facingReasonMessage } from './facing-reason-message'

function FacingDetailGuidance({ message }: { message: string }) {
  return (
    <Text variant="caption">
      <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
        {message}
      </SemanticText>
    </Text>
  )
}

/** Published detail body for one structured facing resolution (no preview chrome). */
export function FacingDetailBody({ resolution }: { resolution: FacingResolution }) {
  if (resolution.status === 'ready') {
    return (
      <FacingBody
        blocks={resolution.document.blocks}
        proseTone="default"
        {...facingBlockRenderers}
      />
    )
  }

  const message = facingReasonMessage(resolution.reason)

  if (resolution.status === 'incomplete') {
    return (
      <>
        {resolution.document ? (
          <FacingBody
            blocks={resolution.document.blocks}
            proseTone="default"
            {...facingBlockRenderers}
          />
        ) : null}
        <FacingDetailGuidance message={message} />
      </>
    )
  }

  return <FacingDetailGuidance message={message} />
}
