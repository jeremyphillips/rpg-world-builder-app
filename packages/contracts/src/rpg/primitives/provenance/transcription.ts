import { vocabEnumFromEntries } from '../../vocab/enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../../vocab/types'

export const SOURCE_TRANSCRIPTION_CLEANUP_TERM = {
  label: 'Source transcription cleanup',
  description:
    'Documented cleanup applied when storing a source passage. Wording, spelling, and punctuation stay as printed.',
  sentence: {
    singular: 'source transcription cleanup',
    plural: 'source transcription cleanups',
  },
} as const satisfies VocabularyTerm

export const SOURCE_TRANSCRIPTION_CLEANUP_ENTRIES = {
  'page-chrome': {
    label: 'Page chrome',
    description:
      'Dropped running headers, footers, and page numbers that are not part of the passage.',
  },
  'line-rejoin': {
    label: 'Line rejoin',
    description:
      'Joined lines wrapped by the text layer, including a hyphen that splits one printed word across a line break.',
  },
  whitespace: {
    label: 'Whitespace',
    description: 'Collapsed insignificant spaces while keeping paragraph and list breaks.',
  },
  'unicode-nfc': {
    label: 'Unicode NFC',
    description: 'Normalized the passage to Unicode NFC.',
  },
} as const satisfies Record<string, GameTermEntry>

export const transcriptionCleanupIdSchema = vocabEnumFromEntries(
  SOURCE_TRANSCRIPTION_CLEANUP_ENTRIES,
)

export type TranscriptionCleanupId = keyof typeof SOURCE_TRANSCRIPTION_CLEANUP_ENTRIES

export const EXCERPT_CORRECTION_REASON_TERM = {
  label: 'Excerpt correction reason',
  description: 'Why an append-only source excerpt revision replaced the previous revision.',
  sentence: {
    singular: 'excerpt correction reason',
    plural: 'excerpt correction reasons',
  },
} as const satisfies VocabularyTerm

export const EXCERPT_CORRECTION_REASON_ENTRIES = {
  'transcription-error': {
    label: 'Transcription error',
    description: 'The previous revision mis-copied the printed passage.',
  },
  'source-errata': {
    label: 'Source errata',
    description: 'The publisher corrected the passage in the same document edition.',
  },
} as const satisfies Record<string, GameTermEntry>

export const excerptCorrectionReasonSchema = vocabEnumFromEntries(EXCERPT_CORRECTION_REASON_ENTRIES)

export type ExcerptCorrectionReason = keyof typeof EXCERPT_CORRECTION_REASON_ENTRIES
