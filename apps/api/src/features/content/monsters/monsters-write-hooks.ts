import type { Equipment, SkillProficiency } from '@rpg/contracts'
import { collectMonsterCatalogIssues } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import { equipmentRegistration } from '../equipment/equipment.config'
import { skillProficiencyRegistration } from '../skill-proficiencies/skill-proficiencies.config'
import type { ContentWriteContext } from '../lib/content-write-config'

export async function monstersValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const body = (ctx.effectiveBody ?? ctx.input) as Parameters<typeof collectMonsterCatalogIssues>[0]
  const [equipmentCatalog, skillCatalog] = await Promise.all([
    resolveCatalogForCampaign(equipmentRegistration.read, ctx.campaignId),
    resolveCatalogForCampaign(skillProficiencyRegistration.read, ctx.campaignId),
  ])
  const equipmentById = new Map<string, Equipment>(equipmentCatalog.map((row) => [row.id, row]))
  const skillBySlug = new Map<string, SkillProficiency>(skillCatalog.map((row) => [row.slug, row]))
  const issues = collectMonsterCatalogIssues(
    body,
    {
      equipmentById,
      skillBySlug,
      equipmentCatalog: 'ready',
      skillCatalog: 'ready',
    },
    ctx.validationIntent,
  )
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', 'Monster has invalid references.', { issues })
}
