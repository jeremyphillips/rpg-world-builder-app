import { LANGUAGE_TERM, nounFromTerm } from '@rpg/contracts'
import { ComboboxField } from '@rpg/ui'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { useMonsterLanguageAddField } from '../../lib/monster-language-add-field.lib'
import {
  MONSTER_ADD_LANGUAGE_LABEL,
  MONSTER_LANGUAGES_FIELD_HINT,
  MONSTER_LANGUAGES_FIELD_LABEL,
} from '../../lib/monster-form-labels'

export function MonsterCreatureDetailsLanguagesAddField({ ctx }: { ctx: ContentFormCtx }) {
  const {
    proficienciesReady,
    languageOptions,
    addLanguageKey,
    appendMonsterLanguage,
    recommendation,
  } = useMonsterLanguageAddField(ctx)

  if (!proficienciesReady || languageOptions.length === 0) return null

  return (
    <ComboboxField
      key={addLanguageKey}
      id="monster-add-language"
      label={MONSTER_LANGUAGES_FIELD_LABEL}
      hint={MONSTER_LANGUAGES_FIELD_HINT}
      hintPosition="below-label"
      recommendation={recommendation}
      options={languageOptions}
      multiple={false}
      enableSearch
      noun={nounFromTerm(LANGUAGE_TERM)}
      placeholder={MONSTER_ADD_LANGUAGE_LABEL}
      value=""
      onChange={(next) => {
        if (typeof next !== 'string' || !next) return
        appendMonsterLanguage(next)
      }}
    />
  )
}
