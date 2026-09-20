import type { z } from 'zod'

import { defineMessage } from '../../../../validation/define-message'

import type { ClassSpellcastingProgression } from './class-spellcasting-progression'
import type { ClassSpellSelection } from './class-spell-selection'
import type { Spellcasting } from './spellcasting'

export const spellcastingValidationMessages = {
  repertoireRequired: defineMessage(
    'validation.spellcasting.repertoireRequired',
    () => 'Limited repertoire requires a repertoire progression with at least one breakpoint.',
  ),
  preparedSpellsRequired: defineMessage(
    'validation.spellcasting.preparedSpellsRequired',
    () =>
      'Prepared spell selection requires a prepared spells progression with at least one breakpoint.',
  ),
  repertoireForbidden: defineMessage(
    'validation.spellcasting.repertoireForbidden',
    () => 'Repertoire progression is not allowed for this spell selection model.',
  ),
  preparedSpellsForbidden: defineMessage(
    'validation.spellcasting.preparedSpellsForbidden',
    () => 'Prepared spells progression is not allowed for this spell selection model.',
  ),
  acquisitionRequired: defineMessage(
    'validation.spellcasting.acquisitionRequired',
    () => 'Prepare from a learned collection requires spell acquisition progression.',
  ),
  cantripsRequired: defineMessage(
    'validation.spellcasting.cantripsRequired',
    () => 'Classes that grant cantrips require a cantrip progression with at least one breakpoint.',
  ),
  cantripsForbidden: defineMessage(
    'validation.spellcasting.cantripsForbidden',
    () => 'Cantrip progression is not allowed when the class does not grant cantrips.',
  ),
  selectionProgressionForbidden: defineMessage(
    'validation.spellcasting.selectionProgressionForbidden',
    () => 'Repertoire and prepared spells progressions require a spell selection model.',
  ),
}

function hasCapacityRows(
  progression: { curve: { rows: readonly unknown[] } } | undefined,
): boolean {
  return (progression?.curve.rows.length ?? 0) > 0
}

/** Cross-field invariants for published / createClassInput spellcasting records. */
export function refinePublishedSpellcasting(
  spellcasting: Spellcasting,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
  options?: { grantsCantrips?: boolean },
): void {
  const progression = spellcasting.progression
  const selection = spellcasting.spellSelection
  const grantsCantrips = options?.grantsCantrips ?? hasCapacityRows(progression?.cantrips)

  refineSelectionAgainstProgression(selection, progression, ctx, pathPrefix)
  refineCantripsAgainstGrant(progression, grantsCantrips, ctx, pathPrefix)
}

// fallow-ignore-next-line complexity
function refineSelectionAgainstProgression(
  selection: ClassSpellSelection | undefined,
  progression: ClassSpellcastingProgression | undefined,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[],
): void {
  if (!selection) {
    if (hasCapacityRows(progression?.repertoire) || hasCapacityRows(progression?.preparedSpells)) {
      ctx.addIssue({
        code: 'custom',
        message: spellcastingValidationMessages.selectionProgressionForbidden(),
        path: [...pathPrefix, 'progression'],
      })
    }
    return
  }

  switch (selection.model) {
    case 'limitedRepertoire':
      if (!hasCapacityRows(progression?.repertoire)) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.repertoireRequired(),
          path: [...pathPrefix, 'progression', 'repertoire'],
        })
      }
      if (hasCapacityRows(progression?.preparedSpells)) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.preparedSpellsForbidden(),
          path: [...pathPrefix, 'progression', 'preparedSpells'],
        })
      }
      break
    case 'prepareFromClassList':
      if (!hasCapacityRows(progression?.preparedSpells)) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.preparedSpellsRequired(),
          path: [...pathPrefix, 'progression', 'preparedSpells'],
        })
      }
      if (hasCapacityRows(progression?.repertoire)) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.repertoireForbidden(),
          path: [...pathPrefix, 'progression', 'repertoire'],
        })
      }
      break
    case 'prepareFromLearnedCollection':
      if (!hasCapacityRows(progression?.preparedSpells)) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.preparedSpellsRequired(),
          path: [...pathPrefix, 'progression', 'preparedSpells'],
        })
      }
      if (selection.acquisition.curve.rows.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.acquisitionRequired(),
          path: [...pathPrefix, 'spellSelection', 'acquisition'],
        })
      }
      if (hasCapacityRows(progression?.repertoire)) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingValidationMessages.repertoireForbidden(),
          path: [...pathPrefix, 'progression', 'repertoire'],
        })
      }
      break
  }
}

function refineCantripsAgainstGrant(
  progression: ClassSpellcastingProgression | undefined,
  grantsCantrips: boolean,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[],
): void {
  if (grantsCantrips) {
    if (!hasCapacityRows(progression?.cantrips)) {
      ctx.addIssue({
        code: 'custom',
        message: spellcastingValidationMessages.cantripsRequired(),
        path: [...pathPrefix, 'progression', 'cantrips'],
      })
    }
    return
  }

  if (hasCapacityRows(progression?.cantrips)) {
    ctx.addIssue({
      code: 'custom',
      message: spellcastingValidationMessages.cantripsForbidden(),
      path: [...pathPrefix, 'progression', 'cantrips'],
    })
  }
}
