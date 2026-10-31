import type { ArrayConfig } from '../../field-config'
import { isNonWhitespaceLabel } from '../../form-heading.lib'

function warnInvalidArrayLabel(path: string, message: string): void {
  console.warn(`[Form] "${path}": ${message}`)
}

function hasArrayConfigKey<K extends keyof ArrayConfig>(
  config: ArrayConfig,
  key: K,
): config is ArrayConfig & Record<K, NonNullable<ArrayConfig[K]>> {
  return key in config && config[key] !== undefined
}

const INVALID_WHITESPACE_LABEL_MESSAGE =
  'array label must be omitted or a non-whitespace string — empty or whitespace-only labels are invalid.'
const HINT_REQUIRES_LABEL_MESSAGE = 'array hint requires a non-whitespace label.'
const VISIBILITY_REQUIRES_LABEL_MESSAGE = 'array labelVisibility requires a non-whitespace label.'

export function collectArrayLabelConfigIssues(config: ArrayConfig): string[] {
  const issues: string[] = []
  const hasLabel = hasArrayConfigKey(config, 'label')

  if (hasLabel && !isNonWhitespaceLabel(config.label)) {
    issues.push(INVALID_WHITESPACE_LABEL_MESSAGE)
  }
  if (hasArrayConfigKey(config, 'hint') && !hasLabel) {
    issues.push(HINT_REQUIRES_LABEL_MESSAGE)
  }
  if (hasArrayConfigKey(config, 'labelVisibility') && !hasLabel) {
    issues.push(VISIBILITY_REQUIRES_LABEL_MESSAGE)
  }

  return issues
}

/** Dev-only guard for invalid array label / hint combinations. */
export function assertArrayLabelConfig(config: ArrayConfig): void {
  if (process.env.NODE_ENV === 'production') return

  const path = config.name || 'array'
  for (const message of collectArrayLabelConfigIssues(config)) {
    warnInvalidArrayLabel(path, message)
  }
}
