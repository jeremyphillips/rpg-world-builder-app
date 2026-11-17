import type { OptionalDisclosureConfig, OptionalDisclosureIntent } from '../field-config'

export type OptionalDisclosureActionVerb = 'add' | 'edit' | 'clear'

export type ResolvedOptionalDisclosureActions = {
  collapsedLabel: string
  openLabel: string
  collapsedAccessibleName: string
  openAccessibleName: string
  collapsedAction: 'add' | 'edit'
  openAction: 'clear'
}

const COLLAPSED_VISIBLE = {
  add: 'Add',
  override: 'Override',
} as const satisfies Record<OptionalDisclosureIntent, string>

const OPEN_VISIBLE = {
  add: 'Remove',
  override: 'Clear override',
} as const satisfies Record<OptionalDisclosureIntent, string>

function collapsedAccessibleName(intent: OptionalDisclosureIntent, subject: string): string {
  return intent === 'add' ? `Add ${subject}` : `Override ${subject}`
}

function openAccessibleName(intent: OptionalDisclosureIntent, subject: string): string {
  return intent === 'add' ? `Remove ${subject}` : `Clear ${subject} override`
}

/**
 * Default disclosure actions from intent, the field or legend subject, and `labeled`.
 * Explicit labels replace both the visible string and the accessible name.
 * Does not read form state.
 */
export function resolveOptionalDisclosureActions(input: {
  intent: OptionalDisclosureIntent
  subject: string
  labeled?: boolean
  addLabel?: string
  removeLabel?: string
}): ResolvedOptionalDisclosureActions {
  const labeled = input.labeled === true
  const collapsedTemplate = collapsedAccessibleName(input.intent, input.subject)
  const openTemplate = openAccessibleName(input.intent, input.subject)

  return {
    collapsedLabel:
      input.addLabel ?? (labeled ? COLLAPSED_VISIBLE[input.intent] : collapsedTemplate),
    collapsedAccessibleName: input.addLabel ?? collapsedTemplate,
    openLabel: input.removeLabel ?? (labeled ? OPEN_VISIBLE[input.intent] : openTemplate),
    openAccessibleName: input.removeLabel ?? openTemplate,
    collapsedAction: input.intent === 'override' ? 'edit' : 'add',
    openAction: 'clear',
  }
}

export function resolveOptionalDisclosureSubject(
  displayLabel: string,
  disclosure: Pick<OptionalDisclosureConfig, 'actionSubject'>,
): string {
  return disclosure.actionSubject ?? displayLabel
}

export function optionalDisclosureLeafActions(config: {
  label: string
  optionalDisclosure: Pick<
    OptionalDisclosureConfig,
    'intent' | 'labeled' | 'actionSubject' | 'addLabel' | 'removeLabel'
  >
}): ResolvedOptionalDisclosureActions {
  const disclosure = config.optionalDisclosure
  return resolveOptionalDisclosureActions({
    intent: disclosure.intent,
    subject: resolveOptionalDisclosureSubject(config.label, disclosure),
    labeled: disclosure.labeled,
    addLabel: disclosure.addLabel,
    removeLabel: disclosure.removeLabel,
  })
}

/** Props the disclosure shells already render. Callers do not branch on intent. */
export function optionalDisclosureShellProps(actions: ResolvedOptionalDisclosureActions) {
  return {
    addLabel: actions.collapsedLabel,
    addAccessibleName: actions.collapsedAccessibleName,
    addAction: actions.collapsedAction,
    removeLabel: actions.openLabel,
    removeAccessibleName: actions.openAccessibleName,
    removeAction: actions.openAction,
  }
}
