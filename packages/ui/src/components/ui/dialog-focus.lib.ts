/** Opt-in marker for a single intentional open-focus target inside a dialog panel. */
export const DIALOG_INITIAL_FOCUS_SELECTOR = '[data-dialog-initial-focus]'

export function isDialogFocusTarget(element: HTMLElement): boolean {
  return (
    !element.hasAttribute('disabled') &&
    element.getAttribute('aria-hidden') !== 'true' &&
    !element.hidden &&
    element.tabIndex >= 0
  )
}

export function focusDialogInitialTarget(event: Event): void {
  event.preventDefault()
  const panel = event.currentTarget as HTMLElement
  const explicit = panel.querySelector<HTMLElement>(DIALOG_INITIAL_FOCUS_SELECTOR)
  const target = explicit && isDialogFocusTarget(explicit) ? explicit : panel
  target.focus()
}

export function handleDialogOpenAutoFocus(
  event: Event,
  onOpenAutoFocus?: (event: Event) => void,
): void {
  onOpenAutoFocus?.(event)
  if (!event.defaultPrevented) {
    focusDialogInitialTarget(event)
  }
}
