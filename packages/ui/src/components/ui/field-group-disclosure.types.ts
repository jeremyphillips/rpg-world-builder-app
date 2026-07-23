import type { ChromeConfig } from './visual-vocabulary.types'

export type {
  ChromeBorderAccent,
  ChromeConfig,
  ChromeVariant,
  ContentTone,
  SemanticTone,
  SurfaceConfig,
  SurfaceElevation,
  SupportedSemanticChrome,
  VisualEmphasis,
} from './visual-vocabulary.types'

export type FieldGroupSummaryStatusTone = 'neutral' | 'success' | 'warning'

export type FieldGroupSummaryStatus = {
  label: string
  tone?: FieldGroupSummaryStatusTone
  /** Leading indicator on the status line */
  indicator?: 'dot' | 'inactive'
}

export type FieldGroupSummary = {
  /** Plain-text fallback for consumers that don't use structured status rows */
  primary?: string
  secondary?: string
  /** Supporting detail on the status line (e.g. "DM only") — muted, not disabled-looking */
  detail?: string
  status?: FieldGroupSummaryStatus
  /** Collapsed container treatment — read by disclosure wrapper only */
  chrome?: ChromeConfig
}

/** Legend-triggered collapse — fields stay registered when collapsed. */
export interface FieldGroupLegendDisclosure {
  variant: 'legend'
  defaultOpen?: boolean
  /** Stable key for uiStateKey persistence; falls back to group `id` or legend slug. */
  collapseKey?: string
}

/** Collapsed summary + Change / expanded Done for settings-style groups. Requires `FormProvider`. */
export interface FieldGroupSummaryDisclosure {
  variant: 'summary'
  defaultOpen?: boolean
  /** Stable key for uiStateKey persistence; falls back to group `id` or legend slug. */
  collapseKey?: string
  openLabel?: string
  closeLabel?: string
  unsavedSuffix?: string
  /** Appends `unsavedSuffix` while the surrounding form is dirty. Requires `FormProvider`. */
  showDirtySuffix?: boolean
  /** Disables disclosure actions while a save/preflight is in flight. */
  disabled?: boolean
  /**
   * Renders a top divider above the expanded field stack. Defaults to `true`.
   * Set `false` to omit the border only — panel top padding is unchanged.
   */
  panelDivider?: boolean
  resolveSummary: (values: Record<string, unknown>) => FieldGroupSummary
  /** Root-relative paths watched for summary resolution — omit to watch all values. */
  summaryDependsOn?: readonly string[]
}

export type FieldGroupDisclosure = FieldGroupLegendDisclosure | FieldGroupSummaryDisclosure

export function isLegendDisclosure(
  disclosure: FieldGroupDisclosure,
): disclosure is FieldGroupLegendDisclosure {
  return disclosure.variant === 'legend'
}

export function isSummaryDisclosure(
  disclosure: FieldGroupDisclosure,
): disclosure is FieldGroupSummaryDisclosure {
  return disclosure.variant === 'summary'
}

/** Default open state when `defaultOpen` is omitted — legend groups open, summary groups closed. */
export function resolveDisclosureDefaultOpen(
  disclosure: FieldGroupDisclosure | undefined,
): boolean {
  if (!disclosure) return true
  if (disclosure.defaultOpen !== undefined) return disclosure.defaultOpen
  return disclosure.variant === 'legend'
}
