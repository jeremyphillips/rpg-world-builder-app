import { withIndefiniteArticle } from '../../../primitives/prose'
import type { ClassSpellcastingFocusKind } from '../../../vocab/spell/class-spellcasting-focus-kind'
import {
  getClassSpellcastingFocusKindEntry,
  getClassSpellcastingFocusKindLabel,
} from '../../../vocab/spell/class-spellcasting-focus-kind'

/** Player-facing focus noun phrase for generated spellcasting rules. */
export function formatClassFocusNounPhrase(kind: ClassSpellcastingFocusKind): string {
  const entry = getClassSpellcastingFocusKindEntry(kind)
  const label = getClassSpellcastingFocusKindLabel(kind)
  if (!entry) return withIndefiniteArticle(label)
  if (entry.focusDeterminer === 'possessive') {
    return `your ${label}`
  }
  return withIndefiniteArticle(label)
}
