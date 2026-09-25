import { resolveEmblemCanvasSize, type EmblemOffset } from '@rpg/contracts'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Convert pointer delta in viewport pixels to a normalized emblem offset update. */
export function resolveOffsetFromDragDelta(input: {
  startOffset: EmblemOffset
  deltaX: number
  deltaY: number
  maxTranslationX: number
  maxTranslationY: number
  viewportSize: number
}): EmblemOffset {
  const canvasScale = resolveEmblemCanvasSize() / input.viewportSize

  return {
    x:
      input.maxTranslationX > 0
        ? clamp(input.startOffset.x + (input.deltaX * canvasScale) / input.maxTranslationX, -1, 1)
        : 0,
    y:
      input.maxTranslationY > 0
        ? clamp(input.startOffset.y + (input.deltaY * canvasScale) / input.maxTranslationY, -1, 1)
        : 0,
  }
}
