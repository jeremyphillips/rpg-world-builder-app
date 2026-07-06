import type { Request, Response } from 'express'

import { HttpError } from '../../lib/http-error'
import { getContentWriteConfig } from '../content'
import {
  assertSupportedRulesetId,
  getStandaloneRulesetPatchRead,
  isRulesetContentType,
  listRulesetLanguageOptions,
  listSystemContentForRuleset,
} from './ruleset.service'

export async function listContent(req: Request, res: Response): Promise<void> {
  const { rulesetId, contentType } = req.params as { rulesetId: string; contentType: string }
  assertSupportedRulesetId(rulesetId)

  if (!isRulesetContentType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }

  const writeConfig = getContentWriteConfig(contentType)!
  const items = listSystemContentForRuleset(contentType, rulesetId)
  res.status(200).json({ [writeConfig.responseKey]: items })
}

export async function getCharacterCreationRules(req: Request, res: Response): Promise<void> {
  const { rulesetId } = req.params as { rulesetId: string }
  assertSupportedRulesetId(rulesetId)

  const patch = getStandaloneRulesetPatchRead(rulesetId)
  res.status(200).json({ patch })
}

export async function listLanguages(req: Request, res: Response): Promise<void> {
  const { rulesetId } = req.params as { rulesetId: string }
  assertSupportedRulesetId(rulesetId)

  res.status(200).json({ languages: listRulesetLanguageOptions(rulesetId) })
}
