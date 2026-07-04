import {
  resolveCharacterCreationPatch,
  SYSTEM_RULESET_IDS,
  type SystemRulesetId,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { HttpError } from '../../lib/http-error'
import {
  getContentTypeConfig,
  isContentTypeName,
  type ContentTypeName,
} from '../content/content-types'
import { resolveStoredMechanicsPatch } from '../vocabulary/ruleset-patch/mechanics-patch.service'

export function assertSupportedRulesetId(rulesetId: string): asserts rulesetId is SystemRulesetId {
  if (!SYSTEM_RULESET_IDS.includes(rulesetId as SystemRulesetId)) {
    throw new HttpError(404, 'not_found', `Unsupported ruleset "${rulesetId}".`)
  }
}

/** System seed catalog for one content type — no campaign patches or homebrew. */
export function listSystemContentForRuleset(type: ContentTypeName, rulesetId: SystemRulesetId) {
  const config = getContentTypeConfig(type)
  return [...config.loadSystem(rulesetId)]
}

export function isRulesetContentType(type: string): type is ContentTypeName {
  return isContentTypeName(type)
}

/** Resolved rules for an unpatched campaign — standalone builder bootstrap. */
export function getStandaloneRulesetPatchRead(rulesetId: SystemRulesetId) {
  return {
    characterCreation: resolveCharacterCreationPatch(
      undefined,
      getStandardStartingWealthRules(rulesetId),
    ),
    mechanics: resolveStoredMechanicsPatch(undefined),
  }
}
