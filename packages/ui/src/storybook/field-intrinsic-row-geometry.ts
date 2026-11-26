const DEFAULT_TOLERANCE_PX = 2

export type FieldIntrinsicRowGeometryReport = {
  participant: HTMLElement
  participantWidth: number
  labelWidth: number
  hintWidth: number
  controlWidth: number
  issues: string[]
}

function rectWidth(el: HTMLElement | null | undefined): number {
  return el ? el.getBoundingClientRect().width : 0
}

type IntrinsicRowElements = {
  labelSizing: Element | null
  hint: HTMLElement | null
  control: HTMLElement | null
}

function readIntrinsicRowElements(participant: HTMLElement): IntrinsicRowElements {
  const hintNode =
    participant.querySelector('[data-field-intrinsic-spill] [id$="-hint"]') ??
    participant.querySelector('[id$="-hint"]')
  const controlRegion = participant.querySelector('[data-field-control-region]')
  const controlNode =
    controlRegion?.querySelector('input, select, button, [role="combobox"]') ?? controlRegion

  return {
    labelSizing: participant.querySelector('[data-field-intrinsic-sizing]'),
    hint: hintNode instanceof HTMLElement ? hintNode : null,
    control: controlNode instanceof HTMLElement ? controlNode : null,
  }
}

function appendHintWrapIssues(
  issues: string[],
  hint: HTMLElement,
  hintWidth: number,
  participantWidth: number,
): void {
  const hasCopy = Boolean(hint.textContent?.trim())
  if (!hasCopy) return

  if (hintWidth <= 0) {
    issues.push('hint width is zero')
    return
  }
  if (hintWidth > participantWidth + DEFAULT_TOLERANCE_PX) {
    issues.push(
      `hint width ${hintWidth.toFixed(1)}px exceeds participant ${participantWidth.toFixed(1)}px`,
    )
  }
  if (hint.scrollWidth > hint.clientWidth + DEFAULT_TOLERANCE_PX) {
    issues.push('hint text overflows without wrapping')
  }
}

/** Measures one auto row participant; returns issues (empty when invariants hold). */
export function measureFieldIntrinsicRowParticipant(
  participant: HTMLElement,
): FieldIntrinsicRowGeometryReport {
  const issues: string[] = []
  const { labelSizing, hint, control } = readIntrinsicRowElements(participant)

  const participantWidth = rectWidth(participant)
  const labelWidth = rectWidth(
    (labelSizing as HTMLElement | null) ?? participant.querySelector('[data-field-label-region]'),
  )
  const hintWidth = rectWidth(hint)
  const controlWidth = rectWidth(control)

  if (labelSizing && labelWidth <= 0) {
    issues.push('visible label sizing width is zero')
  }
  if (controlWidth <= 0) {
    issues.push('control width is zero')
  }
  if (hint) {
    appendHintWrapIssues(issues, hint, hintWidth, participantWidth)
  }

  return {
    participant,
    participantWidth,
    labelWidth,
    hintWidth,
    controlWidth,
    issues,
  }
}

export async function waitForFieldIntrinsicLayout(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

export async function assertFieldIntrinsicRowParticipant(
  participant: HTMLElement,
): Promise<FieldIntrinsicRowGeometryReport> {
  await waitForFieldIntrinsicLayout()
  const report = measureFieldIntrinsicRowParticipant(participant)
  if (report.issues.length > 0) {
    throw new Error(report.issues.join('; '))
  }
  return report
}

export function participantWidthDelta(
  withHint: HTMLElement,
  withoutHint: HTMLElement,
  tolerance = DEFAULT_TOLERANCE_PX,
): number {
  return Math.abs(
    withHint.getBoundingClientRect().width - withoutHint.getBoundingClientRect().width,
  )
}
