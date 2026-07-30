import { vocabularyOptionIdSchema } from './vocabulary'

const FALLBACK_VOCABULARY_ENTRY_ID = 'untitled'

function slugifyVocabularyLabel(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Derives a vocabulary option id from a display label.
 * Validates against `vocabularyOptionIdSchema`; API re-derives authoritatively on create.
 */
export function deriveVocabularyEntryId(label: string): string {
  const candidate = slugifyVocabularyLabel(label) || FALLBACK_VOCABULARY_ENTRY_ID
  return vocabularyOptionIdSchema.parse(candidate)
}
