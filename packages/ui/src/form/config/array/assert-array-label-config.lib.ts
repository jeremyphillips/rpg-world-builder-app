import type { ArrayConfig } from '../../field-config'
import { isNonWhitespaceLabel } from '../../form-heading.lib'

function warnInvalidArrayLabel(path: string, message: string): void {
  console.warn(`[Form] "${path}": ${message}`)
}

const INVALID_WHITESPACE_LABEL_MESSAGE =
  'named array heading.label must be a non-whitespace string — empty or whitespace-only labels are invalid.'
const HINT_REQUIRES_LABEL_MESSAGE = 'array heading.hint requires heading.label.'
const VISIBILITY_REQUIRES_LABEL_MESSAGE = 'array heading.labelVisibility requires heading.label.'

export function collectArrayLabelConfigIssues(config: ArrayConfig): string[] {
  const issues: string[] = []
  const heading = 'heading' in config ? config.heading : undefined

  if (heading !== undefined && !isNonWhitespaceLabel(heading.label)) {
    issues.push(INVALID_WHITESPACE_LABEL_MESSAGE)
  }
  if (heading?.hint !== undefined && !isNonWhitespaceLabel(heading.label)) {
    issues.push(HINT_REQUIRES_LABEL_MESSAGE)
  }
  if (heading?.labelVisibility !== undefined && !isNonWhitespaceLabel(heading.label)) {
    issues.push(VISIBILITY_REQUIRES_LABEL_MESSAGE)
  }

  return issues
}

/** Dev-only guard for invalid array heading combinations. */
export function assertArrayLabelConfig(config: ArrayConfig): void {
  if (process.env.NODE_ENV === 'production') return

  const path = config.name || 'array'
  for (const message of collectArrayLabelConfigIssues(config)) {
    warnInvalidArrayLabel(path, message)
  }
}
