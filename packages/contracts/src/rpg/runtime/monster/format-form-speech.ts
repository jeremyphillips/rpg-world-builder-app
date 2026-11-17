import { joinNaturalList } from '../../primitives/prose'

export function formatFormSpeechQualifier(silentFormNames: readonly string[]): string | undefined {
  if (silentFormNames.length === 0) return undefined
  const listed = joinNaturalList(silentFormNames, { conjunction: 'or' })
  return `(can't speak in ${listed} form)`
}

export function formatFormSpeechDescriptionSentence(
  monsterName: string,
  silentFormNames: readonly string[],
): string | undefined {
  if (silentFormNames.length === 0) return undefined
  const listed = joinNaturalList(silentFormNames, { conjunction: 'or' })
  return `While in ${listed} form, the ${monsterName.trim().toLocaleLowerCase()} can't speak.`
}

export const TRUE_FORM_ONLY_FLY_SENTENCE = 'Its Fly Speed is available only in its true form.'
