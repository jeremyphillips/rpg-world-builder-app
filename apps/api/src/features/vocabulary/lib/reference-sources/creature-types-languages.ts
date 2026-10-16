import { loadSeedVocabularyOptionSet } from '@rpg/catalog/vocabulary'
import {
  CREATURE_TYPE_SET_ID,
  type ContentUsageBlocker,
  USAGE_BLOCKER_SOURCE_KEYS,
} from '@rpg/contracts'

import { CampaignRulesetPatchModel } from '../campaign-ruleset-patch.model'
import { requireCampaignRuleset } from '../patch-document'
import { resolveVocabularySet } from '../resolve-vocabulary'
import { indexRecordsByVocabId } from './index-by-vocab-id'
import type { VocabularyUsageResolverContext } from '../vocabulary-usage-context'

type CreatureTypeLanguageReferrer = {
  id: string
  label: string
  languageAffinities?: readonly string[]
}

function extractLanguageIds(record: CreatureTypeLanguageReferrer): readonly string[] {
  return record.languageAffinities ?? []
}

function toGameTermUsageBlocker(record: CreatureTypeLanguageReferrer): ContentUsageBlocker {
  return {
    kind: 'game-term',
    sourceKey: USAGE_BLOCKER_SOURCE_KEYS.unknown,
    setId: CREATURE_TYPE_SET_ID,
    id: record.id,
    label: record.label,
  }
}

async function loadResolvedCreatureTypes(
  campaignId: string,
): Promise<CreatureTypeLanguageReferrer[]> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  const seed = loadSeedVocabularyOptionSet(rulesetId, CREATURE_TYPE_SET_ID)
  const patchDoc = await CampaignRulesetPatchModel.findOne({ campaignId, rulesetId }).lean()
  const setPatch = patchDoc?.vocabulary?.find((entry) => entry.setId === CREATURE_TYPE_SET_ID)
  const options = resolveVocabularySet(seed, setPatch)

  return options.map((option) => ({
    id: option.id,
    label: option.label,
    languageAffinities: option.languageAffinities,
  }))
}

/** Indexes creature-type language affinities for language vocabulary usage. */
export async function indexCreatureTypeLanguageBlockersByLanguageId(
  ctx: VocabularyUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadResolvedCreatureTypes(ctx.campaignId)
  return indexRecordsByVocabId(records, extractLanguageIds, toGameTermUsageBlocker)
}
