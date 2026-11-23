import type { FacingResolution } from '@rpg/contracts'
import { FacingHostPanel, type FacingHostPanelModel } from '@rpg/ui'

import { ContentTableView } from '../components/tables/content-table-view'
import { facingReasonMessage } from './facing-reason-message'
import type { FacingHostConfig } from './facing-host-config.types'

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

export function StructuredFacingHostPanel({ facing }: { facing: FacingHostConfig | undefined }) {
  if (!facing) return null

  return (
    <FacingHostPanel
      model={facing.resolvePanelModel()}
      renderTable={(table) => <ContentTableView table={table} />}
    />
  )
}
