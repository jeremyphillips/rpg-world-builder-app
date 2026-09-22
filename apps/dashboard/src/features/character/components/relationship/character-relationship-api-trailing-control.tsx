import { useArrayFieldContext, useRelationshipFieldContext } from '@rpg/ui/form'

import type { CharacterOrganizationMembershipEdge } from '../../lib/relationship/character-relationship-field-context.types'
import type { CharacterRelationshipFieldContext } from '../../lib/relationship/character-relationship-field-context.types'
import { resolveOrganizationMembershipApiTrailing } from '../../lib/relationship/character-relationship-row.lib'
import { CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY } from '../../lib/relationship/character-relationship-vocabulary'
import type { CharacterRelationshipVocabulary } from '../../lib/relationship/character-relationship-vocabulary'

type CharacterRelationshipApiTrailingControlProps = {
  vocabulary: CharacterRelationshipVocabulary
}

/** API-sheet trailing actions for membership rows (edit / unresolved remove). */
export function CharacterRelationshipApiTrailingControl({
  vocabulary,
}: CharacterRelationshipApiTrailingControlProps) {
  const arrayContext = useArrayFieldContext()
  const { context } = useRelationshipFieldContext()
  const relationshipContext = context as CharacterRelationshipFieldContext

  if (
    !arrayContext ||
    relationshipContext.mode !== 'api' ||
    vocabulary !== CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY
  ) {
    return null
  }

  const membership = arrayContext.items[arrayContext.rowIndex] as
    | CharacterOrganizationMembershipEdge
    | undefined
  if (!membership) return null

  const trailing = resolveOrganizationMembershipApiTrailing(
    membership,
    relationshipContext,
    arrayContext.rowIndex,
    () => undefined,
  )

  return trailing?.kind === 'action' ? trailing.content : null
}
