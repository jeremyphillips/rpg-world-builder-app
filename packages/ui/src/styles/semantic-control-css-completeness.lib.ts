import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { semanticCustomPropertyPrefix, type SemanticClassPrefix } from './semantic-class-prefix'

/** Modifier dimensions registered for the completeness guard (extended per migration phase). */
export type SemanticControlCssDimension = {
  /** BEM modifier prefix, e.g. `ui-button--` */
  modifierPrefix: string
  /** Declarations every modifier in this dimension must define (same keys). */
  requiredProperties: readonly string[]
  /** Match descendant selectors that begin with `.{modifierPrefix} `. */
  matchDescendantSelectors?: boolean
}

export type SemanticControlCssRegistryEntry = {
  filePath: string
  /**
   * Class prefix without the trailing hyphen. Custom properties
   * `--${classPrefix}-*` may differ across modifiers in one dimension.
   * @default 'ui'
   */
  classPrefix?: SemanticClassPrefix
  dimensions: SemanticControlCssDimension[]
}

type ParsedRule = {
  selector: string
  properties: Set<string>
}

function findMatchingBrace(css: string, openIndex: number): number {
  let depth = 0
  for (let i = openIndex; i < css.length; i++) {
    if (css[i] === '{') depth += 1
    else if (css[i] === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return css.length
}

function stripNestedBlocks(body: string): string {
  let result = ''
  let index = 0
  while (index < body.length) {
    const open = body.indexOf('{', index)
    if (open === -1) {
      result += body.slice(index)
      break
    }
    result += body.slice(index, open)
    index = findMatchingBrace(body, open) + 1
  }
  return result
}

function directProperties(body: string): Set<string> {
  const properties = new Set<string>()
  for (const decl of stripNestedBlocks(body).split(';')) {
    const trimmed = decl.trim()
    const colon = trimmed.indexOf(':')
    if (colon <= 0) continue
    const prop = trimmed.slice(0, colon).trim()
    if (prop && !prop.startsWith('@') && !prop.includes(' ')) properties.add(prop)
  }
  return properties
}

function collectRules(css: string, rules: ParsedRule[]) {
  let index = 0
  while (index < css.length) {
    const open = css.indexOf('{', index)
    if (open === -1) return
    const selector = css.slice(index, open).trim()
    const close = findMatchingBrace(css, open)
    const body = css.slice(open + 1, close)
    if (selector && !selector.startsWith('@')) {
      const properties = directProperties(body)
      if (properties.size > 0) rules.push({ selector, properties })
    }
    collectRules(body, rules)
    index = close + 1
  }
}

function parseCssRules(css: string): ParsedRule[] {
  const rules: ParsedRule[] = []
  collectRules(css.replace(/\/\*[\s\S]*?\*\//g, ''), rules)
  return rules
}

function normalizeSelectorToken(token: string): string {
  return token.replace(/\\(.)/g, '$1')
}

function isBareModifierPart(part: string, className: string): boolean {
  const trimmed = normalizeSelectorToken(part.trim())
  return trimmed === className || trimmed === `&${className}`
}

function modifiersForDimension(rules: ParsedRule[], dimension: SemanticControlCssDimension) {
  const className = dimension.modifierPrefix.startsWith('.')
    ? dimension.modifierPrefix
    : `.${dimension.modifierPrefix}`
  const matchDescendant = dimension.matchDescendantSelectors ?? false
  return rules.filter((rule) =>
    rule.selector.split(',').some((part) => {
      const trimmed = normalizeSelectorToken(part.trim())
      if (isBareModifierPart(trimmed, className)) return true
      if (matchDescendant && trimmed.startsWith(`${className} `)) return true
      return false
    }),
  )
}

function compareModifierPropertySets(
  modifiers: ParsedRule[],
  filePath: string,
  classPrefix: SemanticClassPrefix,
): string[] {
  if (modifiers.length < 2) return []

  const failures: string[] = []
  const reference = modifiers[0]!
  const customPropertyPrefix = semanticCustomPropertyPrefix(classPrefix)

  for (const rule of modifiers.slice(1)) {
    for (const prop of reference.properties) {
      if (!rule.properties.has(prop) && !prop.startsWith(customPropertyPrefix)) {
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

  const classPrefix = entry.classPrefix ?? 'ui'

  return entry.dimensions.flatMap((dimension) => {
    const modifiers = modifiersForDimension(rules, dimension)
    return [
      ...missingRequiredProperties(modifiers, dimension.requiredProperties, entry.filePath),
      ...compareModifierPropertySets(modifiers, entry.filePath, classPrefix),
    ]
  })
}

const stylesDir = path.dirname(fileURLToPath(import.meta.url))

const buttonCssPath = path.join(stylesDir, '../components/ui/button.css')

const fieldControlCssPath = path.join(stylesDir, '../components/ui/field-control.css')

const compactControlCssPath = path.join(stylesDir, '../components/ui/compact-control.css')

const fieldGroupCssPath = path.join(stylesDir, '../components/ui/field-group.css')

const fieldGroupChromeCssPath = path.join(stylesDir, '../components/ui/field-group-chrome.css')

const choiceControlCssPath = path.join(stylesDir, '../components/ui/choice-control.css')

const interactiveRowCssPath = path.join(stylesDir, '../components/ui/interactive-row.css')

const destinationListCssPath = path.join(stylesDir, '../components/ui/destination-list.css')

const interactiveListCssPath = path.join(stylesDir, '../components/ui/interactive-list.css')

const copyScaleCssPath = path.join(stylesDir, '../components/ui/copy-scale.css')

const alertCssPath = path.join(stylesDir, '../components/ui/alert.css')

const metadataListCssPath = path.join(stylesDir, '../components/ui/metadata-list.css')

const tabsCssPath = path.join(stylesDir, '../components/ui/tabs.css')

const popoverContentCssPath = path.join(stylesDir, '../components/ui/popover-content.css')

const pillCssPath = path.join(stylesDir, '../components/ui/pill.css')

const badgeCssPath = path.join(stylesDir, '../components/ui/badge.css')

const chipCssPath = path.join(stylesDir, '../components/ui/chip.css')

const cardCssPath = path.join(stylesDir, '../components/ui/card.css')

const radioCardCssPath = path.join(stylesDir, '../components/ui/ui-radio-card.css')

const identityFrameCssPath = path.join(stylesDir, '../components/ui/ui-identity-frame.css')

const insetPanelCssPath = path.join(stylesDir, '../components/ui/inset-panel.css')

const panelCssPath = path.join(stylesDir, '../components/ui/panel.css')

const avatarCssPath = path.join(stylesDir, '../components/ui/avatar.css')

const toastCssPath = path.join(stylesDir, '../components/ui/toast.css')

const semanticTextCssPath = path.join(stylesDir, '../components/ui/semantic-text/semantic-text.css')

const uiBorderCssPath = path.join(stylesDir, '../components/ui/ui-border.css')
const dialogPanelCssPath = path.join(stylesDir, '../components/ui/dialog-panel.css')

const BUTTON_APPEARANCE_MODIFIERS = [
  'primary',
  'destructive',
  'warning',
  'secondary',
  'outline',
  'ghost',
] as const

const BUTTON_LABELED_SIZE_MODIFIERS = ['xs', 'sm', 'md', 'lg'] as const

const BUTTON_ICON_SIZE_MODIFIERS = ['icon-xs', 'icon-md', 'icon-lg'] as const

const BUTTON_APPEARANCE_REQUIRED = ['background-color', 'color'] as const
const BUTTON_LABELED_SIZE_REQUIRED = ['height', 'gap'] as const
const BUTTON_ICON_SIZE_REQUIRED = ['width', 'height'] as const

const FIELD_CONTROL_SIZE_MODIFIERS = ['xs', 'sm', 'md', 'lg'] as const
const FIELD_CONTROL_MULTILINE_MODIFIERS = ['multiline-sm', 'multiline-md', 'multiline-lg'] as const
const FIELD_CONTROL_DIGITS_MODIFIERS = ['digits-xs', 'digits-sm', 'digits-md', 'digits-lg'] as const
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

const FIELD_GROUP_SIZE_MODIFIERS = ['xs', 'sm', 'md', 'lg'] as const

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

const INTERACTIVE_ROW_HOVER_MODIFIERS = ['hover-none', 'hover'] as const

const INTERACTIVE_ROW_SELECTED_MODIFIERS = [
  'selected-none',
  'selected-fill',
  'selected-bordered',
  'fill-surface',
  'emphasis-fill',
] as const

const INTERACTIVE_ROW_STATE_MODIFIERS = [
  'state-default',
  'state-inactive',
  'state-disabled',
] as const

const INTERACTIVE_ROW_DATA_MODIFIERS = ['data-none', 'data-selected', 'data-checked'] as const

const INTERACTIVE_ROW_HIT_MODIFIERS = ['hit-none', 'hit-pointer'] as const

const INTERACTIVE_LIST_DENSITY_MODIFIERS = ['compact', 'comfortable', 'spacious'] as const

const INTERACTIVE_LIST_DENSITY_GEOMETRY_OVERRIDES = ['compact', 'spacious'] as const

const DESTINATION_LIST_DENSITY_GEOMETRY_OVERRIDES = ['compact', 'spacious'] as const

const INTERACTIVE_LIST_PANEL_WIDTH_MODIFIERS = ['match', 'fit'] as const

const INTERACTIVE_ROW_HOVER_REQUIRED = ['--ui-row-bg-hover'] as const

const INTERACTIVE_ROW_SELECTED_REQUIRED = ['--ui-row-bg', '--ui-row-border'] as const

const INTERACTIVE_ROW_STATE_REQUIRED = [
  'opacity',
  'pointer-events',
  '--ui-row-border-style',
  '--ui-row-state-border',
] as const

const INTERACTIVE_ROW_DATA_REQUIRED = [
  '--ui-row-bg-data-selected',
  '--ui-row-bg-data-checked',
] as const

const INTERACTIVE_ROW_HIT_REQUIRED = ['cursor'] as const

const INTERACTIVE_LIST_DENSITY_GEOMETRY_REQUIRED = [
  'gap',
  'padding-inline',
  'padding-block',
] as const

const DESTINATION_LIST_DENSITY_GEOMETRY_REQUIRED = [
  '--ui-destination-inset-inline',
  '--ui-destination-inset-block',
] as const

const INTERACTIVE_LIST_PANEL_WIDTH_REQUIRED = ['width', 'min-width'] as const

/** Registry populated as component CSS ships (Button, field-control, …). */
export const SEMANTIC_CONTROL_CSS_REGISTRY: SemanticControlCssRegistryEntry[] = [
  {
    filePath: dialogPanelCssPath,
    dimensions: [
      ...(['background', 'card', 'surface-lift'] as const).map((fill) => ({
        modifierPrefix: `ui-dialog-panel--fill-${fill}`,
        requiredProperties: ['--surface-current', 'background-color', 'color'] as const,
      })),
      ...(['frame', 'side-right', 'side-left', 'side-bottom'] as const).map((geometry) => ({
        modifierPrefix: `ui-dialog-panel--${geometry}`,
        requiredProperties: [
          'border-style',
          'border-left-width',
          'border-right-width',
          'border-top-width',
          'border-bottom-width',
          'border-radius',
        ] as const,
      })),
    ],
  },
  {
    filePath: uiBorderCssPath,
    dimensions: [
      ...(['subtle', 'default', 'strong'] as const).map((strength) => ({
        modifierPrefix: `ui-border--${strength}`,
        requiredProperties: ['--ui-border-color', 'border-color'] as const,
      })),
    ],
  },
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
    filePath: fieldGroupChromeCssPath,
    dimensions: [
      ...(['rail-compact', 'rail-comfortable'] as const).map((name) => ({
        modifierPrefix: `ui-field-group-chrome--${name}`,
        requiredProperties: ['padding-inline-start'] as const,
      })),
      ...(['divider-top', 'divider-bottom'] as const).map((name) => ({
        modifierPrefix: `ui-field-group-chrome--${name}`,
        requiredProperties: [
          'border-top-width',
          'border-bottom-width',
          'padding-top',
          'padding-bottom',
        ] as const,
      })),
    ],
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
  {
    filePath: interactiveRowCssPath,
    dimensions: [
      ...INTERACTIVE_ROW_HOVER_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-interactive-row--${name}`,
        requiredProperties: INTERACTIVE_ROW_HOVER_REQUIRED,
      })),
      ...INTERACTIVE_ROW_SELECTED_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-interactive-row--${name}`,
        requiredProperties: INTERACTIVE_ROW_SELECTED_REQUIRED,
      })),
      ...INTERACTIVE_ROW_STATE_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-interactive-row--${name}`,
        requiredProperties: INTERACTIVE_ROW_STATE_REQUIRED,
      })),
      ...INTERACTIVE_ROW_DATA_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-interactive-row--${name}`,
        requiredProperties: INTERACTIVE_ROW_DATA_REQUIRED,
      })),
      ...INTERACTIVE_ROW_HIT_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-interactive-row--${name}`,
        requiredProperties: INTERACTIVE_ROW_HIT_REQUIRED,
      })),
    ],
  },
  {
    filePath: destinationListCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-destination-list',
        requiredProperties: DESTINATION_LIST_DENSITY_GEOMETRY_REQUIRED,
      },
      ...DESTINATION_LIST_DENSITY_GEOMETRY_OVERRIDES.map((name) => ({
        modifierPrefix: `ui-list--${name}.ui-destination-list`,
        requiredProperties: DESTINATION_LIST_DENSITY_GEOMETRY_REQUIRED,
      })),
    ],
  },
  {
    filePath: interactiveListCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-interactive-list__main',
        requiredProperties: INTERACTIVE_LIST_DENSITY_GEOMETRY_REQUIRED,
      },
      ...INTERACTIVE_LIST_DENSITY_GEOMETRY_OVERRIDES.map((name) => ({
        modifierPrefix: `ui-list--${name}.ui-interactive-list`,
        requiredProperties: INTERACTIVE_LIST_DENSITY_GEOMETRY_REQUIRED,
        matchDescendantSelectors: true,
      })),
      ...INTERACTIVE_LIST_PANEL_WIDTH_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-interactive-list__panel--${name}`,
        requiredProperties: INTERACTIVE_LIST_PANEL_WIDTH_REQUIRED,
      })),
    ],
  },
  {
    filePath: copyScaleCssPath,
    dimensions: [
      ...INTERACTIVE_LIST_DENSITY_MODIFIERS.map((name) => ({
        modifierPrefix: `ui-list--${name}`,
        requiredProperties: [
          '--ui-copy-title-size',
          '--ui-copy-supporting-size',
          '--ui-anatomy-leading-size',
        ] as const,
      })),
    ],
  },
  {
    filePath: radioCardCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-radio-card--comfortable',
        requiredProperties: ['gap'] as const,
      },
      {
        modifierPrefix: 'ui-radio-card--compact',
        requiredProperties: ['gap'] as const,
      },
    ],
  },
  {
    filePath: identityFrameCssPath,
    dimensions: [
      ...(['xs', 'sm', 'md', 'inline'] as const).map((size) => ({
        modifierPrefix: `ui-identity-frame--${size}`,
        requiredProperties: ['width', 'height'] as const,
      })),
    ],
  },
  {
    filePath: cardCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-card--compact',
        requiredProperties: ['--ui-card-inset-block', '--ui-card-inset-inline'],
      },
      {
        modifierPrefix: 'ui-card--comfortable',
        requiredProperties: ['--ui-card-inset-block', '--ui-card-inset-inline'],
      },
      {
        modifierPrefix: 'ui-card--spacious',
        requiredProperties: [
          '--ui-card-inset-block',
          '--ui-card-inset-inline',
          '--ui-card-title-size',
          '--ui-card-description-size',
        ],
      },
      {
        modifierPrefix: 'ui-card--static',
        requiredProperties: ['transition-property'],
      },
      {
        modifierPrefix: 'ui-card--interactive',
        requiredProperties: ['transition-property'],
      },
      {
        modifierPrefix: 'ui-card--disabled',
        requiredProperties: ['opacity', 'pointer-events'],
      },
    ],
  },
  {
    filePath: insetPanelCssPath,
    dimensions: [
      ...(['sm', 'md', 'lg'] as const).map((name) => ({
        modifierPrefix: `ui-inset-panel--${name}`,
        requiredProperties: ['border-radius', 'padding'] as const,
      })),
      ...(['solid', 'dashed'] as const).map((name) => ({
        modifierPrefix: `ui-inset-panel--${name}`,
        requiredProperties: ['border-style'] as const,
      })),
      ...(['align-start', 'align-center'] as const).map((name) => ({
        modifierPrefix: `ui-inset-panel--${name}`,
        requiredProperties: ['text-align'] as const,
      })),
    ],
  },
  {
    filePath: panelCssPath,
    dimensions: [
      ...(['transparent', 'quiet', 'subtle', 'strong', 'faint'] as const).map((tone) => ({
        modifierPrefix: `ui-panel--${tone}`,
        requiredProperties: ['background-color'] as const,
      })),
      {
        modifierPrefix: 'ui-panel--bleed',
        requiredProperties: ['padding-block', 'padding-inline'] as const,
      },
    ],
  },
  {
    filePath: alertCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-alert--default',
        requiredProperties: ['background-color', 'color'] as const,
      },
      ...(['info', 'success', 'warning', 'destructive'] as const).map((tone) => ({
        modifierPrefix: `ui-alert--${tone}`,
        requiredProperties: ['border-color', 'background-color', 'color'] as const,
      })),
      {
        modifierPrefix: 'ui-alert',
        requiredProperties: ['padding-block', 'padding-inline', 'gap'] as const,
      },
      {
        modifierPrefix: 'ui-alert__title',
        requiredProperties: ['font-weight', 'color'] as const,
      },
    ],
  },
  {
    filePath: metadataListCssPath,
    dimensions: [
      ...(['default', 'sm', 'xs'] as const).map((size) => ({
        modifierPrefix: `ui-metadata-list--${size}`,
        requiredProperties: ['font-size', 'line-height', 'row-gap'] as const,
      })),
      ...(['gap-md', 'gap-sm'] as const).map((gap) => ({
        modifierPrefix: `ui-metadata-list--${gap}`,
        requiredProperties: ['column-gap'] as const,
      })),
      {
        modifierPrefix: 'ui-metadata-list--row-gap-md',
        requiredProperties: ['row-gap'] as const,
      },
      ...(['track-content', 'track-fill'] as const).map((track) => ({
        modifierPrefix: `ui-metadata-list--${track}`,
        requiredProperties: ['grid-template-columns'] as const,
      })),
      ...(['emphasis-label', 'emphasis-value'] as const).map((emphasis) => ({
        modifierPrefix: `ui-metadata-list--${emphasis}`,
        requiredProperties: [
          '--ui-metadata-list-label-color',
          '--ui-metadata-list-value-color',
          '--ui-metadata-list-label-weight',
          '--ui-metadata-list-value-weight',
        ] as const,
      })),
      {
        modifierPrefix: 'ui-metadata-list--ruled',
        requiredProperties: [
          'border-bottom-width',
          'border-bottom-style',
          'padding-bottom',
        ] as const,
      },
    ],
  },
  {
    filePath: tabsCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-tabs__list--line',
        requiredProperties: ['display', 'border-bottom-width', 'border-bottom-style'] as const,
      },
      {
        modifierPrefix: 'ui-tabs__list--pill',
        requiredProperties: ['display', 'height', 'background-color', 'padding'] as const,
      },
      {
        modifierPrefix: 'ui-tabs__trigger--line',
        requiredProperties: ['display', 'height', 'padding-inline'] as const,
      },
      {
        modifierPrefix: 'ui-tabs__trigger--pill',
        requiredProperties: ['display', 'height', 'padding-inline', 'border-radius'] as const,
      },
      {
        modifierPrefix: 'ui-tabs__content',
        requiredProperties: ['margin-top'] as const,
      },
    ],
  },
  {
    filePath: popoverContentCssPath,
    dimensions: [
      ...(['menu', 'popover', 'tooltip', 'filter'] as const).map((tone) => ({
        modifierPrefix: `ui-popover-content--${tone}`,
        requiredProperties: ['background-color', 'padding'] as const,
      })),
    ],
  },
  {
    filePath: pillCssPath,
    dimensions: [
      {
        modifierPrefix: 'ui-pill',
        requiredProperties: [
          '--ui-pill-bg',
          '--ui-pill-fg',
          '--ui-pill-border',
          'background-color',
          'color',
          'border-color',
        ] as const,
      },
    ],
  },
  {
    filePath: badgeCssPath,
    dimensions: [
      ...(['sm', 'md', 'lg'] as const).map((name) => ({
        modifierPrefix: `ui-badge--${name}`,
        requiredProperties: ['height', 'padding-inline', 'font-size', 'line-height'] as const,
      })),
      ...(['outline', 'soft', 'strong'] as const).flatMap((appearance) =>
        (['neutral', 'info', 'success', 'warning', 'destructive'] as const).map((tone) => ({
          modifierPrefix: `ui-badge--${appearance}-${tone}`,
          requiredProperties: ['--ui-pill-bg', '--ui-pill-fg', '--ui-pill-border'] as const,
        })),
      ),
      {
        modifierPrefix: 'ui-badge--subdued',
        requiredProperties: ['--ui-pill-fg'] as const,
      },
      {
        modifierPrefix: 'ui-badge--counter',
        requiredProperties: [
          'min-width',
          'justify-content',
          'padding-inline',
          'font-variant-numeric',
          'line-height',
        ] as const,
      },
    ],
  },
  {
    filePath: chipCssPath,
    dimensions: [
      ...(['xs', 'sm', 'md', 'lg'] as const).map((name) => ({
        modifierPrefix: `ui-chip--${name}`,
        requiredProperties: ['height', 'padding-inline', 'font-size', 'line-height'] as const,
      })),
      {
        modifierPrefix: 'ui-chip--removable',
        requiredProperties: ['--ui-pill-bg', '--ui-pill-fg', '--ui-pill-border'] as const,
      },
      {
        modifierPrefix: 'ui-chip--selected',
        requiredProperties: ['border-color', 'background-color', 'color'] as const,
      },
      {
        modifierPrefix: 'ui-chip--interactive',
        requiredProperties: ['cursor'] as const,
      },
      {
        modifierPrefix: 'ui-chip--removable-xs',
        requiredProperties: ['padding-inline-end'] as const,
      },
      {
        modifierPrefix: 'ui-chip--removable-sm',
        requiredProperties: ['padding-inline-end'] as const,
      },
      {
        modifierPrefix: 'ui-chip--removable-md',
        requiredProperties: ['padding-inline-end'] as const,
      },
      {
        modifierPrefix: 'ui-chip--removable-lg',
        requiredProperties: ['padding-inline-end'] as const,
      },
    ],
  },
  {
    filePath: avatarCssPath,
    dimensions: [
      ...(['sm', 'md', 'lg'] as const).map((size) => ({
        modifierPrefix: `ui-avatar--${size}`,
        requiredProperties: ['width', 'height', 'font-size', 'line-height'] as const,
      })),
    ],
  },
  {
    filePath: toastCssPath,
    dimensions: [
      ...(['success', 'warning', 'destructive'] as const).map((tone) => ({
        modifierPrefix: `ui-toast--${tone}`,
        requiredProperties: ['border-color'] as const,
      })),
    ],
  },
  {
    filePath: semanticTextCssPath,
    dimensions: [
      ...(['neutral', 'info', 'success', 'warning', 'destructive'] as const).map((tone) => ({
        modifierPrefix: `ui-semantic-text--${tone}`,
        requiredProperties: ['color'] as const,
      })),
      ...(['low', 'medium', 'high'] as const).map((emphasis) => ({
        modifierPrefix: `ui-semantic-text--emphasis-${emphasis}`,
        requiredProperties: ['font-weight'] as const,
      })),
    ],
  },
]
