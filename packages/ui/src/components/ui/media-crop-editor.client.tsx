'use client'

import { useId, useRef, useState } from 'react'
import {
  resetFixedAspectCrop,
  type FixedAspectCropSpec,
  type NormalizedCrop,
  type NormalizedFocalPoint,
  type SourceDimensions,
} from '@rpg/contracts'
import { Button } from './button.client'
import { mediaCropStyles as styles } from './media-crop-editor.variants'

export type MediaCropEditorConstraint = {
  aspectRatio: number
  minWidthPx: number
  minHeightPx: number
  positionLabel: string
  instructions: string
  showPortraitPreviews: boolean
  spec: FixedAspectCropSpec
}

export type MediaCropEditorProps = {
  src: string
  source: SourceDimensions
  crop: NormalizedCrop
  onChange: (crop: NormalizedCrop) => void
  constraint: MediaCropEditorConstraint
  focalPoint?: NormalizedFocalPoint
  onFocalPointChange?: (focalPoint: NormalizedFocalPoint) => void
}

type FrameLayout = {
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
}

/** Matches uniform inset percentages in media-crop-editor.variants.ts aperture styles. */
const APERTURE_LAYOUT: FrameLayout = {
  scaleX: 0.75,
  scaleY: 0.75,
  offsetX: 12.5,
  offsetY: 12.5,
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type CropPreviewLayout = {
  widthPercent: number
  heightPercent: number
  leftPercent: number
  topPercent: number
}

/** Map a normalized crop to viewport percentages with uniform scale that fills the aperture. */
export function resolveCropPreviewLayout(
  aspectRatio: number,
  source: SourceDimensions,
  crop: NormalizedCrop,
  insets: FrameLayout = APERTURE_LAYOUT,
): CropPreviewLayout {
  const viewportHeight = 1 / aspectRatio
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  const apertureLeft = insets.offsetX / 100
  const apertureTop = insets.offsetY / 100
  const apertureWidth = insets.scaleX
  const apertureHeight = insets.scaleY / aspectRatio
  const scale = Math.max(apertureWidth / cropWidthPx, apertureHeight / cropHeightPx)
  const imageWidth = scale * source.width
  const imageHeight = scale * source.height

  return {
    widthPercent: imageWidth * 100,
    heightPercent: (imageHeight / viewportHeight) * 100,
    leftPercent: (apertureLeft - scale * crop.x * source.width) * 100,
    topPercent: (apertureTop - scale * crop.y * source.height * aspectRatio) * 100,
  }
}

/** Controlled normalized crop editor; original bytes and persistence remain caller-owned. */
// fallow-ignore-next-line complexity
export function MediaCropEditor({
  src,
  source,
  crop,
  onChange,
  constraint,
  focalPoint,
  onFocalPointChange,
}: MediaCropEditorProps) {
  const id = useId()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const drag = useRef<{ x: number; y: number; crop: NormalizedCrop } | null>(null)
  const focalDrag = useRef<{ crop: NormalizedCrop } | null>(null)
  const base = resetFixedAspectCrop(source, constraint.spec)
  const layout = APERTURE_LAYOUT
  const zoom = base.width / crop.width
  const maxZoom = Math.min(
    (base.width * source.width) / constraint.minWidthPx,
    (base.height * source.height) / constraint.minHeightPx,
  )

  function move(x: number, y: number) {
    onChange({
      ...crop,
      x: clamp(crop.x + x, 0, 1 - crop.width),
      y: clamp(crop.y + y, 0, 1 - crop.height),
    })
  }

  function changeZoom(value: number) {
    const nextZoom = Math.min(maxZoom, Math.max(1, value))
    const width = base.width / nextZoom
    const height = base.height / nextZoom
    onChange({
      width,
      height,
      x: clamp(crop.x + (crop.width - width) / 2, 0, 1 - width),
      y: clamp(crop.y + (crop.height - height) / 2, 0, 1 - height),
    })
  }

  const imageStyle = (insets: FrameLayout) => {
    const previewLayout = resolveCropPreviewLayout(constraint.aspectRatio, source, crop, insets)
    return {
      width: `${previewLayout.widthPercent}%`,
      height: `${previewLayout.heightPercent}%`,
      left: `${previewLayout.leftPercent}%`,
      top: `${previewLayout.topPercent}%`,
    }
  }

  return (
    <div className={styles.root()}>
      <div
        className={styles.viewport()}
        style={{ aspectRatio: constraint.aspectRatio }}
        role="group"
        aria-label={constraint.positionLabel}
        aria-describedby={`${id}-instructions`}
        tabIndex={0}
        onKeyDown={(event) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [crop.width / 50, 0],
            ArrowRight: [-crop.width / 50, 0],
            ArrowUp: [0, crop.height / 50],
            ArrowDown: [0, -crop.height / 50],
          }
          const delta = moves[event.key]
          if (delta) {
            event.preventDefault()
            move(...delta)
          }
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).dataset.focalHandle === 'true') return
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x: event.clientX, y: event.clientY, crop }
        }}
        onPointerUp={() => {
          drag.current = null
          focalDrag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
          focalDrag.current = null
        }}
        onPointerMove={(event) => {
          const focalStart = focalDrag.current
          if (focalStart && onFocalPointChange) {
            const rect = event.currentTarget.getBoundingClientRect()
            const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 1)
            const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 1)
            onFocalPointChange({
              x: clamp(
                focalStart.crop.x + relativeX * focalStart.crop.width,
                focalStart.crop.x,
                focalStart.crop.x + focalStart.crop.width,
              ),
              y: clamp(
                focalStart.crop.y + relativeY * focalStart.crop.height,
                focalStart.crop.y,
                focalStart.crop.y + focalStart.crop.height,
              ),
            })
            return
          }

          const start = drag.current
          if (!start) return
          const rect = event.currentTarget.getBoundingClientRect()
          const xSize = rect.width * layout.scaleX
          const ySize = rect.height * layout.scaleY
          if (!xSize || !ySize) return
          onChange({
            ...start.crop,
            x: clamp(
              start.crop.x - ((event.clientX - start.x) / xSize) * start.crop.width,
              0,
              1 - start.crop.width,
            ),
            y: clamp(
              start.crop.y - ((event.clientY - start.y) / ySize) * start.crop.height,
              0,
              1 - start.crop.height,
            ),
          })
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          key={attempt}
          onError={() => setFailed(true)}
          className={styles.image()}
          style={imageStyle(layout)}
        />
        <div className={styles.aperture()}>
          <div className={styles.guides()} />
          {focalPoint && onFocalPointChange && (
            <button
              type="button"
              data-focal-handle="true"
              aria-label="Focal point"
              className={styles.focalPoint()}
              style={{
                left: `${((focalPoint.x - crop.x) / crop.width) * 100}%`,
                top: `${((focalPoint.y - crop.y) / crop.height) * 100}%`,
              }}
              onPointerDown={(event) => {
                event.stopPropagation()
                event.currentTarget.setPointerCapture(event.pointerId)
                focalDrag.current = { crop }
              }}
            />
          )}
        </div>
      </div>
      {failed && (
        <p role="alert">
          Image preview could not be loaded.{' '}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFailed(false)
              setAttempt((value) => value + 1)
            }}
          >
            Retry preview
          </Button>
        </p>
      )}
      <p id={`${id}-instructions`} className={styles.label()}>
        {constraint.instructions}
      </p>
      <div className={styles.row()}>
        <Button
          type="button"
          variant="outline"
          aria-label="Zoom out"
          onClick={() => changeZoom(zoom - 0.1)}
        >
          −
        </Button>
        <label htmlFor={`${id}-zoom`}>Zoom</label>
        <input
          id={`${id}-zoom`}
          className={styles.slider()}
          type="range"
          min={1}
          max={maxZoom}
          step={0.01}
          value={zoom}
          onChange={(event) => changeZoom(Number(event.target.value))}
        />
        <output htmlFor={`${id}-zoom`}>{Math.round(zoom * 100)}%</output>
        <Button
          type="button"
          variant="outline"
          aria-label="Zoom in"
          onClick={() => changeZoom(zoom + 0.1)}
        >
          +
        </Button>
        <Button type="button" variant="outline" onClick={() => onChange(base)}>
          Reset crop
        </Button>
      </div>
      {constraint.showPortraitPreviews && (
        <div className={styles.previews()}>
          {[false, true].map((circle) => (
            <figure key={String(circle)}>
              <div className={styles.preview({ circle })}>
                <img
                  src={src}
                  alt=""
                  className={styles.image()}
                  style={imageStyle({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 })}
                />
              </div>
              <figcaption className={styles.label()}>
                {circle ? 'Circular avatar preview' : 'Square portrait'}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
