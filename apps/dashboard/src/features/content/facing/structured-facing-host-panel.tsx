import { FacingHostPanel } from '@rpg/ui'

import { ContentTableView } from '../components/tables/content-table-view'
import { buildMonsterActionAttackPreview } from '../monsters/lib/actions/previews/monster-action-attack-summary'
import { resolveMonsterActionDraftFacing } from './domains/monster-action/resolve-monster-action-draft-facing'
import type { FacingHostConfig } from './facing-host-config.types'
import { resolveFacing } from './resolve-facing'
import { toFacingPanelModel } from './structured-facing-panel-model.lib'

function resolvePanelModel(request: FacingHostConfig) {
  if (request.domain === 'monsterAction') {
    const { resolution, attackProfile } = resolveMonsterActionDraftFacing(request)
    if (!attackProfile) return toFacingPanelModel(resolution)

    const preview = buildMonsterActionAttackPreview(
      { status: 'resolved', value: attackProfile },
      request.values.abilityScores,
      undefined,
      request.values.name?.trim() || 'Creature',
    )
    return toFacingPanelModel(
      resolution,
      preview.status === 'ready'
        ? { context: preview.modeCaption, metadataRows: preview.rows }
        : undefined,
    )
  }
  return toFacingPanelModel(resolveFacing(request))
}

export function StructuredFacingHostPanel({ facing }: { facing: FacingHostConfig | undefined }) {
  if (!facing) return null

  return (
    <FacingHostPanel
      model={resolvePanelModel(facing)}
      renderTable={(table) => <ContentTableView table={table} />}
    />
  )
}
