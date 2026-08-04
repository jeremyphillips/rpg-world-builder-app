/** Close the dialog first, then run post-close side effects (toast, selection sync). */
export function finalizeActionDialogClose(
  onOpenChange: (open: boolean) => void,
  sideEffects?: () => void,
): void {
  onOpenChange(false)

  if (!sideEffects) {
    return
  }

  queueMicrotask(() => {
    try {
      sideEffects()
    } catch {
      // Best-effort after close — must not fail the apply lifecycle.
    }
  })
}
