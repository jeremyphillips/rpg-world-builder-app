import { indexCharacterBuildCatalog } from '../context'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { collectUnresolvedGrantedSpellIds } from '../assembly/assemble-granted-spells'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { validationIssue } from './issue'
import type { CharacterBuildValidationIssue } from './types'

/** Reports grant spell references that are not in the loaded catalog. */
export function validateGrantedSpellReferences(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = draft.class.classId
    ? catalogIndex.classes.get(draft.class.classId)
    : undefined
  const missing = collectUnresolvedGrantedSpellIds(draft, catalogIndex, characterClass)
  return missing.map((spellId) =>
    validationIssue(
      'granted_spell_unavailable',
      characterBuilderValidationMessages.grantedSpellUnavailable(),
      { path: `spells.${spellId}` },
    ),
  )
}
