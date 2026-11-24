import type { FacingResolution } from '@rpg/contracts'
import type { FacingHostPanelModel } from '@rpg/ui'

import { facingReasonMessage } from './facing-reason-message'

export function toFacingPanelModel(
  resolution: FacingResolution | undefined,
  preview?: Pick<FacingHostPanelModel, 'context' | 'metadataRows'>,
): FacingHostPanelModel | undefined {
  if (!resolution) return undefined

  const chrome = {
    ...(preview?.context ? { context: preview.context } : {}),
    ...(preview?.metadataRows?.length ? { metadataRows: preview.metadataRows } : {}),
  }

  if (resolution.status === 'ready') {
    return { status: 'ready', document: resolution.document, ...chrome }
  }

  const message = facingReasonMessage(resolution.reason)
  if (resolution.status === 'incomplete') {
    return {
      status: 'incomplete',
      message,
      ...(resolution.document ? { document: resolution.document } : {}),
      ...chrome,
    }
  }

  return { status: resolution.status, message, ...chrome }
}