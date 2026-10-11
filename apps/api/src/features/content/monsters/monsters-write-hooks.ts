import type { Equipment } from '@rpg/contracts'
import { collectMonsterCatalogIssues } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import { equipmentRegistration } from '../equipment/equipment.config'
import type { ContentWriteContext } from '../lib/content-write-config'

export async function monstersValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const body = (ctx.effectiveBody ?? ctx.input) as Parameters<typeof collectMonsterCatalogIssues>[0]
  const equipmentCatalog = await resolveCatalogForCampaign(
    equipmentRegistration.read,
    ctx.campaignId,
  )
  const equipmentById = new Map<string, Equipment>(equipmentCatalog.map((row) => [row.id, row]))
  const issues = collectMonsterCatalogIssues(body, { equipmentById }, ctx.validationIntent)
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', 'Monster has invalid references.', { issues })
}
