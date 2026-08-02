import { SPELL_SCHOOL_SET_ID } from '@rpg/contracts'

import { buildSpellSchoolVocabulary } from '../lib/sets/spell-schools'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved spell school labels and active ids for forms and tables. */
export function useSpellSchoolVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, SPELL_SCHOOL_SET_ID)

  return {
    ...query,
    vocabulary: query.data ? buildSpellSchoolVocabulary(query.data) : undefined,
  }
}
