import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../../content/classes/spellcasting'
import type { ChoiceSet } from '../../choice-set'
import type { ChoiceCounterVerb } from '../../format-spell-acquisition-copy'
import type { BuilderSpellcastingProfile } from './builder-spellcasting'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'

function choiceSetSuffix(choiceSetId: string): string | undefined {
  const parts = choiceSetId.split(':')
  return parts[parts.length - 1]
}

/** Counter verb from spell destination — not selection model. */
export function resolveSpellChoiceCounterVerb(
  choiceSet: ChoiceSet,
  _profile: BuilderSpellcastingProfile,
): ChoiceCounterVerb {
  if (choiceSet.choiceType === 'cantrip') return 'chosen'
  if (choiceSet.sourceType !== 'spellcasting') return 'chosen'

  const suffix = choiceSetSuffix(choiceSet.id)
  if (suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook) return 'learned'
  if (
    suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared ||
    suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire
  ) {
    return 'prepared'
  }

  return 'chosen'
}

export function isClassSpellcastingChoiceSet(choiceSet: ChoiceSet): boolean {
  return choiceSet.sourceType === 'spellcasting'
}

export function isClassSpellAcquisitionChoiceSet(
  choiceSet: ChoiceSet,
  profile: BuilderSpellcastingProfile,
): boolean {
  if (!isClassSpellcastingChoiceSet(choiceSet) || choiceSet.choiceType !== 'spell') {
    return false
  }

  const deferredPreparedId = spellcastingChoiceSetId(
    profile.classId,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
  )

  if (
    profile.spellcasting.spellSelection?.model === 'prepareFromLearnedCollection' &&
    choiceSet.id === deferredPreparedId
  ) {
    return false
  }

  return true
}

export function findClassSpellAcquisitionChoiceSet(
  choiceSets: readonly ChoiceSet[],
  profile: BuilderSpellcastingProfile,
): ChoiceSet | undefined {
  return choiceSets.find((choiceSet) => isClassSpellAcquisitionChoiceSet(choiceSet, profile))
}

export function resolveSpellAcquisitionDestination(
  choiceSet: ChoiceSet,
  profile: BuilderSpellcastingProfile,
): 'classList' | 'spellbook' | 'deferredPrepared' {
  const suffix = choiceSetSuffix(choiceSet.id)

  if (suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook) return 'spellbook'

  const deferredPreparedId = spellcastingChoiceSetId(
    profile.classId,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
  )
  if (
    choiceSet.id === deferredPreparedId &&
    profile.spellcasting.spellSelection?.model === 'prepareFromLearnedCollection'
  ) {
    return 'deferredPrepared'
  }

  return 'classList'
}
