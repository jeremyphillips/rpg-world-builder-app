import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterEquipment, CharacterWealth } from '../../character/sheet/equipment-inventory'
import type { CharacterProficiencies } from '../../character/sheet/proficiencies'
import type { ChoiceSet } from '../choice-set'
import {
  indexCharacterBuildCatalog,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
} from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import {
  isBuilderLevelZeroClassless,
  isClassProgressionApplicable,
  sanitizeClassForLevel,
} from '../progression/character-level-policy'
import { assembleCharacterProficiencies } from './assemble-proficiencies'
import { assembleLevelZeroStartingEquipment } from './assemble-level-zero-starting-equipment'
import { assembleStartingEquipment } from './assemble-starting-equipment'

// ---------------------------------------------------------------------------
// Loadout — the proficiencies and inventory finalize persists. Shared by
// finalize and build advisories so both evaluate identical facts.
// ---------------------------------------------------------------------------

export type CharacterBuildLoadout = {
  effectiveDraft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  /** Undefined only for level-zero classless builds. */
  characterClass: CharacterClass | undefined
  isClasslessLevelZero: boolean
  proficiencies: CharacterProficiencies
  equipment: CharacterEquipment
  wealth: CharacterWealth
}

export type CharacterBuildLoadoutFailureReason =
  | 'class_required'
  | 'class_not_in_catalog'
  | 'class_not_permitted_at_level_zero'

export type CharacterBuildLoadoutFailure = {
  ok: false
  reason: CharacterBuildLoadoutFailureReason
}

export type CharacterBuildLoadoutResult =
  | { ok: true; loadout: CharacterBuildLoadout }
  | CharacterBuildLoadoutFailure

function resolveLoadoutClass(
  draft: CharacterBuilderDraft,
  effectiveDraft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): { ok: true; characterClass: CharacterClass | undefined } | CharacterBuildLoadoutFailure {
  if (!isClassProgressionApplicable(draft.class.level)) {
    if (draft.class.classId) return { ok: false, reason: 'class_not_permitted_at_level_zero' }
    return { ok: true, characterClass: undefined }
  }
  const classId = effectiveDraft.class.classId
  if (!classId) return { ok: false, reason: 'class_required' }
  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return { ok: false, reason: 'class_not_in_catalog' }
  return { ok: true, characterClass }
}

/**
 * Assembles proficiencies, equipment, and wealth exactly as finalize persists
 * them. Returns an explicit failure instead of a degraded loadout when the
 * class cannot be resolved.
 */
export function resolveCharacterBuildLoadout(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
): CharacterBuildLoadoutResult {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const effectiveDraft = sanitizeClassForLevel(draft)
  const classResult = resolveLoadoutClass(draft, effectiveDraft, catalogIndex)
  if (!classResult.ok) return classResult

  const { characterClass } = classResult
  const isClasslessLevelZero = isBuilderLevelZeroClassless(draft, context)
  const proficiencies = assembleCharacterProficiencies(
    effectiveDraft,
    catalogIndex,
    choiceSets,
    characterClass,
    context,
  )
  const { equipment, wealth } = isClasslessLevelZero
    ? assembleLevelZeroStartingEquipment(effectiveDraft, {
        rulesetId: context.rulesetId,
        levelZeroRules: context.characterCreationRules.levelZeroNpcs,
        catalogIndex,
      })
    : assembleStartingEquipment(effectiveDraft, catalogIndex, {
        startingWealth: context.characterCreationRules.startingWealth,
        rulesetId: context.rulesetId,
      })

  return {
    ok: true,
    loadout: {
      effectiveDraft,
      catalogIndex,
      characterClass,
      isClasslessLevelZero,
      proficiencies,
      equipment,
      wealth,
    },
  }
}
