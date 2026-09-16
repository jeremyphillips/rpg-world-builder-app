/**
 * DOM probes for the Phase 0 shared-track prototype.
 * Used by Storybook harnesses and vitest mount tests.
 */

export type AnatomyTrackProbe = {
  controlTop: number | null
  gripCenterY: number | null
  actionsCenterY: number | null
}

export function queryControlRegionTop(fieldId: string): number | null {
  const input = document.getElementById(fieldId)
  return queryControlRegionTopFromNode(input)
}

/** Resolves the control-region top edge from any descendant of a field anatomy root. */
export function queryControlRegionTopFromNode(node: Element | null | undefined): number | null {
  const control = node
    ?.closest('[data-field-anatomy]')
    ?.querySelector('[data-field-control-region]')
  if (!control) return null
  return Math.round(control.getBoundingClientRect().top)
}

/** Resolves control-region top via a registered RHF control `name` attribute. */
export function queryControlTopByFieldName(name: string): number | null {
  const named = document.querySelector(`[name="${name}"]`)
  return queryControlRegionTopFromNode(named)
}

export function queryChromeCenterY(selector: string): number | null {
  const node = document.querySelector(selector)
  if (!node) return null
  const rect = node.getBoundingClientRect()
  return Math.round(rect.top + rect.height / 2)
}

const DEFAULT_GRIP_SELECTOR = '[data-array-item-anatomy-grip] button'
const DEFAULT_ACTIONS_SELECTOR = '[data-array-item-anatomy-actions] button'

export function readAnatomyTrackProbe(options: {
  controlFieldId: string
  gripSelector?: string
  actionsSelector?: string
}): AnatomyTrackProbe {
  return {
    controlTop: queryControlRegionTop(options.controlFieldId),
    gripCenterY: queryChromeCenterY(options.gripSelector ?? DEFAULT_GRIP_SELECTOR),
    actionsCenterY: queryChromeCenterY(options.actionsSelector ?? DEFAULT_ACTIONS_SELECTOR),
  }
}

/** Chrome is container-centered when its vertical center matches the anatomy grid center. */
export function isChromeAlignedToContainerCenter(
  gridCenterY: number | null,
  probe: Pick<AnatomyTrackProbe, 'gripCenterY' | 'actionsCenterY'>,
  tolerancePx = 6,
): boolean {
  if (gridCenterY == null) return false

  const gripOk =
    probe.gripCenterY == null || Math.abs(probe.gripCenterY - gridCenterY) <= tolerancePx
  const actionsOk =
    probe.actionsCenterY == null || Math.abs(probe.actionsCenterY - gridCenterY) <= tolerancePx

  return gripOk && actionsOk
}

export function chromeContainerVerticalDelta(
  gridCenterY: number | null,
  probe: Pick<AnatomyTrackProbe, 'gripCenterY' | 'actionsCenterY'>,
): {
  gripDelta: number | null
  actionsDelta: number | null
} {
  if (gridCenterY == null) {
    return { gripDelta: null, actionsDelta: null }
  }

  return {
    gripDelta: probe.gripCenterY == null ? null : probe.gripCenterY - gridCenterY,
    actionsDelta: probe.actionsCenterY == null ? null : probe.actionsCenterY - gridCenterY,
  }
}

/** Chrome is control-track anchored when its vertical center is near the control region top + half band. */
export function isChromeAlignedToControlTrack(
  probe: AnatomyTrackProbe,
  /** Expected single-line control band height at md — 36px (`min-h-9`). */
  controlBandHeight = 36,
  tolerancePx = 6,
): boolean {
  const { controlTop, gripCenterY, actionsCenterY } = probe
  if (controlTop == null) return false

  const expectedCenterY = controlTop + controlBandHeight / 2
  const gripOk = gripCenterY == null || Math.abs(gripCenterY - expectedCenterY) <= tolerancePx
  const actionsOk =
    actionsCenterY == null || Math.abs(actionsCenterY - expectedCenterY) <= tolerancePx

  return gripOk && actionsOk
}

export function chromeVerticalDelta(probe: AnatomyTrackProbe): {
  gripDelta: number | null
  actionsDelta: number | null
} {
  const { controlTop, gripCenterY, actionsCenterY } = probe
  if (controlTop == null) {
    return { gripDelta: null, actionsDelta: null }
  }

  return {
    gripDelta: gripCenterY == null ? null : gripCenterY - controlTop,
    actionsDelta: actionsCenterY == null ? null : actionsCenterY - controlTop,
  }
}
