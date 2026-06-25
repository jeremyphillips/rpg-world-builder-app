import type {
  RichTextLinkPickerInternalOption,
  RichTextLinkPickerValue,
  RichTextLinkTab,
} from './rich-text-link-picker.types'

export interface LinkPickerFormState {
  tab: RichTextLinkTab
  searchQuery: string
  contentType: string
  selectedOptionId: string | null
  internalDisplayText: string
  internalOpenInNewWindow: boolean
  externalHref: string
  externalDisplayText: string
  externalOpenInNewWindow: boolean
}

export function filterInternalLinkOptions(
  internalOptions: RichTextLinkPickerInternalOption[],
  contentType: string,
  searchQuery: string,
): RichTextLinkPickerInternalOption[] {
  const query = searchQuery.trim().toLowerCase()
  return internalOptions.filter((option) => {
    if (option.contentType !== contentType) return false
    if (!query) return true
    return [option.title, option.sourceLabel, option.href].some((value) =>
      value?.toLowerCase().includes(query),
    )
  })
}

export function findInitialInternalOption(
  initialValue: Partial<RichTextLinkPickerValue> | undefined,
  internalOptions: RichTextLinkPickerInternalOption[],
  contentType: string,
): RichTextLinkPickerInternalOption | null {
  return (
    internalOptions.find((option) =>
      matchesInitialInternalOption(option, initialValue, contentType),
    ) ?? null
  )
}

function matchesInitialInternalOption(
  option: RichTextLinkPickerInternalOption,
  initialValue: Partial<RichTextLinkPickerValue> | undefined,
  contentType: string,
): boolean {
  if (
    initialValue?.metadata?.contentId &&
    option.id === initialValue.metadata.contentId &&
    option.contentType === contentType
  ) {
    return true
  }

  return initialValue?.href ? option.href === initialValue.href : false
}

function resolveInternalDisplayText(
  initialValue: Partial<RichTextLinkPickerValue> | undefined,
  selectedOption: RichTextLinkPickerInternalOption | null,
): string {
  if (initialValue?.displayText) return initialValue.displayText
  if (selectedOption?.title) return selectedOption.title
  return initialValue?.metadata?.contentTitle ?? ''
}

function resolveExternalTabFields(
  initialValue: Partial<RichTextLinkPickerValue> | undefined,
  tab: RichTextLinkTab,
): Pick<LinkPickerFormState, 'externalHref' | 'externalDisplayText' | 'externalOpenInNewWindow'> {
  if (tab !== 'external') {
    return {
      externalHref: '',
      externalDisplayText: '',
      externalOpenInNewWindow: true,
    }
  }

  return {
    externalHref: initialValue?.href ?? '',
    externalDisplayText: initialValue?.displayText ?? '',
    externalOpenInNewWindow: initialValue?.openInNewWindow ?? true,
  }
}

export function resolveLinkPickerFormState(
  initialValue: Partial<RichTextLinkPickerValue> | undefined,
  internalOptions: RichTextLinkPickerInternalOption[],
  defaultContentType: string,
): LinkPickerFormState {
  const tab: RichTextLinkTab = initialValue?.mode ?? 'internal'
  const contentType = initialValue?.metadata?.contentType ?? defaultContentType
  const selectedOption = findInitialInternalOption(initialValue, internalOptions, contentType)

  return {
    tab,
    searchQuery: '',
    contentType,
    selectedOptionId: selectedOption?.id ?? null,
    internalDisplayText: resolveInternalDisplayText(initialValue, selectedOption),
    internalOpenInNewWindow: initialValue?.openInNewWindow ?? false,
    ...resolveExternalTabFields(initialValue, tab),
  }
}

export function buildInternalLinkPickerValue(
  selectedOption: RichTextLinkPickerInternalOption,
  displayText: string,
  openInNewWindow: boolean,
): RichTextLinkPickerValue {
  return {
    mode: 'internal',
    href: selectedOption.href,
    displayText: displayText.trim(),
    openInNewWindow,
    metadata: {
      contentType: selectedOption.contentType,
      contentId: selectedOption.id,
      contentTitle: selectedOption.title,
      linkKind: selectedOption.kind,
    },
  }
}

export function buildExternalLinkPickerValue(
  href: string,
  displayText: string,
  openInNewWindow: boolean,
): RichTextLinkPickerValue {
  return {
    mode: 'external',
    href: href.trim(),
    displayText: displayText.trim(),
    openInNewWindow,
    metadata: { linkKind: 'external' },
  }
}

export function isLinkPickerInsertDisabled(
  tab: RichTextLinkTab,
  selectedInternalOption: RichTextLinkPickerInternalOption | null,
  internalDisplayText: string,
  externalHref: string,
  externalDisplayText: string,
): boolean {
  if (tab === 'internal') {
    return !selectedInternalOption || internalDisplayText.trim().length === 0
  }

  return externalHref.trim().length === 0 || externalDisplayText.trim().length === 0
}
