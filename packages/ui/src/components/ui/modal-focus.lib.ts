/** Marks label info-tooltip triggers — skipped by modal open auto-focus. */
export const INFO_TOOLTIP_TRIGGER_SELECTOR = '[data-info-tooltip-trigger]'

/** Marks chrome that should not receive modal open auto-focus (e.g. dialog close). */
export const MODAL_SKIP_AUTOFOCUS_SELECTOR = '[data-modal-skip-autofocus]'

const MODAL_INITIAL_FOCUS_SELECTOR = [
  '[role="combobox"]',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'button:not([disabled])',
].join(', ')

export function shouldSkipModalAutoFocus(element: HTMLElement): boolean {
  return (
    element.matches(INFO_TOOLTIP_TRIGGER_SELECTOR) ||
    element.closest(INFO_TOOLTIP_TRIGGER_SELECTOR) !== null ||
    element.matches(MODAL_SKIP_AUTOFOCUS_SELECTOR) ||
    element.closest(MODAL_SKIP_AUTOFOCUS_SELECTOR) !== null
  )
}

/** Focus the first meaningful field inside a dialog, skipping info-tooltip triggers. */
export function focusModalInitialTarget(event: Event): void {
  event.preventDefault()
  const content = event.currentTarget as HTMLElement

  for (const candidate of content.querySelectorAll<HTMLElement>(MODAL_INITIAL_FOCUS_SELECTOR)) {
    if (shouldSkipModalAutoFocus(candidate)) {
      continue
    }

    candidate.focus()
    return
  }
}

export function handleModalOpenAutoFocus(
  event: Event,
  onOpenAutoFocus?: (event: Event) => void,
): void {
  onOpenAutoFocus?.(event)
  if (event.defaultPrevented) {
    return
  }

  focusModalInitialTarget(event)
}
