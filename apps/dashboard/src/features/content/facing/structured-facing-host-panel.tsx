import { FacingHostPanel } from '@rpg/ui'

import { ContentTableView } from '../components/tables/content-table-view'
import type { FacingHostConfig } from './facing-host-config.types'

export function StructuredFacingHostPanel({ facing }: { facing: FacingHostConfig | undefined }) {
  if (!facing) return null

  return (
    <FacingHostPanel
      model={facing.resolvePanelModel()}
      renderTable={(table) => <ContentTableView table={table} />}
    />
  )
}
