import type { CharacterBuildContext } from '../context'
import { indexCharacterBuildCatalog } from '../context'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { resolveSpellcastingChoiceSets } from '../resolvers/spellcasting/resolve-spellcasting-choice-sets'
import { resolveSpellcastingProfile } from '../resolvers/spellcasting/spellcasting-profile'
import type { AutomaticNpcBuildSeed } from './automatic-npc-build-seed'

export type ReachableSpellOption = {
  id: string
  label: string
  choiceSetId: string
  choiceType: 'cantrip' | 'spell'
}

/**
 * Advisory: spell ChoiceSet options the UI may offer for a Quick NPC requirement
 * picker at the seed class/level. Picker eligibility does not imply build validity.
 */
export function listReachableSpellOptions(args: {
  seed: Pick<AutomaticNpcBuildSeed, 'classId' | 'level'>
  context: CharacterBuildContext
}): ReachableSpellOption[] {
  if (!args.seed.classId) return []

  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(args.seed.classId)
  if (!characterClass) return []

  const draft = {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: args.seed.classId, level: args.seed.level },
  }
  const profile = resolveSpellcastingProfile(draft, args.context)
  if (!profile) return []

  return resolveSpellcastingChoiceSets(profile, characterClass.slug, catalogIndex).flatMap(
    (choiceSet) =>
      choiceSet.options.map((option) => ({
        id: option.id,
        label: option.label,
        choiceSetId: choiceSet.id,
        choiceType: choiceSet.choiceType === 'cantrip' ? 'cantrip' : 'spell',
      })),
  )
}
