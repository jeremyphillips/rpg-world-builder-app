import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Modifier dimensions registered for the completeness guard (extended per migration phase). */
export type SemanticControlCssDimension = {
  /** BEM modifier prefix, e.g. `ui-button--` */
  modifierPrefix: string
  /** Declarations every modifier in this dimension must define (same keys). */
  requiredProperties: readonly string[]
}

export type SemanticControlCssRegistryEntry = {
  filePath: string
  dimensions: SemanticControlCssDimension[]
}

type ParsedRule = {
  selector: string
  properties: Set<string>
}

function parseCssRules(css: string): ParsedRule[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules: ParsedRule[] = []
  const blockRe = /([^{]+)\{([^}]*)\}/g

  for (const match of stripped.matchAll(blockRe)) {
    const selector = match[1]!.trim()
    const body = match[2]!
    const properties = new Set<string>()
    for (const decl of body.split(';')) {
      const prop = decl.trim().split(':')[0]?.trim()
      if (prop) properties.add(prop)
    }
    rules.push({ selector, properties })
  }

  return rules
}

function normalizeSelectorToken(token: string): string {
  return token.replace(/\\(.)/g, '$1')
}

function selectorTargetsModifier(selector: string, className: string): boolean {
  const normalizedClass = normalizeSelectorToken(className)
  return selector.split(',').some((part) => {
    const trimmed = normalizeSelectorToken(part.trim())
    if (trimmed === normalizedClass) return true
    if (trimmed.startsWith(`${normalizedClass}:`)) return true
    if (trimmed.startsWith(`${normalizedClass}[`)) return true
    return false
  })
}

function modifiersForDimension(rules: ParsedRule[], modifierPrefix: string) {
  const className = modifierPrefix.startsWith('.') ? modifierPrefix : `.${modifierPrefix}`
  return rules.filter(
    (rule) =>
      selectorTargetsModifier(rule.selector, className) &&
      rule.selector.split(',').some((part) => part.trim() === className),
  )
}

function compareModifierPropertySets(modifiers: ParsedRule[], filePath: string): string[] {
  if (modifiers.length < 2) return []

  const failures: string[] = []
  const reference = modifiers[0]!

  for (const rule of modifiers.slice(1)) {
    for (const prop of reference.properties) {
      if (!rule.properties.has(prop) && !prop.startsWith('--ui-')) {
        failures.push(
          `${filePath}: ${rule.selector} missing \`${prop}\` (see ${reference.selector})`,
        )
      }
    }
  }

  return failures
}

function missingRequiredProperties(
  modifiers: ParsedRule[],
  required: readonly string[],
  filePath: string,
): string[] {
  const failures: string[] = []
  const requiredSet = new Set(required)

  for (const rule of modifiers) {
    for (const prop of requiredSet) {
      if (!rule.properties.has(prop)) {
        failures.push(`${filePath}: ${rule.selector} missing required \`${prop}\``)
      }
    }
  }

  return failures
}

export function validateSemanticControlCssCompleteness(
  entry: SemanticControlCssRegistryEntry,
): string[] {
  const rules = parseCssRules(readFileSync(entry.filePath, 'utf8'))

  return entry.dimensions.flatMap((dimension) => {
    const modifiers = modifiersForDimension(rules, dimension.modifierPrefix)
    return [
      ...missingRequiredProperties(modifiers, dimension.requiredProperties, entry.filePath),
      ...compareModifierPropertySets(modifiers, entry.filePath),
    ]
  })
}

const stylesDir = path.dirname(fileURLToPath(import.meta.url))

const buttonCssPath = path.join(stylesDir, '../components/ui/button.css')

const fieldControlCssPath = path.join(stylesDir, '../components/ui/field-control.css')

const compactControlCssPath = path.join(stylesDir, '../components/ui/compact-control.css')

const fieldGroupCssPath = path.join(stylesDir, '../components/ui/field-group.css')

const choiceControlCssPath = path.join(stylesDir, '../components/ui/choice-control.css')

const BUTTON_APPEARANCE_MODIFIERS = [
  'primary',
  'destructive',
  'warning',
  'secondary',
  'outline',
  'ghost',
] as const

const BUTTON_LABELED_SIZE_MODIFIERS = [
  'xs',
  'xs-compact',
  'sm',
  'sm-compact',
  'md',
  'md-compact',
  'lg',
  'lg-compact',
] as const

const BUTTON_ICON_SIZE_MODIFIERS = ['icon-xs', 'icon-compact', 'icon-md', 'icon-lg'] as const

const BUTTON_APPEARANCE_REQUIRED = ['background-color', 'color'] as const
const BUTTON_LABELED_SIZE_REQUIRED = ['height', 'gap'] as const
const BUTTON_ICON_SIZE_REQUIRED = ['width', 'height'] as const

const FIELD_CONTROL_SIZE_MODIFIERS = ['sm', 'md', 'lg'] as const
const FIELD_CONTROL_MULTILINE_MODIFIERS = ['multiline-sm', 'multiline-md', 'multiline-lg'] as const
const FIELD_CONTROL_DIGITS_MODIFIERS = ['digits-sm', 'digits-md', 'digits-lg'] as const
const FIELD_CONTROL_FILTER_APPEARANCE_MODIFIERS = ['filter-outline', 'filter-ghost'] as const

const FIELD_CONTROL_SIZE_REQUIRED = [
  'height',
  'padding-inline',
  'padding-block',
  'font-size',
  'line-height',
] as const

const FIELD_CONTROL_MULTILINE_REQUIRED = [
  'min-height',
  'padding-inline',
  'padding-block',
  'font-size',
  'line-height',
] as const

const FIELD_CONTROL_DIGITS_REQUIRED = ['padding-inline-start', 'padding-inline-end'] as const

const FIELD_CONTROL_FILTER_APPEARANCE_REQUIRED = ['background-color', 'border-color'] as const

const FIELD_CONTROL_TRIGGER_FLOW_MODIFIERS = [
  'trigger-fill',
  'trigger-fit',
  'trigger-segment',
] as const

const FIELD_CONTROL_TRIGGER_FLOW_REQUIRED = ['width', 'flex-shrink'] as const

const FIELD_CONTROL_WIDTH_INTRINSIC_MODIFIERS = [
  'width-xs',
  'width-sm',
  'width-md',
  'width-lg',
  'width-xl',
] as const

const FIELD_CONTROL_WIDTH_INTRINSIC_REQUIRED = ['max-width', 'flex'] as const

const FIELD_CONTROL_WIDTH_AUTO_REQUIRED = ['width', 'flex'] as const

const FIELD_CONTROL_WIDTH_FULL_REQUIRED = ['width', 'flex'] as const

const FIELD_CONTROL_WIDTH_FRACTION_MODIFIERS = [
  'width-1/2',
  'width-1/3',
  'width-2/3',
  'width-1/4',
  'width-3/4',
] as const

const FIELD_CONTROL_WIDTH_FRACTION_REQUIRED = [
  'min-width',
  'max-width',
  'flex-basis',
  'flex-grow',
] as const

const COMPACT_CONTROL_ICON_MODIFIERS = [
  'icon-compact',
  'icon-compact-sm',
  'icon-xs',
  'icon-default',
  'icon-lg',
] as const

const COMPACT_CONTROL_STEPPER_MODIFIERS = [
  'stepper-button-xs',
  'stepper-button-sm',
  'stepper-button-md',
  'stepper-button-lg',
] as const

const COMPACT_CONTROL_ICON_REQUIRED = ['width', 'height'] as const

const COMPACT_CONTROL_STEPPER_REQUIRED = ['width', 'height'] as const

const FIELD_GROUP_SIZE_MODIFIERS = ['sm', 'md', 'lg'] as const

const FIELD_GROUP_SIZE_REQUIRED = [
  '--ui-field-group-height',
  '--ui-field-slot-ps-start',
  '--ui-field-slot-pe-end-content',
  '--ui-field-action-px',
  '--ui-field-caret-width',
] as const

const CHOICE_CONTROL_KIND_MODIFIERS = ['checkbox', 'radio'] as const

const CHOICE_CONTROL_SWITCH_MODIFIERS = ['switch'] as const

const CHOICE_CONTROL_INDICATOR_MODIFIERS = ['indicator-sm', 'indicator-lg'] as const

const CHOICE_CONTROL_KIND_REQUIRED = ['width', 'height', 'border-radius'] as const

const CHOICE_CONTROL_SWITCH_REQUIRED = ['width', 'height', 'border-radius'] as const

const CHOICE_CONTROL_INDICATOR_REQUIRED = ['width', 'height'] as const

/** Registry populated as component CSS ships (Button, field-control, …). */
export const SEMANTIC_CONTROL_CSS_REGISTRY: SemanticControlCssRegistryEntry[] = [
  {
    filePath: buttonCssPath,
    dimensions: [
      ...BUTTON_APPEARANCE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-button--${name}`,
        requiredProperties: BUTTON_APPEARANCE_REQUIRED,
      })),
      ...BUTTON_LABELED_SIZE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-button--${name}`,
        requiredProperties: BUTTON_LABELED_SIZE_REQUIRED,
      })),
      ...BUTTON_ICON_SIZE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-button--${name}`,
        requiredProperties: BUTTON_ICON_SIZE_REQUIRED,
      })),
    ],
  },
  {
    filePath: fieldControlCssPath,
    dimensions: [
      ...FIELD_CONTROL_SIZE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_SIZE_REQUIRED,
      })),
      ...FIELD_CONTROL_MULTILINE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_MULTILINE_REQUIRED,
      })),
      ...FIELD_CONTROL_DIGITS_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_DIGITS_REQUIRED,
      })),
      ...FIELD_CONTROL_FILTER_APPEARANCE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_FILTER_APPEARANCE_REQUIRED,
      })),
      ...FIELD_CONTROL_TRIGGER_FLOW_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_TRIGGER_FLOW_REQUIRED,
      })),
      ...FIELD_CONTROL_WIDTH_INTRINSIC_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_WIDTH_INTRINSIC_REQUIRED,
      })),
      {
        modifierPrefix: 'ui-field-control--width-auto',
        requiredProperties: FIELD_CONTROL_WIDTH_AUTO_REQUIRED,
      },
      {
        modifierPrefix: 'ui-field-control--width-full',
        requiredProperties: FIELD_CONTROL_WIDTH_FULL_REQUIRED,
      },
      ...FIELD_CONTROL_WIDTH_FRACTION_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-field-control--${name}`,
        requiredProperties: FIELD_CONTROL_WIDTH_FRACTION_REQUIRED,
      })),
    ],
  },
  {
    filePath: compactControlCssPath,
    dimensions: [
      ...COMPACT_CONTROL_ICON_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-compact-control--${name}`,
        requiredProperties: COMPACT_CONTROL_ICON_REQUIRED,
      })),
      ...COMPACT_CONTROL_STEPPER_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-compact-control--${name}`,
        requiredProperties: COMPACT_CONTROL_STEPPER_REQUIRED,
      })),
    ],
  },
  {
    filePath: fieldGroupCssPath,
    dimensions: FIELD_GROUP_SIZE_MODIFIERS.map((name) => ({
      modifierPrefix: `ui-field-group--${name}`,
      requiredProperties: FIELD_GROUP_SIZE_REQUIRED,
    })),
  },
  {
    filePath: choiceControlCssPath,
    dimensions: [
      ...CHOICE_CONTROL_KIND_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-choice-control--${name}`,
        requiredProperties: CHOICE_CONTROL_KIND_REQUIRED,
      })),
      ...CHOICE_CONTROL_SWITCH_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-choice-control--${name}`,
        requiredProperties: CHOICE_CONTROL_SWITCH_REQUIRED,
      })),
      ...CHOICE_CONTROL_INDICATOR_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-choice-control--${name}`,
        requiredProperties: CHOICE_CONTROL_INDICATOR_REQUIRED,
      })),
    ],
  },
]
