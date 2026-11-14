import type { ReactNode } from 'react'

import type { ButtonVariantProps } from '../../components/ui/button.variants'
import type { FieldRowAlignment } from '../../components/ui/field-control-band.variants'
import type { FieldChrome } from '../../components/ui/field-chrome.variants'
import type { FieldGroupChrome } from '../../components/ui/field-group-chrome.variants'
import type { FieldGroupDisclosure } from '../../components/ui/field-group-disclosure.types'
import type {
  FieldDependentsScope,
  SemanticSurfaceTone,
} from '../../components/ui/field-dependent.variants'
import type { SurfaceConfig } from '../../components/ui/visual-vocabulary.types'
import type { FieldSeparator, GroupHeadingScale } from '../../components/ui/field.variants'
import type { ArrayAddMenuConfig } from '../config/array/array-add-menu.lib'
import type { ArrayItemShellRenderProps } from '../config/array/array-item-shell-render.types'
import type { FormColumnsCollapseOrder } from '../config/form-columns-collapse.lib'
import type { FormIssue, FormIssueScope, FormIssueSeverity } from '../errors/form-issue.types'
import type { FormDensity } from '../form-density'
import type { FieldLabelVisibility, FormHeading } from '../form-heading.lib'

import type { FieldWidth } from '../../components/ui/field-control.variants'

import type {
  ConfirmBeforeClearConfig,
  FieldHintConfig,
  FormNavigationAnchor,
  OptionalDisclosureConfig,
} from './field-base.types'
import type { FieldConfig } from './field-config.types'
import type { FieldOption } from './field-options'
import type { FieldVisibility } from './field-visibility'

export type {
  ArrayAddMenuConfig,
  ArrayAddMenuPresentationMap,
} from '../config/array/array-add-menu.lib'
export type { ArrayItemShellRenderProps } from '../config/array/array-item-shell-render.types'
export type { FormIssue, FormIssueScope, FormIssueSeverity } from '../errors/form-issue.types'

/** Leaf fields and slots allowed inside a horizontal `kind: 'row'`. */
export type RowFieldItem = FieldConfig | SlotConfig
/** Vertical pipe divider between siblings inside a schema row. */
export type FieldRowDivider = {
  variant: 'pipe'
  tone?: FieldSeparator
}

/** Inter-control spacing within a schema row. */
export type RowSpacing = 'default' | 'compact'

export interface RowConfig {
  kind: 'row'
  /** Leaf-tier composite heading for the row block. */
  heading?: FormHeading
  /** Optional DOM id on the row composite wrapper — for in-page scroll anchors. */
  id?: string
  /** Opt-in navigation metadata for sidebar / scroll-spy consumers. */
  navigation?: FormNavigationAnchor
  fields: RowFieldItem[]
  /** Inter-control spacing within the row. @default 'default' */
  spacing?: RowSpacing
  /** Vertical pipe between row siblings — suppresses gap-x; gutter follows form rhythm. */
  fieldDivider?: FieldRowDivider
  className?: string
  /**
   * Flex cross-axis alignment for row siblings. When omitted, defaults to
   * `start` if any field uses `derivedMeta.reserveSpace`, else `control-edge`.
   */
  align?: FieldRowAlignment
  /** Trailing divider after this row within a group/stack rhythm. */
  separator?: FieldSeparator
  /** Shared container shell around the row's fields. Inherits cascade when omitted. */
  chrome?: FieldChrome
  /** When hidden, the whole row unmounts. */
  visibility?: FieldVisibility
  /**
   * Where visible field errors render — `auto` and `field` keep per-field copy
   * under each control; `row` surfaces a joined row summary instead.
   */
  errorPlacement?: 'auto' | 'field' | 'row'
}

/** Fields allowed inside a `group`, `dependent`, or column stack — may nest. */
export type GroupFieldItem =
  | FieldConfig
  | RowConfig
  | SlotConfig
  | GroupConfig
  | ColumnsConfig
  | DependentConfig
  | ArrayConfig

/** Decorative boundary for the dependents region. Legacy `'panel'` maps to the default nest. */
export type DependentChrome = 'none' | 'rail' | 'panel'

/**
 * Default controller-relative positioning for dependent regions.
 * @deprecated Nest geometry is owned by the default recipe — use `chrome: 'none'` to opt out.
 */
export const DEFAULT_DEPENDENT_INSET = true

/** Default decorative boundary for dependent regions. */
export const DEFAULT_DEPENDENT_CHROME: DependentChrome = 'rail'

export interface DependentDependentsConfig {
  fields: GroupFieldItem[]
  /**
   * Gates dependent fields: when false, dependents unmount and values clear.
   * When omitted and the controller is a switch, defaults to "switch is true".
   */
  visibility?: FieldVisibility
  /**
   * Legacy flush opt-out — maps to `chrome: 'none'` at render time.
   * @deprecated Use `chrome: 'none'` instead.
   */
  inset?: boolean
  /** Default dependent nest when omitted or `'rail'` / legacy `'panel'`. @default {@link DEFAULT_DEPENDENT_CHROME} */
  chrome?: DependentChrome
  /** Default leaf/row container treatment for nested fields. */
  fieldChrome?: FieldChrome
  /**
   * Legacy panel wash — ignored; `'panel'` maps to the default nest.
   * @deprecated
   */
  panel?: { surface?: SurfaceConfig; tone?: SemanticSurfaceTone }
  /**
   * Legacy scope split — ignored; the default nest always wraps dependents.
   * @deprecated
   */
  scope?: FieldDependentsScope
}

/**
 * Controller field plus gated dependents (`kind: 'dependent'`).
 *
 * Use `defineDependentField()` for completion.
 *
 * @example
 * defineDependentField({
 *   kind: 'dependent',
 *   controller: { type: 'switch', name: 'enabled', label: 'Custom rule' },
 *   dependents: {
 *     fields: [{ type: 'text', name: 'formula', label: 'Formula' }],
 *   },
 * })
 */
export interface DependentConfig {
  kind: 'dependent'
  controller: FieldConfig
  dependents: DependentDependentsConfig
  /** When set on a switch controller, turning off prompts before clearing dependents. */
  confirmBeforeClear?: ConfirmBeforeClearConfig
  visibility?: FieldVisibility
  /** Trailing divider after this dependent section within parent rhythm. */
  separator?: FieldSeparator
  className?: string
  /** Shared container around the controller + dependents stack. Inherits cascade when omitted. */
  chrome?: FieldChrome
  /** Optional DOM id on the dependent wrapper — for in-page scroll anchors. */
  id?: string
  /** Opt-in navigation metadata for sidebar / scroll-spy consumers. */
  navigation?: FormNavigationAnchor
}

/**
 * Named fieldset subsection (`kind: 'group'`).
 *
 * Common options: `legend`, `fields`, `density`, `chrome`, `disclosure`,
 * `description`, `headingScale`, `visibility`.
 * Use `defineGroupField()` for completion.
 *
 * @example
 * defineGroupField({
 *   kind: 'group',
 *   legend: 'Damage',
 *   fields: [
 *     { type: 'text', name: 'dice', label: 'Dice', required: true },
 *   ],
 * })
 */
export interface GroupConfig {
  kind: 'group'
  /** Preferred heading API — tier resolves from named-group nesting depth. */
  heading?: FormHeading
  /** When omitted, renders as a layout/visibility wrapper without a legend. */
  legend?: string
  description?: string
  /**
   * When `'field'`, legend and description use this group's field label and hint
   * type scale. When `'subsection'`, legend uses structural subsection type at
   * any depth. Omit for structural legend type from nesting depth. Typography
   * only — spacing, disclosure, and legend semantics stay unchanged. There is
   * no separate legend or description size.
   */
  headingScale?: GroupHeadingScale
  fields: GroupFieldItem[]
  className?: string
  /** Optional DOM id on the fieldset — for in-page scroll anchors. */
  id?: string
  /** Opt-in navigation metadata for sidebar / scroll-spy consumers. */
  navigation?: FormNavigationAnchor
  /**
   * Section density for this group subtree. Inherits parent density when omitted.
   */
  density?: FormDensity
  /** When hidden, the whole group unmounts and nested field values clear. */
  visibility?: FieldVisibility
  /**
   * Visual treatment for the legend + field stack — variants are mutually exclusive.
   * Shapes: `inset`, `panel`, `outline`, `divider`, `callout`, `accent`.
   * Tones vary by variant — see [containers.md](../../docs/forms/containers.md#group-chrome).
   */
  chrome?: FieldGroupChrome
  /**
   * Shared field-container override for this group’s fieldset (legend, description,
   * and field stack). Also cascades to descendants when the shared container is
   * opted out with `none`.
   */
  fieldChrome?: FieldChrome
  /**
   * Open/collapse and summary behavior for the group container.
   * `legend` — collapsible fieldset; `inline` — collapsed summary + in-place editor;
   * `dialog` — collapsed summary that opens the editor in a modal.
   */
  disclosure?: FieldGroupDisclosure
  /**
   * Object path for an optional nested group. Add opens local state and does not
   * write a value. Remove unsets this path. Requires `optionalDisclosure`.
   */
  name?: string
  /** Add/remove chrome for an optional object. Does not seed a value on open. */
  optionalDisclosure?: OptionalDisclosureConfig
  /** Trailing divider after this group within parent rhythm. */
  separator?: FieldSeparator
}

/**
 * One vertical stack in a `kind: 'columns'` layout.
 */
export interface FormColumnsColumn {
  fields: FormItem[]
}

/** Column width ratio at `md+` for two-column layouts. */
export type FormColumnsWidths = 'equal' | 'primary-detail'

/**
 * Multi-column layout (`kind: 'columns'`). Layout-only — no fieldset, no shared
 * field container. Each child remains a top-level chrome unit.
 *
 * Wide (`md+`): independent stacks. Narrow default: column 1 then column 2
 * (`collapseOrder: 'columns'`). `'interleave'` / tuples reorder DOM below `md`.
 *
 * Use `defineColumnsField()` for completion.
 *
 * @example
 * defineColumnsField({
 *   kind: 'columns',
 *   columns: [
 *     { fields: [{ type: 'text', name: 'title', label: 'Title' }] },
 *     { fields: [{ type: 'select', name: 'hitDie', label: 'Hit die', options: [] }] },
 *   ],
 * })
 */
export interface ColumnsConfig {
  kind: 'columns'
  /** At least two stacks. */
  columns: [FormColumnsColumn, FormColumnsColumn, ...FormColumnsColumn[]]
  /**
   * Collapsed reading order. Default `'columns'` (CSS-only). `'interleave'` and
   * tuples use a breakpoint so DOM order matches the single-column layout.
   */
  collapseOrder?: FormColumnsCollapseOrder
  /**
   * Column width ratio at `md+`. Default `'equal'`. `'primary-detail'` is `2fr` /
   * `minmax(18rem, 1fr)` — a primary stack with a supporting control.
   * Ignored when there are three or more columns.
   */
  widths?: FormColumnsWidths
  className?: string
  /** Optional DOM id on the columns wrapper — for in-page scroll anchors. */
  id?: string
  /** Trailing divider after this columns block within parent rhythm. */
  separator?: FieldSeparator
  /** When hidden, the whole columns block unmounts. */
  visibility?: FieldVisibility
}

/** Layout profile for repeatable array item chrome. */
export type ArrayItemVariant = 'auto' | 'compact' | 'detailed'

/** How array items may be reordered. Defaults to `dragHandle`. */
export type ArrayItemReorder = false | 'dragHandle'

/** Placement of the array add control relative to the section legend. */
export type ArrayAddActionLayout = 'stacked' | 'inline'

/** Context for mapping a row-level/cross-row issue to a focusable field name. */
export type ArrayErrorFocusContext = {
  issue: FormIssue
  itemIndex: number
  levelKeys?: { min: string; max: string }
}

/** Optional domain hooks for array validation navigation and severity. */
export type ArrayPatternConfig = {
  kind: string
  levelKeys?: { min: string; max: string }
  getErrorFocusTarget?: (ctx: ArrayErrorFocusContext) => string | undefined
  classifyIssueSeverity?: (issue: FormIssue) => FormIssueSeverity
  classifyIssueScope?: (issue: FormIssue) => FormIssueScope
} & Record<string, unknown>

/**
 * Per-item header chrome for detailed and compact array rows.
 *
 * Title resolution order: `primary` → `formatPrimary(primaryField)` → `primaryField`
 * raw value → `fallback(index)`. Use `primaryField` for a single watched column;
 * use `primary` when the label is derived from multiple fields or domain formatters.
 *
 * @see [Array field authoring guide](../../docs/forms/array-field-authoring.md)
 */
export interface ArrayItemHeaderConfig {
  /**
   * Relative field name watched for the primary label (e.g. `'name'`, `'path'`).
   * Prefer this over `primary` when one column drives the title.
   */
  primaryField?: string
  /** Optional formatter when `primaryField` is set. */
  formatPrimary?: (value: unknown, values: Record<string, unknown>) => string | undefined
  /**
   * Computed primary label; overrides `primaryField` when set.
   * Use for grant rows, tier summaries, or multi-field titles.
   */
  primary?: (values: Record<string, unknown>, index: number) => string | undefined
  /**
   * Fallback title when the primary is empty — also used for aria labels.
   * Required; typically `Item ${index + 1}` or a domain label like `Grant ${index + 1}`.
   */
  fallback: (index: number) => string
  /**
   * Shown on its own row below the header title on **detailed** items only.
   * Pair with `summaryDependsOn` when the summary reads root-level context.
   */
  summary?: (
    values: Record<string, unknown>,
    index: number,
    watchedContext?: Record<string, unknown>,
  ) => string
  /** Root-relative field paths whose values are passed as `watchedContext` to `summary`. */
  summaryDependsOn?: string[]
  /**
   * When true, appends ` · {fallback}` after the primary label in the header title.
   *
   * @default false — fallback still drives aria labels and empty-primary titles.
   */
  showFallbackInHeader?: boolean
  /** Renders a divider between primary and fallback when `showFallbackInHeader` is true. */
  showDivider?: boolean
  /** When true, primary label is visually hidden but available to assistive tech. */
  srOnly?: boolean
}

export type ArrayRelationshipAddAction = {
  /** Key in `RelationshipFieldProvider` registry. */
  vocabulary: string
  /** `one` replaces the field array on add. Default `many` appends. */
  cardinality?: 'one' | 'many'
}

export interface ArrayAddActionConfig {
  label?: string
  /** @default true */
  icon?: boolean
  /** @default `text` when `layout` is `inline`; otherwise `outline`. Legacy `ghost` inline maps to `text`. */
  variant?: NonNullable<ButtonVariantProps['variant']>
  layout?: ArrayAddActionLayout
  size?: NonNullable<ButtonVariantProps['size']>
  menu?: ArrayAddMenuConfig
  /**
   * When set, the add control opens the schema form relationship picker host for this
   * array path instead of appending a default row.
   */
  relationship?: ArrayRelationshipAddAction
  /**
   * When set, the add control invokes {@link ArrayAddActionInterceptProvider} instead
   * of appending a default row.
   */
  intercept?: string
}

/** Item-level header chrome visibility — mirrors {@link FieldLabelVisibility} naming. */
export type ArrayItemHeaderVisibility = 'auto' | 'hidden'

export interface ArrayItemConfig {
  variant?: ArrayItemVariant
  /** @default raised */
  surface?: SurfaceConfig
  tone?: SemanticSurfaceTone
  header?: ArrayItemHeaderConfig
  /**
   * Controls whether non-collapsible items render item-level header chrome.
   *
   * - `'auto'` — show a visible header when semantic identity requires one; field
   *   layout alone never implies a header.
   * - `'hidden'` — suppress item-level header chrome for anonymous stacked / unlabeled rows.
   *
   * Ignored (normalized to `'auto'`) when `collapsible` is true — disclosure requires
   * header anatomy.
   *
   * @default 'auto'
   */
  headerVisibility?: ArrayItemHeaderVisibility
  collapsible?: boolean
  collapseKey?: string
  /**
   * When true, items default collapsed even as the sole row, and append skips session
   * expand keys. Use for entity-card relationship rows that should stay summarized.
   *
   * @default false
   */
  defaultCollapsed?: boolean
  /**
   * When `collapsible` is true, gates disclosure per row. Omit for every row
   * collapsible when the array is collapsible.
   */
  resolveCollapsible?: (values: Record<string, unknown>, index: number) => boolean
  /** @default dragHandle */
  reorder?: ArrayItemReorder
  /** @default true */
  removable?: boolean
  removeSlot?: Pick<SlotConfig, 'name' | 'render' | 'visibility'>
  /**
   * Extra utility rendered immediately before the default remove button.
   * Remove stays last. Does not replace it.
   */
  beforeRemove?: Pick<SlotConfig, 'name' | 'render'>
  /**
   * Replace default ArrayItem card chrome with a custom shell (e.g. entity
   * EntityCardDisclosureRenderer). Form behavior stays array-owned; presentation does not.
   * Ignored for compact inline rows.
   */
  renderShell?: (props: ArrayItemShellRenderProps) => ReactNode
}

export type ArrayFilterSelectFn = (ctx: {
  arrayItems: unknown[]
  rowIndex: number
  fieldName: string
  options: FieldOption[]
  watchedValues: Record<string, unknown>
}) => FieldOption[]

export interface ArrayFilterSelectConfig {
  dependsOn?: string[]
  filter: ArrayFilterSelectFn
}

export type ArrayCanAppendResult = {
  enabled: boolean
  reason?: string
}

/**
 * Repeatable list section (`kind: 'array'`).
 *
 * @see [Array field authoring guide](../../docs/forms/array-field-authoring.md)
 *
 * @example
 * defineArrayField({
 *   kind: 'array',
 *   name: 'traits',
 *   label: 'Traits',
 *   addAction: { label: 'Add trait' },
 *   item: {
 *     header: { fallback: (i) => `Trait ${i + 1}`, primaryField: 'name' },
 *   },
 *   fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
 * })
 */
interface ArrayConfigCore {
  kind: 'array'
  name: string
  /**
   * Section density for this array subtree. Defaults to `compact` when omitted.
   */
  density?: FormDensity
  fields: FormItem[]
  addAction?: false | ArrayAddActionConfig
  min?: number
  max?: number
  item?: ArrayItemConfig
  visibility?: FieldVisibility
  arrayPattern?: ArrayPatternConfig
  appendDefaults?: (items: unknown[]) => Record<string, unknown>
  /**
   * RHF `useFieldArray` `keyName` when row values include a domain `id` (or other
   * key) that must not double as the synthetic row key. Defaults to RHF's `id`.
   */
  keyName?: string
  filterSelect?: ArrayFilterSelectConfig
  /** Empty list presentation. @default 'panel' */
  emptyState?: 'panel' | 'none'
  /** When append should stay visible but disabled (e.g. finite enum saturation). */
  resolveCanAppend?: (items: unknown[]) => ArrayCanAppendResult
  id?: string
  className?: string
  separator?: FieldSeparator
  /**
   * Shared field-container for the array fieldset (legend + list) and cascade for
   * descendants. Use `{ variant: 'none' }` to opt out.
   */
  fieldChrome?: FieldChrome
  errorPlacement?: 'auto' | 'field' | 'row'
}

/** Anonymous repeatable list — omit `label`, `hint`, and `labelVisibility`. */
type AnonymousArrayConfig = ArrayConfigCore & {
  label?: never
  hint?: never
  labelVisibility?: never
}

/** Named repeatable list — `hint` and `labelVisibility` require a non-whitespace `label`. */
type NamedArrayConfig = ArrayConfigCore & {
  label: string
  hint?: string | FieldHintConfig
  labelVisibility?: FieldLabelVisibility
}

export type ArrayConfig = AnonymousArrayConfig | NamedArrayConfig

/**
 * Custom field region rendered inside `FormProvider`. The slot `name` aligns with
 * a form value key managed by `render()` (via `useFormContext` / `useFieldArray`);
 * defaults are supplied through the form's `defaultValues`, not synthesized here.
 */
export interface SlotConfig {
  kind: 'slot'
  name: string
  /** Preferred leaf-tier heading API for the slot composite surface. */
  heading?: FormHeading
  /** @deprecated Use `heading.label`. */
  label?: string
  /** @deprecated Use `heading.hint`. */
  hint?: string
  /**
   * Width of the slot wrapper within a `kind: 'row'` — same tokens as leaf
   * `width`. Ignored outside a row.
   */
  width?: FieldWidth
  className?: string
  /** When hidden, the slot unmounts and any registered values clear with `shouldUnregister`. */
  visibility?: FieldVisibility
  render: () => ReactNode
  /** Trailing divider after this slot within a group/stack rhythm. */
  separator?: FieldSeparator
  /** Panel or outline shell around slot content. */
  chrome?: FieldChrome
}

/**
 * Any item allowed at the top level of a form's `fields` array (or a tab panel).
 *
 * Leaf fields (`FieldConfig`), horizontal rows (`kind: 'row'`), and containers
 * (`group`, `columns`, `dependent`, `array`, `slot`). Wrap trees with `defineForm()` or reusable
 * sections with `defineFormItems()` — plain arrays remain valid.
 */
export type FormItem =
  | FieldConfig
  | RowConfig
  | GroupConfig
  | ColumnsConfig
  | DependentConfig
  | ArrayConfig
  | SlotConfig
