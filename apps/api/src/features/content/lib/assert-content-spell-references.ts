import {
  collectAuthoredSpellReferences,
  collectSpellReferenceIssues,
  type Spell,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import type { ContentWriteContext } from './content-write-config'

/** Rejects unknown or non-referenceable spell ids on a content write. */
export async function assertContentSpellReferences(
  ctx: ContentWriteContext,
  body: unknown,
): Promise<void> {
  const { spellRegistration } = await import('../spells/spells.config')
  const spells = await resolveCatalogForCampaign(spellRegistration.read, ctx.campaignId)
  const issues = collectSpellReferenceIssues({
    refs: collectAuthoredSpellReferences(body),
    spellsById: new Map<string, Spell>(spells.map((spell) => [spell.id, spell])),
    catalogStatus: 'ready',
    intent: ctx.validationIntent,
  })
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', 'Spell references are invalid.', { issues })
}
