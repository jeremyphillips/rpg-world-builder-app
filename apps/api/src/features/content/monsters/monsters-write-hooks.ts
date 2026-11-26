import type { Equipment, SkillProficiency, Spell, SystemRulesetId } from '@rpg/contracts'
import { CREATURE_FAMILY_SET_ID, collectMonsterCatalogIssues } from '@rpg/contracts'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'

import { HttpError } from '../../../lib/http-error'
import {
  catalogOverlayFailureSlugs,
  resolveCatalogForCampaignWithOverlayContext,
} from '../content.service'
import { classRegistration } from '../classes/classes.config'
import {
  resolveVocabularySetForCampaign,
  vocabularyUsageContextForCampaign,
} from '../../vocabulary'
import { equipmentRegistration } from '../equipment/equipment.config'
import { skillProficiencyRegistration } from '../skill-proficiencies/skill-proficiencies.config'
import { spellRegistration } from '../spells/spells.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { rejectInvalidCreatureTraitTemplates } from '../lib/reject-creature-trait-templates'

export async function monstersValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const rawBody = ctx.effectiveBody ?? ctx.input
  rejectInvalidCreatureTraitTemplates(rawBody.traits, ['traits'], { host: 'monster' })
  const body = rawBody as Parameters<typeof collectMonsterCatalogIssues>[0]
  const [equipmentCtx, skillCtx, spellCtx, classCtx, familySet] = await Promise.all([
    resolveCatalogForCampaignWithOverlayContext(equipmentRegistration.read, ctx.campaignId),
    resolveCatalogForCampaignWithOverlayContext(skillProficiencyRegistration.read, ctx.campaignId),
    resolveCatalogForCampaignWithOverlayContext(spellRegistration.read, ctx.campaignId),
    resolveCatalogForCampaignWithOverlayContext(classRegistration.read, ctx.campaignId),
    resolveVocabularySetForCampaign(
      vocabularyUsageContextForCampaign(ctx.campaignId),
      CREATURE_FAMILY_SET_ID,
    ),
  ])
  const equipmentCatalog = equipmentCtx.records
  const skillCatalog = skillCtx.records
  const spellCatalog = spellCtx.records
  const classCatalog = classCtx.records
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
      classesById: new Map(classCatalog.map((row) => [row.id, row])),
      creatureFamilies: new Map(familySet.options.map((row) => [row.id, row])),
      skillBySlug,
      equipmentCatalog: 'ready',
      skillCatalog: 'ready',
      spellsById,
      spellCatalog: 'ready',
      magicPropertyProvider,
      unresolvedOverlayEquipmentIds: equipmentCtx.overlayFailureIds,
      unresolvedOverlaySkillSlugs: catalogOverlayFailureSlugs(skillCtx.overlayFailures),
      unresolvedOverlaySpellIds: spellCtx.overlayFailureIds,
      unresolvedOverlayClassIds: classCtx.overlayFailureIds,
    },
    ctx.validationIntent,
  )
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', 'Monster has invalid references.', { issues })
}
