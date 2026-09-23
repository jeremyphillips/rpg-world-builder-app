'use client'

import { useId, useRef, useState } from 'react'
import {
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  resetPortraitCrop,
  type NormalizedCrop,
  type SourceDimensions,
} from '@rpg/contracts'
import { Button } from './button.client'
import { mediaCropStyles as styles } from './media-crop-editor.variants'

export type MediaCropEditorProps = {
  src: string
  source: SourceDimensions
  crop: NormalizedCrop
  onChange: (crop: NormalizedCrop) => void
}
const APERTURE_FRACTION = 0.75
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))

/** Controlled normalized crop editor; original bytes and persistence remain caller-owned. */
export function MediaCropEditor({ src, source, crop, onChange }: MediaCropEditorProps) {
  const id = useId()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const drag = useRef<{ x: number; y: number; crop: NormalizedCrop } | null>(null)
  const base = resetPortraitCrop(source)
  const zoom = base.width / crop.width
  const maxZoom = Math.min(source.width, source.height) / CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX
  function move(x: number, y: number) {
    onChange({
      ...crop,
      x: clamp(crop.x + x, 1 - crop.width),
      y: clamp(crop.y + y, 1 - crop.height),
    })
  }
  function changeZoom(value: number) {
    const nextZoom = Math.min(maxZoom, Math.max(1, value))
    const width = base.width / nextZoom
    const height = base.height / nextZoom
    onChange({
      width,
      height,
      x: clamp(crop.x + (crop.width - width) / 2, 1 - width),
      y: clamp(crop.y + (crop.height - height) / 2, 1 - height),
    })
  }
  const imageStyle = (scale: number, offset: number) => ({
    width: `${(100 * scale) / crop.width}%`,
    height: `${(100 * scale) / crop.height}%`,
    left: `${offset - (100 * scale * crop.x) / crop.width}%`,
    top: `${offset - (100 * scale * crop.y) / crop.height}%`,
  })
  return (
    <div className={styles.root()}>
      <div
        className={styles.viewport()}
        role="group"
        aria-label="Portrait crop position"
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
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x: event.clientX, y: event.clientY, crop }
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          const size = event.currentTarget.getBoundingClientRect().width * APERTURE_FRACTION
          if (!size) return
          onChange({
            ...start.crop,
            x: clamp(
              start.crop.x - ((event.clientX - start.x) / size) * start.crop.width,
              1 - start.crop.width,
            ),
            y: clamp(
              start.crop.y - ((event.clientY - start.y) / size) * start.crop.height,
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
          style={imageStyle(APERTURE_FRACTION, 12.5)}
        />
        <div className={styles.aperture()}>
          <div className={styles.guides()} />
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
        Drag to reposition, or focus the crop and use arrow keys. Portrait is fixed at 1:1.
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
    </div>
  )
}
