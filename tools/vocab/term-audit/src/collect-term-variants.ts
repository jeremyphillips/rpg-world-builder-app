import { vocabularyTermLabel } from '@rpg/contracts'

import type { TermAuditTarget, TermSearchVariant } from './types'

function titleCaseWords(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase())
}

export function collectTermVariants(
  target: TermAuditTarget,
  options: { includeCompact?: boolean } = {},
): TermSearchVariant[] {
  const sentence = target.term.sentence
  if (!sentence?.singular || !sentence.plural) {
    throw new Error(`Term ${target.id} has no usable singular and plural sentence forms.`)
  }
  const variants: TermSearchVariant[] = [
    { form: 'label', value: target.term.label },
    { form: 'singular', value: sentence.singular },
    { form: 'plural', value: sentence.plural },
  ]

  if (options.includeCompact && target.term.compactLabel) {
    variants.push({ form: 'compact_label', value: target.term.compactLabel })
  }

  if (target.kind === 'content_type') {
    variants.push({
      form: 'derived_collection_label',
      value: titleCaseWords(
        vocabularyTermLabel(target.term, { number: 'plural', casing: 'sentence' }),
      ),
    })
  }

  return variants
    .sort((left, right) => left.form.localeCompare(right.form))
    .filter(
      (variant, index, entries) =>
        index === 0 ||
        variant.value !== entries[index - 1]?.value ||
        variant.form !== entries[index - 1]?.form,
    )
}
