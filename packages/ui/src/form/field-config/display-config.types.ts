import type { AdvisoryAlertProps } from '../../components/ui/advisory-alert'
import type { RulesPreviewContent, RulesPreviewProps } from '../../components/ui/rules-preview'

import type { FieldVisibility } from './field-visibility'

/** Plain-text roles allowed on display `text` blocks — field `label` and emphasis are excluded. */
export type FormDisplayTextRole = 'supporting' | 'caption' | 'muted'

/** Rules preview content without the `html` escape hatch (display v1 default). */
export type FormDisplayRulesContent = Exclude<RulesPreviewContent, { kind: 'html' }>

export type FormDisplayTextBlock = {
  variant: 'text'
  text: string
  role?: FormDisplayTextRole
  live?: 'polite'
}

export type FormDisplayNoticeBlock = {
  variant: 'notice'
  notice: AdvisoryAlertProps
}

export type FormDisplayRulesPreviewBlock = {
  variant: 'rulesPreview'
  preview: Omit<RulesPreviewProps, 'content'> & { content: FormDisplayRulesContent }
}

/** Read-only feature summary row (table icon, title, metadata, optional type badge). */
export type FormDisplayFeatureTableRowBlock = {
  variant: 'featureTableRow'
  title: string
  metadata?: string
  typeLabel?: string
}

export type FormDisplayBlock =
  | FormDisplayTextBlock
  | FormDisplayNoticeBlock
  | FormDisplayRulesPreviewBlock
  | FormDisplayFeatureTableRowBlock

export type FormDisplayResolve = {
  dependsOn: readonly string[]
  contentWhen: (
    values: Record<string, unknown>,
  ) => FormDisplayBlock | readonly FormDisplayBlock[] | undefined
}

/**
 * Read-only form-related content resolved from declared dependencies.
 * No RHF registration, value writes, or custom render callbacks.
 */
export interface DisplayConfig {
  kind: 'display'
  /** Stable config identity, unique among siblings in the same stack (not an RHF path). */
  id: string
  content?: FormDisplayBlock | readonly FormDisplayBlock[]
  resolve?: FormDisplayResolve
  visibility?: FieldVisibility
}
