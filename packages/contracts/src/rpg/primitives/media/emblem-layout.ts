import type { SourceDimensions } from './geometry'
import { getMediaRenditionPresetConfig } from './rendition-preset'
import type { ContainPresentation } from './image-presentation'

export type EmblemOffset = {
  x: number
  y: number
}

export type EmblemLayoutMetrics = {
  renderedWidth: number
  renderedHeight: number
  left: number
  top: number
  maxTranslationX: number
  maxTranslationY: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function resolveEmblemCanvasSize(): number {
  const preset = getMediaRenditionPresetConfig('emblem')
  return 'width' in preset ? preset.width : preset.maxWidth
}

/** Clamp normalized offset so artwork stays fully visible; zero-travel axes resolve to 0. */
export function clampEmblemOffset(
  offset: EmblemOffset,
  maxTranslationX: number,
  maxTranslationY: number,
): EmblemOffset {
  return {
    x: maxTranslationX > 0 ? clamp(offset.x, -1, 1) : 0,
    y: maxTranslationY > 0 ? clamp(offset.y, -1, 1) : 0,
  }
}

export function resolveEmblemLayoutMetrics(input: {
  source: SourceDimensions
  canvasSize: number
  layout: Pick<ContainPresentation, 'scale' | 'offset'>
}): EmblemLayoutMetrics {
  const { source, canvasSize, layout } = input
  const containScale = Math.min(canvasSize / source.width, canvasSize / source.height)
  const renderedWidth = Math.max(1, Math.round(source.width * containScale * layout.scale))
  const renderedHeight = Math.max(1, Math.round(source.height * containScale * layout.scale))
  const maxTranslationX = Math.max(0, (canvasSize - renderedWidth) / 2)
  const maxTranslationY = Math.max(0, (canvasSize - renderedHeight) / 2)
  const offset = clampEmblemOffset(
    layout.offset ?? { x: 0, y: 0 },
    maxTranslationX,
    maxTranslationY,
  )

  return {
    renderedWidth,
    renderedHeight,
    left: Math.round(maxTranslationX + offset.x * maxTranslationX),
    top: Math.round(maxTranslationY + offset.y * maxTranslationY),
    maxTranslationX,
    maxTranslationY,
  }
}

/** Drop zero-travel axes and omit offset when centered. */
export function canonicalizeEmblemPresentation(
  source: SourceDimensions,
  layout: ContainPresentation,
  canvasSize = resolveEmblemCanvasSize(),
): ContainPresentation {
  const { maxTranslationX, maxTranslationY } = resolveEmblemLayoutMetrics({
    source,
    canvasSize,
    layout: { scale: layout.scale, offset: layout.offset },
  })
  const offset = clampEmblemOffset(
    layout.offset ?? { x: 0, y: 0 },
    maxTranslationX,
    maxTranslationY,
  )

  if (offset.x === 0 && offset.y === 0) {
    return { mode: 'contain', scale: layout.scale }
  }

  return { mode: 'contain', scale: layout.scale, offset }
}

export function isDefaultEmblemPresentation(layout: ContainPresentation): boolean {
  return layout.mode === 'contain' && layout.scale === 1 && !layout.offset
}

export function isEmblemCentered(layout: ContainPresentation): boolean {
  return !layout.offset || (layout.offset.x === 0 && layout.offset.y === 0)
}
