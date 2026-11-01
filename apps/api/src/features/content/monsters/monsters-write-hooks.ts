import type { Equipment, SkillProficiency, Spell, SystemRulesetId } from '@rpg/contracts'
import { collectMonsterCatalogIssues } from '@rpg/contracts'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'

import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import { equipmentRegistration } from '../equipment/equipment.config'
import { skillProficiencyRegistration } from '../skill-proficiencies/skill-proficiencies.config'
import { spellRegistration } from '../spells/spells.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { rejectInvalidCreatureTraitTemplates } from '../lib/reject-creature-trait-templates'

export async function monstersValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const rawBody = ctx.effectiveBody ?? ctx.input
  rejectInvalidCreatureTraitTemplates(rawBody.traits, ['traits'])
  const body = rawBody as Parameters<typeof collectMonsterCatalogIssues>[0]
  const [equipmentCatalog, skillCatalog, spellCatalog] = await Promise.all([
    resolveCatalogForCampaign(equipmentRegistration.read, ctx.campaignId),
    resolveCatalogForCampaign(skillProficiencyRegistration.read, ctx.campaignId),
    resolveCatalogForCampaign(spellRegistration.read, ctx.campaignId),
  ])
  const equipmentById = new Map<string, Equipment>(equipmentCatalog.map((row) => [row.id, row]))
  const skillBySlug = new Map<string, SkillProficiency>(skillCatalog.map((row) => [row.slug, row]))
  const spellsById = new Map<string, Spell>(spellCatalog.map((row) => [row.id, row]))
  const magicPropertyProvider = createMagicPropertyDefinitionProvider(
    ctx.rulesetId as SystemRulesetId,
  )
  const issues = collectMonsterCatalogIssues(
    body,
    {
      equipmentById,
      skillBySlug,
      equipmentCatalog: 'ready',
      skillCatalog: 'ready',
      spellsById,
      spellCatalog: 'ready',
      magicPropertyProvider,
    },
    ctx.validationIntent,
  )
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', 'Monster has invalid references.', { issues })
}
