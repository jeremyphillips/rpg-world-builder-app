'use client'

import { useId, useRef, useState } from 'react'
import {
  CONTENT_MEDIA_BANNER_ASPECT_RATIO,
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX,
  resetBannerCrop,
  resetPortraitCrop,
  resetPrimaryCrop,
  type NormalizedCrop,
  type NormalizedFocalPoint,
  type SourceDimensions,
} from '@rpg/contracts'
import { Button } from './button.client'
import { mediaCropStyles as styles } from './media-crop-editor.variants'

export type MediaCropEditorFrame = 'square' | 'banner' | 'free'

export type MediaCropEditorProps = {
  src: string
  source: SourceDimensions
  crop: NormalizedCrop
  onChange: (crop: NormalizedCrop) => void
  frame?: MediaCropEditorFrame
  focalPoint?: NormalizedFocalPoint
  onFocalPointChange?: (focalPoint: NormalizedFocalPoint) => void
}

const APERTURE_FRACTION = 0.75
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function defaultCropForFrame(
  frame: MediaCropEditorFrame,
  source: SourceDimensions,
): NormalizedCrop {
  if (frame === 'banner') return resetBannerCrop(source)
  if (frame === 'free') return resetPrimaryCrop()
  return resetPortraitCrop(source)
}

function minEdgePxForFrame(frame: MediaCropEditorFrame): number {
  if (frame === 'free') return CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX
  return CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX
}

/** Controlled normalized crop editor; original bytes and persistence remain caller-owned. */
// fallow-ignore-next-line complexity
export function MediaCropEditor({
  src,
  source,
  crop,
  onChange,
  frame = 'square',
  focalPoint,
  onFocalPointChange,
}: MediaCropEditorProps) {
  const id = useId()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const drag = useRef<{ x: number; y: number; crop: NormalizedCrop } | null>(null)
  const focalDrag = useRef<{ crop: NormalizedCrop } | null>(null)
  const base = defaultCropForFrame(frame, source)
  const zoom = base.width / crop.width
  const minEdge = minEdgePxForFrame(frame)
  const maxZoom =
    frame === 'banner'
      ? Math.min(
          source.width / (CONTENT_MEDIA_BANNER_ASPECT_RATIO * minEdge),
          source.height / minEdge,
        )
      : Math.min(source.width, source.height) / minEdge

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
    const height =
      frame === 'banner' ? width / CONTENT_MEDIA_BANNER_ASPECT_RATIO : base.height / nextZoom
    onChange({
      width,
      height,
      x: clamp(crop.x + (crop.width - width) / 2, 0, 1 - width),
      y: clamp(crop.y + (crop.height - height) / 2, 0, 1 - height),
    })
  }

  function changeFreeDimension(axis: 'width' | 'height', value: number) {
    const next = { ...crop, [axis]: value }
    next.x = clamp(next.x, 0, 1 - next.width)
    next.y = clamp(next.y, 0, 1 - next.height)
    onChange(next)
  }

  const imageStyle = (scale: number, offset: number) => ({
    width: `${(100 * scale) / crop.width}%`,
    height: `${(100 * scale) / crop.height}%`,
    left: `${offset - (100 * scale * crop.x) / crop.width}%`,
    top: `${offset - (100 * scale * crop.y) / crop.height}%`,
  })

  const frameLabel =
    frame === 'banner'
      ? 'Banner crop position'
      : frame === 'free'
        ? 'Primary crop position'
        : 'Portrait crop position'

  return (
    <div className={styles.root()}>
      <div
        className={styles.viewport({ frame })}
        role="group"
        aria-label={frameLabel}
        aria-describedby={`${id}-instructions`}
        tabIndex={0}
        onKeyDown={(event) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-crop.width / 50, 0],
            ArrowRight: [crop.width / 50, 0],
            ArrowUp: [0, -crop.height / 50],
            ArrowDown: [0, crop.height / 50],
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
          const size = event.currentTarget.getBoundingClientRect().width * APERTURE_FRACTION
          if (!size) return
          onChange({
            ...start.crop,
            x: clamp(
              start.crop.x - ((event.clientX - start.x) / size) * start.crop.width,
              0,
              1 - start.crop.width,
            ),
            y: clamp(
              start.crop.y - ((event.clientY - start.y) / size) * start.crop.height,
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
          style={imageStyle(APERTURE_FRACTION, frame === 'banner' ? 8 : 12.5)}
        />
        <div className={styles.aperture({ frame })}>
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
        {frame === 'free'
          ? 'Drag to reposition, adjust crop size, or place the focal point inside the crop.'
          : frame === 'banner'
            ? 'Drag to reposition the 3:1 banner crop and place the focal point inside it.'
            : 'Drag to reposition, or focus the crop and use arrow keys. Portrait is fixed at 1:1.'}
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
      {frame === 'free' && (
        <div className={styles.row()}>
          <label htmlFor={`${id}-width`}>Width</label>
          <input
            id={`${id}-width`}
            className={styles.slider()}
            type="range"
            min={CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX / source.width}
            max={1}
            step={0.001}
            value={crop.width}
            onChange={(event) => changeFreeDimension('width', Number(event.target.value))}
          />
          <label htmlFor={`${id}-height`}>Height</label>
          <input
            id={`${id}-height`}
            className={styles.slider()}
            type="range"
            min={CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX / source.height}
            max={1}
            step={0.001}
            value={crop.height}
            onChange={(event) => changeFreeDimension('height', Number(event.target.value))}
          />
        </div>
      )}
      {frame === 'square' && (
        <div className={styles.previews()}>
          {[false, true].map((circle) => (
            <figure key={String(circle)}>
              <div className={styles.preview({ circle })}>
                <img src={src} alt="" className={styles.image()} style={imageStyle(1, 0)} />
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
