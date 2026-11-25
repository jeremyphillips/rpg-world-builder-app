import { FacingHostPanel } from '@rpg/ui'

import { buildMonsterActionAttackPreview } from '../monsters/lib/actions/previews/monster-action-attack-summary'
import { facingBlockRenderers } from './facing-block-renderers'
import type { FacingHostConfig } from './facing-host-config.types'
import { resolveFacingWithFacts } from './resolve-facing'
import { toFacingPanelModel } from './structured-facing-panel-model.lib'

function resolvePanelModel(request: FacingHostConfig) {
  const { resolution, attackProfile } = resolveFacingWithFacts(request)
  if (request.domain === 'monsterAction' && attackProfile) {
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
  return toFacingPanelModel(resolution)
}

export function StructuredFacingHostPanel({ facing }: { facing: FacingHostConfig | undefined }) {
  if (!facing) return null

  return <FacingHostPanel model={resolvePanelModel(facing)} {...facingBlockRenderers} />
}
