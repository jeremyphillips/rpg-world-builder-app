/** Monotonic generation; stale invalid-submit focus callbacks compare before focusing. */
let invalidSubmitFocusGeneration = 0

export function beginInvalidSubmitFocusRequest(): number {
  invalidSubmitFocusGeneration += 1
  return invalidSubmitFocusGeneration
}

export function cancelPendingInvalidSubmitFocus(): void {
  invalidSubmitFocusGeneration += 1
}

export function isInvalidSubmitFocusRequestCurrent(generation: number): boolean {
  return generation === invalidSubmitFocusGeneration
}
