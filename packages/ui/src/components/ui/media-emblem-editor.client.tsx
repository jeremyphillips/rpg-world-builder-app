'use client'

import { useId, useRef } from 'react'
import {
  CONTENT_MEDIA_EMBLEM_PADDING_MAX,
  CONTENT_MEDIA_EMBLEM_SCALE_MIN,
  type ContainPresentation,
} from '@rpg/contracts'
import { mediaEmblemStyles as styles } from './media-emblem-editor.variants'

export type MediaEmblemEditorProps = {
  src: string
  layout: ContainPresentation
  onChange: (layout: ContainPresentation) => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Controlled emblem contain editor with padding, scale, and offset. */
export function MediaEmblemEditor({ src, layout, onChange }: MediaEmblemEditorProps) {
  const id = useId()
  const drag = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null)
  const innerFraction = 1 - 2 * layout.padding

  return (
    <div className={styles.root()}>
      <h3 className={styles.heading()}>Edit emblem</h3>
      <div
        className={styles.viewport()}
        role="group"
        aria-label="Emblem layout"
        aria-describedby={`${id}-instructions`}
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            offset: layout.offset ?? { x: 0, y: 0 },
          }
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
          const rect = event.currentTarget.getBoundingClientRect()
          const frameSize = rect.width * innerFraction * 0.75
          if (!frameSize) return
          onChange({
            ...layout,
            offset: {
              x: clamp(start.offset.x + (event.clientX - start.x) / frameSize, -0.5, 0.5),
              y: clamp(start.offset.y + (event.clientY - start.y) / frameSize, -0.5, 0.5),
            },
          })
        }}
      >
        <div className={styles.checkerboard()} aria-hidden="true" />
        <div className={styles.frame()}>
          <div
            className={styles.imageWrap()}
            style={{
              padding: `${layout.padding * 50}%`,
              transform: `scale(${layout.scale}) translate(${(layout.offset?.x ?? 0) * 100}%, ${(layout.offset?.y ?? 0) * 100}%)`,
            }}
          >
            <img src={src} alt="" draggable={false} className={styles.image()} />
          </div>
        </div>
      </div>
      <p id={`${id}-instructions`} className={styles.label()}>
        Scale and pad the image inside the frame. It stays fully visible and is not cropped.
      </p>
      <div className={styles.row()}>
        <label htmlFor={`${id}-padding`}>Padding</label>
        <input
          id={`${id}-padding`}
          className={styles.slider()}
          type="range"
          min={0}
          max={CONTENT_MEDIA_EMBLEM_PADDING_MAX}
          step={0.01}
          value={layout.padding}
          onChange={(event) =>
            onChange({ ...layout, padding: Number(event.target.value), offset: layout.offset })
          }
        />
        <label htmlFor={`${id}-scale`}>Scale</label>
        <input
          id={`${id}-scale`}
          className={styles.slider()}
          type="range"
          min={CONTENT_MEDIA_EMBLEM_SCALE_MIN}
          max={1}
          step={0.01}
          value={layout.scale}
          onChange={(event) =>
            onChange({ ...layout, scale: Number(event.target.value), offset: layout.offset })
          }
        />
      </div>
    </div>
  )
}
