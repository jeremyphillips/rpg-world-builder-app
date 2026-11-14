import type { ReactNode } from 'react'

import type { FieldNoun } from '@rpg/contracts'

import type { FieldSize } from '../../components/ui/field.client'
import type { FieldChrome } from '../../components/ui/field-chrome.variants'
import type { FieldWidth } from '../../components/ui/field-control.variants'
import type { FieldHintPosition, FieldSeparator } from '../../components/ui/field.variants'
import type { FieldLabelVisibility } from '../form-heading.lib'

import type {
  FieldInteractivity,
  FieldPresentationConfig,
  FieldVisibility,
} from './field-visibility'
import type { FieldDynamicHint } from './field-dynamic.types'

export type { FieldReadOnlyContext, FieldPresentationConfig } from './field-visibility'

export type FormNavigationAnchor = {
  id: string
  /** Concise sidebar label; form heading/label remains authoritative for the form surface. */
  label?: string
}
export type FieldType =
  | 'text'
  | 'textSuggestions'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'radioCard'
  | 'segmentedControl'
  | 'checkbox'
  | 'switch'
  | 'json'
  | 'richtext'
  | 'markdown'
  | 'file'
  | 'chips'
  | 'combobox'
  | 'editableGrid'
  | 'diceFormula'
  | 'inputSelect'
  | 'inputUnit'
  | 'chooseFromChips'
  | 'inlineChooseCount'
  | 'inlineSentence'
  | 'joinedPair'
  | 'levelRange'
  | 'rollValue'
/** Decorative mark rendered inside the hint element so `aria-describedby` still points at it. */
export type FieldHintIcon = 'info'

/** Static and dynamic hint configuration on leaf fields. */
export interface FieldHintConfig {
  text?: string
  position?: FieldHintPosition
  /** Info icon inside the hint. Shown only while hint text is present. */
  icon?: FieldHintIcon
  resolve?: FieldDynamicHint
}

/** One label/value row in derived field metadata (informational, not authored). */
export interface FieldDerivedMetaRow {
  /** Omit or leave empty for a single value line (no label column). */
  label?: string
  value: string
}

/** Resolved derived metadata below the control — display-only, never serialized. */
export interface FieldDerivedMeta {
  rows: readonly FieldDerivedMetaRow[]
}

/**
 * Dynamic metadata projected from watched form values (e.g. archetype typical uses).
 * Informational only — must not participate in values, dirty state, validation, or serialization.
 */
export interface FieldDerivedMetaConfig {
  /** When true, reserve one metadata line to prevent empty → populated layout shift. */
  reserveSpace?: boolean
  dependsOn: readonly string[]
  metaWhen: (values: Record<string, unknown>) => FieldDerivedMeta | undefined
}

/**
 * Patches form values when watched driver fields change (after initial mount).
 * Used to remove dependent selections when a mode or category changes.
 */
export interface FormValueSync {
  dependsOn: string[]
  apply: (
    values: Record<string, unknown>,
    changedKeys: string[],
  ) => Partial<Record<string, unknown>> | undefined
}

/** Properties shared by every leaf field config. */
export interface BaseFieldConfig {
  /** Form value key; also the basis of the generated control id. */
  name: string
  label: string
  /**
   * Visible vs screen-reader-only labeling. Parent headings may replace redundant
   * visible labels; the accessible name always comes from `label`.
   * @default 'visible'
   */
  labelVisibility?: FieldLabelVisibility
  /**
   * Overrides control scale only; does not change sibling field rhythm. Rare —
   * prefer section `density` on shells, groups, or arrays.
   */
  controlSizeOverride?: FieldSize
  /**
   * Width of the field wrapper within its container — see `FIELD_WIDTHS`.
   *
   * **Intrinsic** (`xs` ~64px, `sm`, `md`, `lg`, `xl`, `auto`): capped width; use
   * `auto` or fractions inside a `kind: 'row'`. Standalone fields with `digits`
   * usually keep `full` so label and hint span the column.
   *
   * **Row fractions** (`full`, `1/2`, `1/3`, `2/3`, `1/4`, `3/4`): meaningful
   * only inside `kind: 'row'` — distributes flex grow weight on a base-12 scale.
   *
   * @default full
   */
  width?: FieldWidth
  hint?: string | FieldHintConfig
  /**
   * Optional singular/plural noun phrases for generated placeholders, constraint
   * hints, and validation copy when the visible label is not grammatical alone.
   */
  noun?: FieldNoun
  /** Informational metadata below the control — resolved from other field values. */
  derivedMeta?: FieldDerivedMetaConfig
  /** Renders the label `[i]` InfoTooltip. */
  info?: ReactNode
  required?: boolean
  disabled?: boolean
  /**
   * Conditional rendering — field is required only while visible. List every
   * field name `visibleWhen` reads in `dependsOn` so the renderer can subscribe
   * narrowly via `useWatch`.
   */
  visibility?: FieldVisibility
  interactivity?: FieldInteractivity
  /** Trailing divider after this field — `faint` | `subtle` | `default` | `strong` (border ladder). */
  separator?: FieldSeparator
  /**
   * Visual shell around the full field anatomy (label + control + messages).
   * Discriminated union — not a flat enum:
   *
   * - omitted — resolves from ancestor `fieldChrome` cascade, section suppression, or
   *   `{ variant: 'container' }` when this field is a top-level form unit
   * - `{ variant: 'none' }` — explicit opt-out (replaces deprecated `plain`)
   * - `{ variant: 'container', tone? }` — solid bg + border + 16px padding
   * - `{ variant: 'panel', tone? }` — filled panel wash
   * - `{ variant: 'outline', tone? }` — border-only inset
   *
   * Distinct from FieldGroup `chrome` (fieldset treatment) and dependent rail/panel chrome.
   */
  chrome?: FieldChrome
  /**
   * Presentation overrides for option-backed fields (`select`, `combobox`, …).
   * `readOnlyWhen` swaps the control for read-only chrome when it returns true
   * (e.g. only one option remains).
   */
  presentation?: FieldPresentationConfig
}
export const OPTIONAL_DISCLOSURE_FIELD_KINDS = [
  'text',
  'textSuggestions',
  'textarea',
  'richtext',
  'select',
  'rollValue',
  'joinedPair',
] as const
export type OptionalDisclosureFieldKind = (typeof OPTIONAL_DISCLOSURE_FIELD_KINDS)[number]

/** Prompt before clearing optional dependent or disclosure field content. */
export type ConfirmBeforeClearConfig = {
  headline: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'text'
  /** When omitted, confirm if any cleared leaf field has meaningful content. */
  shouldConfirm?: (
    values: Record<string, unknown>,
    context: { namePrefix?: string; clearingFieldNames: readonly string[] },
  ) => boolean
}

/**
 * Display-only line for a labeled disclosure. `resolve` may read `open` so the
 * copy can differ while the structured value is present. It must not write form state.
 */
export type OptionalDisclosureSummary = {
  dependsOn: readonly string[]
  resolve: (values: Record<string, unknown>, state: { open: boolean }) => string | undefined
}

/** Disables the add action from watched form values while collapsed. */
export type OptionalDisclosureAddGate = {
  dependsOn: readonly string[]
  disabledWhen: (values: Record<string, unknown>) => boolean
  disabledReasonWhen?: (values: Record<string, unknown>) => string | undefined
}

/** Collapse empty optional fields behind an add control (textarea and select). */
export type OptionalDisclosureConfig = {
  addLabel: string
  removeLabel?: string
  /** When true (default), populated values keep the field expanded. */
  expandWhenPopulated?: boolean
  /** When set, removing populated content prompts before clearing. */
  confirmBeforeClear?: ConfirmBeforeClearConfig
  /**
   * Keep the section label visible when collapsed, with the add action on that
   * row and `summary` underneath. Scalar disclosures leave this unset.
   */
  labeled?: boolean
  /** Inherited or status text. `seedWhen` receives these `dependsOn` values. */
  summary?: OptionalDisclosureSummary
  /** Value written when the add action opens a structured field. */
  seedWhen?: (values: Record<string, unknown>) => unknown
  /** Disables the add action. Does not disable an open editor. */
  addDisabled?: boolean
  /** Disables the add action from watched values; optional caption while collapsed. */
  addGate?: OptionalDisclosureAddGate
}

/** Attached trailing action on a text-like field — operation failure stays outside RHF validation. */
export type TrailingFieldActionConfig = {
  label: string
  /** Optional decorative icon rendered before the label. */
  icon?: ReactNode
  onAction: () => void | Promise<void>
  disabled?: boolean
  pending?: boolean
  /** Caller-owned operation error — not RHF field validation. */
  error?: string
}
