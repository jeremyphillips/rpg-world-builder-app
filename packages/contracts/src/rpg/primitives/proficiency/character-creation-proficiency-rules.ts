import { z } from 'zod'

import {
  languageProficiencyChoiceSchema,
  languageProficiencyGrantSetSchema,
  type LanguageProficiencyChoice,
  type LanguageProficiencyGrantSet,
} from './proficiency-grant-set'

// ---------------------------------------------------------------------------
// Character-creation proficiency rules — ruleset/campaign defaults for automatic
// grants and player language choices (origin languages, etc.).
// ---------------------------------------------------------------------------

export const ORIGIN_LANGUAGES_CHOICE_ID = 'origin-languages' as const

/** SRD default: Common is granted automatically at character creation. */
export const DEFAULT_LANGUAGE_PROFICIENCY_GRANT = {
  items: ['common'],
  categories: [],
} as const satisfies LanguageProficiencyGrantSet

/** SRD default: choose two additional standard languages. */
export const DEFAULT_LANGUAGE_PROFICIENCY_CHOICES = [
  {
    id: ORIGIN_LANGUAGES_CHOICE_ID,
    label: 'Origin Languages',
    choose: 2,
    categories: ['standard'],
    from: [],
  },
] as const satisfies readonly LanguageProficiencyChoice[]

export const characterCreationProficiencyGrantsPatchSchema = z
  .object({
    languages: languageProficiencyGrantSetSchema.optional(),
  })
  .strict()

export type CharacterCreationProficiencyGrantsPatch = z.infer<
  typeof characterCreationProficiencyGrantsPatchSchema
>

export const characterCreationProficiencyChoicesPatchSchema = z
  .object({
    languages: z.array(languageProficiencyChoiceSchema).optional(),
  })
  .strict()

export type CharacterCreationProficiencyChoicesPatch = z.infer<
  typeof characterCreationProficiencyChoicesPatchSchema
>

export const characterCreationProficiencyRulesPatchSchema = z
  .object({
    proficiencyGrants: characterCreationProficiencyGrantsPatchSchema.optional(),
    proficiencyChoices: characterCreationProficiencyChoicesPatchSchema.optional(),
  })
  .strict()

export type CharacterCreationProficiencyRulesPatch = z.infer<
  typeof characterCreationProficiencyRulesPatchSchema
>

export const resolvedCharacterCreationProficiencyGrantsSchema = z.object({
  languages: languageProficiencyGrantSetSchema,
})

export type ResolvedCharacterCreationProficiencyGrants = z.infer<
  typeof resolvedCharacterCreationProficiencyGrantsSchema
>

export const resolvedCharacterCreationProficiencyChoicesSchema = z.object({
  languages: z.array(languageProficiencyChoiceSchema).min(1),
})

export type ResolvedCharacterCreationProficiencyChoices = z.infer<
  typeof resolvedCharacterCreationProficiencyChoicesSchema
>

export const resolvedCharacterCreationProficiencyRulesSchema = z.object({
  proficiencyGrants: resolvedCharacterCreationProficiencyGrantsSchema,
  proficiencyChoices: resolvedCharacterCreationProficiencyChoicesSchema,
})

export type ResolvedCharacterCreationProficiencyRules = z.infer<
  typeof resolvedCharacterCreationProficiencyRulesSchema
>

/** Applies SRD defaults and sparse patch overrides for language proficiency rules. */
export function resolveCharacterCreationProficiencyRules(
  patch?: CharacterCreationProficiencyRulesPatch,
): ResolvedCharacterCreationProficiencyRules {
  return {
    proficiencyGrants: {
      languages: languageProficiencyGrantSetSchema.parse({
        ...DEFAULT_LANGUAGE_PROFICIENCY_GRANT,
        ...patch?.proficiencyGrants?.languages,
      }),
    },
    proficiencyChoices: {
      languages: patch?.proficiencyChoices?.languages ?? [...DEFAULT_LANGUAGE_PROFICIENCY_CHOICES],
    },
  }
}
