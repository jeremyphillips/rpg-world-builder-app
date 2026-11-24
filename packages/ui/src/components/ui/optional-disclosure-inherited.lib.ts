import { INLINE_METADATA_SEPARATOR } from '@rpg/contracts/primitives'

const JOINED_SEPARATOR = ` ${INLINE_METADATA_SEPARATOR} `
const MIDDLE_DOT_SUMMARY_PATTERN = new RegExp(
  `^(.*?)${JOINED_SEPARATOR.replaceAll(' ', '\\s')}(.+)$`,
)
const COLON_SUMMARY_PATTERN = /^(.*?):\s(.+)$/

/** Appends `:` for open source-preview labels when authors omit punctuation. */
export function optionalDisclosureInheritedSourceLeading(label: string): string {
  const trimmed = label.trimEnd()
  if (trimmed.endsWith(':') || trimmed.endsWith(INLINE_METADATA_SEPARATOR)) return trimmed
  return `${trimmed}:`
}

/** Splits a collapsed override summary into muted leading + emphasized value segments. */
export function splitOptionalDisclosureSummary(summary: string): {
  leading: string
  value?: string
} {
  const middleDot = summary.match(MIDDLE_DOT_SUMMARY_PATTERN)
  if (middleDot) {
    return { leading: `${middleDot[1]} ${INLINE_METADATA_SEPARATOR}`, value: middleDot[2] }
  }

  const colon = summary.match(COLON_SUMMARY_PATTERN)
  if (colon) {
    return { leading: `${colon[1]}:`, value: colon[2] }
  }

  return { leading: summary }
}
