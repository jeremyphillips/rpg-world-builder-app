import { joinNaturalList } from '../../primitives/prose'

/** Heading fragment in the stored order of `onlyInFormIds`, without parentheses. */
export function formatMonsterFormQualifier(formNames: readonly string[]): string | undefined {
  const names = formNames.map((name) => name.trim()).filter(Boolean)
  if (names.length === 0) return undefined
  return `${joinNaturalList(names, { conjunction: 'or' })} Form Only`
}
