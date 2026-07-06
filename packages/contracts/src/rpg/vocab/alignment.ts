import { z } from 'zod'

import { getTermSentenceForm } from './types'
import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Alignments — the closed SRD 5.2.1 moral compass set. Shared by characters,
// NPCs, and monsters. Two-letter ids match SRD abbreviations (LG → lg).
// ---------------------------------------------------------------------------

export const ALIGNMENT_ENTRIES = {
  lg: {
    label: 'Lawful Good',
    description:
      'Lawful Good creatures endeavor to do the right thing as expected by society. Someone who fights injustice and protects the innocent without hesitation is probably Lawful Good.',
  },
  ng: {
    label: 'Neutral Good',
    description:
      'Neutral Good creatures do the best they can, working within rules but not feeling bound by them. A kindly person who helps others according to their needs is probably Neutral Good.',
  },
  cg: {
    label: 'Chaotic Good',
    description:
      'Chaotic Good creatures act as their conscience directs with little regard for what others expect. A rebel who waylays a cruel baron’s tax collectors and uses the stolen money to help the poor is probably Chaotic Good.',
  },
  ln: {
    label: 'Lawful Neutral',
    description:
      'Lawful Neutral individuals act in accordance with law, tradition, or personal codes. Someone who follows a disciplined rule of life—and isn’t swayed either by the demands of those in need or by the temptations of evil—is probably Lawful Neutral.',
  },
  n: {
    label: 'Neutral',
    description:
      'Neutral is the alignment of those who prefer to avoid moral questions and don’t take sides, doing what seems best at the time. Someone who’s bored by moral debate is probably Neutral.',
  },
  cn: {
    label: 'Chaotic Neutral',
    description:
      'Chaotic Neutral creatures follow their whims, valuing their personal freedom above all else. A scoundrel who wanders the land living by their wits is probably Chaotic Neutral.',
  },
  le: {
    label: 'Lawful Evil',
    description:
      'Lawful Evil creatures methodically take what they want within the limits of a code of tradition, loyalty, or order. An aristocrat exploiting citizens while scheming for power is probably Lawful Evil.',
  },
  ne: {
    label: 'Neutral Evil',
    description:
      'Neutral Evil is the alignment of those who are untroubled by the harm they cause as they pursue their desires. A criminal who robs and murders as they please is probably Neutral Evil.',
  },
  ce: {
    label: 'Chaotic Evil',
    description:
      'Chaotic Evil creatures act with arbitrary violence, spurred by their hatred or bloodlust. A villain pursuing schemes of vengeance and havoc is probably Chaotic Evil.',
  },
} as const satisfies Record<string, GameTermEntry>

export type Alignment = keyof typeof ALIGNMENT_ENTRIES

export const ALIGNMENTS = Object.keys(ALIGNMENT_ENTRIES) as [Alignment, ...Alignment[]]

export const alignmentSchema = z.enum(ALIGNMENTS)

/** Coerces blank select sentinels before enum validation (forms, persisted drafts). */
export const optionalAlignmentSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.length === 0 ? undefined : value),
  alignmentSchema.optional(),
)

/** Returns the reference entry for an alignment id, if known. */
export function getAlignmentEntry(id: string): GameTermEntry | undefined {
  return ALIGNMENT_ENTRIES[id as Alignment]
}

/** Returns the display label for an alignment id. Falls back to the raw value. */
export function getAlignmentLabel(id: string): string {
  return getAlignmentEntry(id)?.label ?? id
}

/** Returns a label with the SRD abbreviation (e.g. "Lawful Good (LG)"). */
export function formatAlignmentLabel(id: string): string {
  const entry = getAlignmentEntry(id)
  if (!entry) return id
  return `${entry.label} (${id.toUpperCase()})`
}

/** Counted noun phrase for generated alignment prose. */
export function getAlignmentSentenceForm(id: string, count = 1): string {
  const entry = getAlignmentEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
}
