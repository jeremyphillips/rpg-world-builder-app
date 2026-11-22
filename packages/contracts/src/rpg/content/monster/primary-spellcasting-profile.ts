import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import type { MonsterActionSection } from './action-sections'
import {
  isPrimarySpellcastingAction,
  MONSTER_SPELLCASTING_ACTION_NAME,
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
  PRIMARY_SPELLCASTING_NAME_MESSAGE,
  PRIMARY_SPELLCASTING_SECTION_MESSAGE,
} from './spell-casting-source'

/** Publish and acquisition SSOT for the primary Spellcasting profile. */
export function refinePrimarySpellcastingProfileRow(input: {
  section: MonsterActionSection
  action: { kind?: string; name?: string; profile?: string }
  path: (string | number)[]
  ctx: z.RefinementCtx
  requireCanonicalName?: boolean
}): void {
  if (!isPrimarySpellcastingAction(input.action)) return
  if (input.section !== 'actions') {
    addCustomRefinementIssue(input.ctx, PRIMARY_SPELLCASTING_SECTION_MESSAGE, [
      ...input.path,
      'profile',
    ])
  }
  if (
    input.requireCanonicalName &&
    input.action.name?.trim() !== MONSTER_SPELLCASTING_ACTION_NAME
  ) {
    addCustomRefinementIssue(input.ctx, PRIMARY_SPELLCASTING_NAME_MESSAGE, [...input.path, 'name'])
  }
}

export function refinePrimarySpellcastingDuplicate(
  profileRows: readonly { path: (string | number)[] }[],
  ctx: z.RefinementCtx,
): void {
  for (const extra of profileRows.slice(1)) {
    addCustomRefinementIssue(ctx, PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE, [
      ...extra.path,
      'profile',
    ])
  }
}

export function refineReservedSpellcastingName(input: {
  action: { kind?: string; name?: string; profile?: string }
  path: (string | number)[]
  ctx: z.RefinementCtx
}): void {
  if (input.action.kind !== 'spell') return
  if (input.action.name?.trim() !== MONSTER_SPELLCASTING_ACTION_NAME) return
  if (isPrimarySpellcastingAction(input.action)) return
  addCustomRefinementIssue(input.ctx, PRIMARY_SPELLCASTING_NAME_MESSAGE, [...input.path, 'name'])
}
