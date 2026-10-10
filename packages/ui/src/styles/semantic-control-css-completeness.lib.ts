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

function selectorTargetsModifier(selector: string, className: string): boolean {
  return selector.split(',').some((part) => {
    const trimmed = part.trim()
    if (trimmed === className) return true
    if (trimmed.startsWith(`${className}:`)) return true
    if (trimmed.startsWith(`${className}[`)) return true
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

const buttonCssPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../components/ui/button.css',
)

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
]
