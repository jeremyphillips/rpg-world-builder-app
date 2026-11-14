'use client'

import { OptionalDisclosureRowMessage } from '../../../components/ui/optional-disclosure-row-message.client'
import { useFieldControlSize } from '../../context/form-section.context'
import type { JoinedPairFieldConfig } from '../../field-config'
import { useJoinedPairFieldRendererState } from './joined-pair-field-renderer-state.client'

/** Row message track for optional-disclosure joined pairs — hint/error only. */
export function JoinedPairDisclosureRowMessage({
  config,
  id,
  namePrefix,
}: {
  config: JoinedPairFieldConfig
  id: string
  namePrefix?: string
}) {
  const controlSize = useFieldControlSize(config.controlSizeOverride)
  const { validation, hintPresentation } = useJoinedPairFieldRendererState(config, id, namePrefix, {
    rowAwareHints: true,
  })

  return (
    <OptionalDisclosureRowMessage
      controlId={id}
      size={controlSize}
      error={validation.error}
      hint={hintPresentation.text}
      hintPosition={hintPresentation.position}
    />
  )
}
